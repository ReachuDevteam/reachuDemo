import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCheckoutInitPaymentKlarna, useCreateCheckout } from '../../../../../graphql/hooks/checkout';
import { FAKE_RETURN_URL, REACHU_SERVER_URL } from '../../../../../consts/env';
import { useCart } from '../../../../../context/cartContext';

export const KlarnaPaymentButton = () => {
  const {
    state: { checkout, selectedCountry, cartId },
  } = useCart();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState(checkout?.email || '');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const { checkoutInitPaymentKlarna } = useCheckoutInitPaymentKlarna();
  const { createCheckout } = useCreateCheckout();

  const handleEmailSubmit = () => {
    if (email && email.includes('@')) {
      setShowEmailInput(false);
      initiatePaymentProcess();
    } else {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }
  };

  const initiatePayment = async () => {
    // First check if we have an email
    if (!email || !email.includes('@')) {
      console.log('[Klarna Payment] No valid email, showing input form');
      setShowEmailInput(true);
    } else {
      initiatePaymentProcess();
    }
  };

  const initiatePaymentProcess = async () => {
    try {
      console.log('[Klarna Payment] Payment initiation starting...');
      console.log('[Klarna Payment] Cart state:', {
        cartId,
        selectedCountry,
        checkoutEmail: checkout?.email,
        hasCheckout: !!checkout,
        userEmail: email,
      });

      setLoading(true);

      // First create the checkout
      console.log('[Klarna Payment] Creating checkout with cartId:', cartId);
      const checkoutData = await createCheckout(cartId);
      console.log('[Klarna Payment] Checkout created, ID:', checkoutData?.id);
      console.log('[Klarna Payment] Full checkout data:', JSON.stringify(checkoutData, null, 2));

      if (!checkoutData) {
        const errorMsg = 'Could not create checkout - no data returned';
        console.error('[Klarna Payment] Error:', errorMsg);
        Alert.alert('Error', errorMsg);
        setLoading(false);
        return;
      }

      // Log total amount from totals object
      if (checkoutData.totals) {
        console.log('[Klarna Payment] Checkout totals:', {
          currency: checkoutData.totals.currency_code,
          total: checkoutData.totals.total,
          subtotal: checkoutData.totals.subtotal,
          taxes: checkoutData.totals.taxes,
          tax_rate: checkoutData.totals.tax_rate,
          shipping: checkoutData.totals.shipping,
          discounts: checkoutData.totals.discounts,
        });
      } else {
        console.warn('[Klarna Payment] No totals object in checkout response');
      }

      // Check for available payment methods
      if (checkoutData.available_payment_methods &&
        checkoutData.available_payment_methods.length > 0) {
        console.log('[Klarna Payment] Available payment methods:',
          checkoutData.available_payment_methods.map(m => m.name).join(', ')
        );

        // Check if Klarna is available
        const klarnaAvailable = checkoutData.available_payment_methods.some(
          method => method.name === 'Klarna'
        );
        if (!klarnaAvailable) {
          console.warn('[Klarna Payment] Klarna payment method not available!');
        }
      } else {
        console.warn('[Klarna Payment] No available payment methods returned');
      }

      // Ensure country code is properly formatted
      const countryCode = (selectedCountry || 'us').toUpperCase();
      console.log('[Klarna Payment] Using country code:', countryCode);
      console.log('[Klarna Payment] Using email for payment:', email);

      // Then initialize Klarna payment
      console.log('[Klarna Payment] Initializing Klarna payment with params:', {
        checkoutId: checkoutData.id,
        countryCode,
        href: FAKE_RETURN_URL,
        email: email,
      });

      const result = await checkoutInitPaymentKlarna(
        checkoutData.id,
        countryCode,
        FAKE_RETURN_URL,
        email,
      );

      console.log('[Klarna Payment] Payment initialization result:', JSON.stringify(result, null, 2));

      if (result?.order_id) {
        console.log('[Klarna Payment] Successfully received order ID:', result.order_id);

        const klarnaUrl = `${REACHU_SERVER_URL}/api/checkout/${checkoutData.id}/payment-klarna-html-body`;
        console.log('[Klarna Payment] Setting WebView URL:', klarnaUrl);

        setOrderId(result.order_id);
        setUrl(klarnaUrl);
        setShowWebView(true);
      } else {
        console.error('[Klarna Payment] Missing order_id in response');
        Alert.alert('Error', 'Payment initialization failed - missing order information');
      }
    } catch (error) {
      console.error('[Klarna Payment] Payment initiation error:', error);
      console.error('[Klarna Payment] Error details:', JSON.stringify({
        name: error.name,
        message: error.message,
        networkError: error.networkError,
        graphQLErrors: error.graphQLErrors,
      }, null, 2));
      Alert.alert('Error', 'Could not initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavigationChange = event => {
    console.log('[Klarna Payment] WebView navigation:', event.url);

    const returnUrl = `${FAKE_RETURN_URL}?order_id=${orderId}&payment_processor=KLARNA`;
    if (event.url.includes(returnUrl)) {
      console.log('[Klarna Payment] Payment successful, detected return URL');
      setShowWebView(false);
      setPaymentSuccess(true);
    }
  };

  return (
    <View style={styles.container}>
      {!paymentSuccess && !showEmailInput && (
        <TouchableOpacity style={styles.payButton} onPress={initiatePayment}>
          <Text style={styles.payButtonText}>Pay with Klarna</Text>
        </TouchableOpacity>
      )}

      {showEmailInput && (
        <View style={styles.emailContainer}>
          <Text style={styles.label}>Enter your email address:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.payButton} onPress={handleEmailSubmit}>
            <Text style={styles.payButtonText}>Continue to Payment</Text>
          </TouchableOpacity>
        </View>
      )}

      {showWebView && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={showWebView}
          onRequestClose={() => {
            console.log('[Klarna Payment] User closed payment modal');
            setShowWebView(false);
          }}>
          <WebView
            source={{ uri: url }}
            onLoad={() => {
              console.log('[Klarna Payment] WebView loaded URL:', url);
              setLoading(false);
            }}
            onNavigationStateChange={handleWebViewNavigationChange}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('[Klarna Payment] WebView error:', JSON.stringify(nativeEvent, null, 2));
            }}
            style={{ marginTop: 20 }}
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#0000ff" size="large" />
            </View>
          )}
        </Modal>
      )}

      {paymentSuccess && (
        <View style={styles.successContainer}>
          <Icon name="check-circle" size={60} color="#4CAF50" />
          <Text style={styles.successText}>Payment Successful!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
  },
  payButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  successText: {
    fontSize: 18,
    color: '#4CAF50',
    marginTop: 10,
  },
  emailContainer: {
    width: '100%',
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
});
