import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useCart, actions } from '../../../context/cartContext';
import { RadioButton } from 'react-native-paper';
import { StripePaymentButton } from './components/StripePaymentButton';
import { KlarnaPaymentButton } from './components/KlarnaPaymentButton';
import { Button } from '@rneui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const PaymentScreen = () => {
  const {
    state: { cartItems, checkout, selectedCurrency },
    dispatch,
  } = useCart();
  const [selectedProvider, setSelectedProvider] = useState('stripe');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if checkout exists and has necessary data
    if (!checkout || !checkout.id) {
      Alert.alert(
        'Checkout Information Missing',
        'Please complete the checkout process first.',
        [
          {
            text: 'Go to Checkout',
            onPress: () => dispatch({ type: actions.SET_SELECTED_SCREEN, payload: 'Checkout' })
          }
        ]
      );
    }
  }, []);

  const providers = [
    { id: 'stripe', title: 'Stripe', component: StripePaymentButton },
    { id: 'klarna', title: 'Klarna', component: KlarnaPaymentButton },
  ];

  const { email, billingAddress, shippingAddress } = checkout || {};

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.price ? item.price.amount * item.quantity : 0;
      return total + itemTotal;
    }, 0);
  };

  const getCurrency = () => {
    return cartItems.length > 0 && cartItems[0].price
      ? cartItems[0].price.currency_code
      : selectedCurrency || '';
  };

  const renderPaymentButton = _providers => {
    const __provider = _providers.find(
      provider => provider.id === selectedProvider,
    );
    if (!__provider) {
      return <></>;
    }

    const PaymentButtonComponent = __provider.component;
    return <PaymentButtonComponent />;
  };

  const renderProductItem = (item) => (
    <View style={styles.productItem} key={item.cartItemId}>
      {item.image && (
        <Image source={{ uri: item.image.url }} style={styles.productImage} />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.productQuantityPrice}>
          {`${item.quantity} × ${getCurrency()} ${item.price ? item.price.amount : 0}`}
        </Text>
      </View>
    </View>
  );

  // Helper function to safely render address information
  const renderAddress = (address) => {
    if (!address) return 'Not provided';

    const firstName = address.first_name || '';
    const lastName = address.last_name || '';
    const addressLine = address.address1 || '';
    const city = address.city || '';
    const zip = address.zip || '';
    const country = address.country || '';

    return `${firstName} ${lastName}, ${addressLine}, ${city} ${zip}, ${country}`;
  };

  const handleBackToCheckout = () => {
    dispatch({ type: actions.SET_SELECTED_SCREEN, payload: 'Checkout' });
  };

  if (!checkout || !checkout.id) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorText}>Checkout information missing</Text>
        <Button
          title="Go to Checkout"
          onPress={handleBackToCheckout}
          buttonStyle={styles.backButton}
          titleStyle={styles.backButtonText}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToCheckout} style={styles.backButtonContainer}>
          <Icon name="arrow-back" size={24} color="#000000" />
          <Text style={styles.backText}>Back to Checkout</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoContent}>{email || 'Not provided'}</Text>
        </View>

        <View style={styles.addressSection}>
          <View style={styles.addressCol}>
            <Text style={styles.infoLabel}>Shipping Address:</Text>
            <Text style={styles.infoContent}>{renderAddress(shippingAddress)}</Text>
          </View>

          <View style={styles.addressCol}>
            <Text style={styles.infoLabel}>Billing Address:</Text>
            <Text style={styles.infoContent}>{renderAddress(billingAddress)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Products</Text>
        <View style={styles.productsList}>
          {cartItems.map(item => renderProductItem(item))}
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalTitle}>Total:</Text>
          <Text style={styles.totalAmount}>
            {getCurrency()} {getTotalAmount().toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        {providers.map(provider => (
          <TouchableOpacity
            key={provider.id}
            style={[
              styles.providerOption,
              selectedProvider === provider.id && styles.selectedProvider
            ]}
            onPress={() => setSelectedProvider(provider.id)}>
            <Text style={styles.providerText}>{provider.title}</Text>
            <RadioButton
              value={provider.id}
              status={selectedProvider === provider.id ? 'checked' : 'unchecked'}
              onPress={() => setSelectedProvider(provider.id)}
              color="#007BFF"
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.paymentButtonContainer}>
        {renderPaymentButton(providers)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 30,
  },
  section: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#555555',
    marginBottom: 5,
  },
  infoContent: {
    color: '#333333',
    fontSize: 15,
  },
  addressSection: {
    flexDirection: 'row',
    marginTop: 10,
  },
  addressCol: {
    flex: 1,
    marginRight: 10,
  },
  productsList: {
    marginBottom: 15,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 5,
  },
  productQuantityPrice: {
    fontSize: 14,
    color: '#666666',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  totalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  providerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedProvider: {
    borderColor: '#007BFF',
    backgroundColor: '#F0F8FF',
  },
  providerText: {
    fontSize: 16,
    color: '#333333',
  },
  paymentButtonContainer: {
    marginTop: 10,
    marginBottom: 40,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#555555',
    textAlign: 'center',
    marginVertical: 20,
  },
  backButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
