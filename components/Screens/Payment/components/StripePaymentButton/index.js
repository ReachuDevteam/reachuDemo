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
import { useCart } from '../../../../../context/cartContext';
import { useCheckoutInitPaymentStripe, useCreateCheckout } from '../../../../../graphql/hooks/checkout';
import { FAKE_RETURN_URL } from '../../../../../consts/env';

export const StripePaymentButton = () => {
  const {
    state: { checkout, cartId },
  } = useCart();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [_, setOrderId] = useState(-1);
  const [email, setEmail] = useState(checkout?.email || '');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const { checkoutInitPaymentStripe } = useCheckoutInitPaymentStripe();
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
      console.log('[Stripe Payment] No valid email, showing input form');
      setShowEmailInput(true);
    } else {
      initiatePaymentProcess();
    }
  };

  const initiatePaymentProcess = async () => {
    try {
      console.log('[Stripe Payment] Payment initiation starting...');
      console.log('[Stripe Payment] Cart state:', {
        cartId,
        checkoutEmail: checkout?.email,
        hasCheckout: !!checkout,
        userEmail: email,
      });

      setLoading(true);

      // First create the checkout
      console.log('[Stripe Payment] Creating checkout with cartId:', cartId);
      const checkoutData = await createCheckout(cartId);
      console.log('[Stripe Payment] Checkout created, ID:', checkoutData?.id);
      console.log('[Stripe Payment] Full checkout data:', JSON.stringify(checkoutData, null, 2));

      if (!checkoutData) {
        const errorMsg = 'Could not create checkout - no data returned';
        console.error('[Stripe Payment] Error:', errorMsg);
        Alert.alert('Error', errorMsg);
        setLoading(false);
        return;
      }

      // Log total amount from totals object
      if (checkoutData.totals) {
        console.log('[Stripe Payment] Checkout totals:', {
          currency: checkoutData.totals.currency_code,
          total: checkoutData.totals.total,
          subtotal: checkoutData.totals.subtotal,
          taxes: checkoutData.totals.taxes,
          tax_rate: checkoutData.totals.tax_rate,
          shipping: checkoutData.totals.shipping,
          discounts: checkoutData.totals.discounts,
        });
      } else {
        console.warn('[Stripe Payment] No totals object in checkout response');
      }

      // Check for available payment methods
      if (checkoutData.available_payment_methods &&
        checkoutData.available_payment_methods.length > 0) {
        console.log('[Stripe Payment] Available payment methods:',
          checkoutData.available_payment_methods.map(m => m.name).join(', ')
        );
      } else {
        console.warn('[Stripe Payment] No available payment methods returned');
      }

      // Make sure we have a valid email address
      console.log('[Stripe Payment] Using email for payment:', email);

      // Then initialize Stripe payment
      console.log('[Stripe Payment] Initializing Stripe payment with params:', {
        email: email,
        paymentMethod: 'Stripe',
        successUrl: FAKE_RETURN_URL,
        checkoutId: checkoutData.id,
      });

      const result = await checkoutInitPaymentStripe(
        email,
        'Stripe',
        FAKE_RETURN_URL,
        checkoutData.id,
      );

      console.log('[Stripe Payment] Payment initialization result:', JSON.stringify(result, null, 2));

      if (result?.order_id) {
        console.log('[Stripe Payment] Successfully received order ID and URL:', {
          orderId: result.order_id,
          checkoutUrl: result.checkout_url,
        });
        setOrderId(result.order_id);
        setUrl(result.checkout_url);
        setShowWebView(true);
      } else {
        console.error('[Stripe Payment] Missing order_id or checkout_url in response');
        Alert.alert('Error', 'Payment initialization failed - missing order information');
      }
    } catch (error) {
      console.error('[Stripe Payment] Payment initiation error:', error);
      console.error('[Stripe Payment] Error details:', JSON.stringify({
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
    console.log('[Stripe Payment] WebView navigation:', event.url);

    if (event.url.includes(FAKE_RETURN_URL)) {
      console.log('[Stripe Payment] Payment successful, detected return URL');
      setShowWebView(false);
      setPaymentSuccess(true);
    }
  };

  return (
    <View style={styles.container}>
      {!paymentSuccess && !showEmailInput && (
        <TouchableOpacity style={styles.payButton} onPress={initiatePayment}>
          <Text style={styles.payButtonText}>Pay with Stripe SDK</Text>
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
            console.log('[Stripe Payment] User closed payment modal');
            setShowWebView(false);
          }}>
          <WebView
            source={{ uri: url }}
            onLoad={() => {
              console.log('[Stripe Payment] WebView loaded URL:', url);
              setLoading(false);
            }}
            onNavigationStateChange={handleWebViewNavigationChange}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('[Stripe Payment] WebView error:', JSON.stringify(nativeEvent, null, 2));
            }}
            // eslint-disable-next-line react-native/no-inline-styles
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
