import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Button } from '@rneui/themed';
import CheckBox from '@react-native-community/checkbox';
import { actions, useCart } from '../../../context/cartContext';
import { useUpdateCart } from '../../../graphql/hooks/cart';
import {
  useCreateCheckout,
  useUpdateCheckout,
} from '../../../graphql/hooks/checkout';
import { useUpdateItemToCart } from '../../../graphql/hooks/cartItem';
import { CartSummary } from './components/CartSummary';
import { ShippingAddressForm } from './components/ShippingAddressForm';
import { BillingAddressForm } from './components/BillingAddressForm';
import { CheckoutReview } from './components/CheckoutReview';
import { StepIndicator } from './components/StepIndicator';

const CartItem = ({ item, onRemove }) => {
  return (
    <View style={styles.cartItem}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.cartItemImage} />
      )}
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cartItemPrice}>
          {item.price ? `${item.price.amount} ${item.price.currency}` : 'N/A'}
        </Text>
        <Text style={styles.cartItemQuantity}>Quantity: {item.quantity}</Text>
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

export const CheckoutScreen = () => {
  const {
    state: { cartItems },
  } = useCart();

  const [currentStep, setCurrentStep] = useState(0);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [billingAddress, setBillingAddress] = useState(null);
  const [sameAsBillingAddress, setSameAsBillingAddress] = useState(true);
  const [email, setEmail] = useState('');

  // Steps for the checkout process
  const steps = [
    { title: 'Cart', completed: true },
    { title: 'Shipping', completed: currentStep > 0 },
    { title: 'Billing', completed: currentStep > 1 },
    { title: 'Review', completed: currentStep > 2 },
    { title: 'Payment', completed: false }
  ];

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleShippingSubmit = (data) => {
    setShippingAddress(data);
    setEmail(data.email);

    if (sameAsBillingAddress) {
      setBillingAddress(data);
      setCurrentStep(3); // Skip billing step and go directly to review
    } else {
      setCurrentStep(2); // Go to billing step
    }
  };

  const handleBillingSubmit = (data) => {
    setBillingAddress(data);
    setCurrentStep(3); // Go to review step (previous was 2)
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <CartSummary onNext={handleNext} />;
      case 1:
        return (
          <ShippingAddressForm
            onBack={handleBack}
            onSubmit={handleShippingSubmit}
            initialValues={shippingAddress}
            email={email}
            setEmail={setEmail}
            sameAsBillingAddress={sameAsBillingAddress}
            setSameAsBillingAddress={setSameAsBillingAddress}
          />
        );
      case 2:
        return (
          <BillingAddressForm
            onBack={handleBack}
            onSubmit={handleBillingSubmit}
            initialValues={billingAddress}
          />
        );
      case 3:
        return (
          <CheckoutReview
            onBack={handleBack}
            onSubmit={handleNext}
            shippingAddress={shippingAddress}
            billingAddress={billingAddress}
            email={email}
          />
        );
      default:
        return <CartSummary onNext={handleNext} />;
    }
  };

  return (
    <View style={styles.container}>
      <StepIndicator currentStep={currentStep} steps={steps} />
      {renderStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#000000',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 20,
  },
  continueShoppingButton: {
    padding: 12,
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  continueShoppingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartList: {
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemImage: {
    width: 70,
    height: 70,
    resizeMode: 'cover',
    borderRadius: 4,
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#000000',
    fontWeight: 'bold',
  },
  cartItemQuantity: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  removeButtonText: {
    fontSize: 24,
    color: '#FF0000',
    fontWeight: 'bold',
    lineHeight: 24,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  checkoutButton: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
