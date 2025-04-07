import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Button} from '@rneui/themed';
import CheckBox from '@react-native-community/checkbox';
import {useCart, actions} from '../../../../context/cartContext';
import {useGetCartShippingOptions} from '../../../../graphql/hooks/cart';
import {
  useCreateCheckout,
  useUpdateCheckout,
} from '../../../../graphql/hooks/checkout';
import {useUpdateItemToCart} from '../../../../graphql/hooks/cartItem';

const AddressSummary = ({title, address}) => {
  if (!address) {
    return null;
  }

  return (
    <View style={styles.addressContainer}>
      <Text style={styles.addressTitle}>{title}</Text>
      <Text style={styles.addressText}>
        {address.first_name} {address.last_name}
      </Text>
      <Text style={styles.addressText}>{address.address1}</Text>
      {address.address2 ? (
        <Text style={styles.addressText}>{address.address2}</Text>
      ) : null}
      <Text style={styles.addressText}>
        {address.city}, {address.zip}
      </Text>
      <Text style={styles.addressText}>{address.country}</Text>
      <Text style={styles.addressText}>
        {address.phone_code} {address.phone}
      </Text>
    </View>
  );
};

export const CheckoutReview = ({
  onBack,
  onSubmit,
  shippingAddress,
  billingAddress,
  email,
}) => {
  const {
    state: {selectedCountry, cartId, cartItems, selectedCurrency},
    dispatch,
  } = useCart();

  const [acceptsTermsConditions, setAcceptsTermsConditions] = useState(true);
  const [acceptsPurchaseConditions, setAcceptsPurchaseConditions] =
    useState(true);
  const [loading, setLoading] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const {getCartShippingOptions} = useGetCartShippingOptions();
  const {createCheckout} = useCreateCheckout();
  const {updateCheckout} = useUpdateCheckout();
  const {updateItemToCart} = useUpdateItemToCart();

  const findShippingCountryId = (
    _countryCode,
    _currencyCode,
    productShipping,
  ) => {
    console.log('_countryCode', _countryCode);
    console.log('_currencyCode', _currencyCode);
    console.log('productShipping', productShipping);

    if (!productShipping) {
      return null;
    }

    for (let shippingInfo of productShipping) {
      let shippingCountries = shippingInfo.shipping_country;
      console.log('productShipping', shippingCountries);

      if (shippingCountries) {
        for (const _country of shippingCountries) {
          const countryInfo = _country;
          console.log('countryInfo', _country);

          if (
            countryInfo.country.toUpperCase() === _countryCode.toUpperCase() &&
            countryInfo.currency_code.toUpperCase() ===
              _currencyCode.toUpperCase()
          ) {
            return countryInfo.id;
          }
        }
      }
    }

    return null;
  };

  const validateCheckoutData = () => {
    if (!cartId) {
      Alert.alert('Error', 'No cart ID found. Please try again.');
      return false;
    }

    if (!shippingAddress) {
      Alert.alert('Error', 'Shipping address information is missing.');
      return false;
    }

    if (!billingAddress) {
      Alert.alert('Error', 'Billing address information is missing.');
      return false;
    }

    if (!email) {
      Alert.alert('Error', 'Email address is missing.');
      return false;
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty.');
      return false;
    }

    return true;
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.price ? item.price.amount * item.quantity : 0;
      return total + itemTotal;
    }, 0);
  };

  const getCurrency = () => {
    return cartItems.length > 0 && cartItems[0].price
      ? cartItems[0].price.currency_code
      : '';
  };

  const handleCheckout = async () => {
    if (!acceptsTermsConditions || !acceptsPurchaseConditions) {
      setTermsError(true);
      return;
    }

    if (!validateCheckoutData()) {
      return;
    }

    setTermsError(false);
    setLoading(true);

    try {
      console.log('cartItems', JSON.stringify(cartItems));
      console.log('[Review] Starting checkout process');
      console.log('[Review] Cart ID:', cartId);
      console.log('[Review] Email:', email);
      console.log('[Review] Selected Country:', selectedCountry);

      const cartShippingData = await getCartShippingOptions(
        cartId,
        billingAddress.country_code,
      );

      // 2. Update each cart item with proper shipping
      for (const cartItem of cartItems) {
        const itemShipping = cartShippingData.line_items.find(
          item => item.id === cartItem.cartItemId,
        );

        const availableShipping = itemShipping?.available_shippings?.find(
          shipping => shipping.country_code === billingAddress.country_code,
        );

        if (availableShipping?.id) {
          await updateItemToCart(
            cartId,
            cartItem.cartItemId,
            null,
            availableShipping.id,
          );
          console.log(
            '[Review] Updated cart item shipping with ID:',
            availableShipping.id,
          );
        } else {
          console.error(
            `[Review] No available shipping found for item: ${cartItem.cartItemId}`,
          );
        }
      }

      // 3. Create a new checkout
      console.log('[Review] Creating checkout with cartId:', cartId);
      const newCheckout = await createCheckout(cartId);
      console.log('[Review] Checkout created with ID:', newCheckout.id);

      // 4. Update the checkout with addresses and terms acceptance
      console.log('[Review] Updating checkout with addresses and terms');
      console.log('[Review] Email being used:', email);

      console.log('[Review] before update checkout :', {
        newCheckoutID: newCheckout.id,
        email,
        billingAddress,
        shippingAddress,
        acceptsTermsConditions,
        acceptsPurchaseConditions,
      });

      await updateCheckout(
        newCheckout.id,
        email,
        billingAddress,
        shippingAddress,
        acceptsTermsConditions,
        acceptsPurchaseConditions,
      );

      // 5. Save checkout in context
      dispatch({
        type: actions.SET_CHECKOUT_STATE,
        payload: {
          id: newCheckout?.id,
          email: email,
          billingAddress: billingAddress,
          shippingAddress: shippingAddress,
        },
      });

      console.log('[Review] Checkout complete, proceeding to payment');
      onSubmit();

      // 6. Navigate to payment (handled in parent component)
      dispatch({
        type: actions.SET_SELECTED_SCREEN,
        payload: 'Payment',
      });
    } catch (error) {
      console.error('[Review] Error during checkout process:', error);
      Alert.alert(
        'Checkout Error',
        'An error occurred during checkout. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Review Your Order</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <Text style={styles.emailText}>{email}</Text>
      </View>

      <View style={styles.addressesSection}>
        <AddressSummary title="Shipping Address" address={shippingAddress} />
        <AddressSummary title="Billing Address" address={billingAddress} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>

        <View style={styles.cartItems}>
          {cartItems.map(item => (
            <View key={item.cartItemId} style={styles.cartItem}>
              {item.image && (
                <Image
                  source={{uri: item.image.url}}
                  style={styles.cartItemImage}
                />
              )}
              <View style={styles.cartItemDetails}>
                <Text style={styles.cartItemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.cartItemQuantity}>
                  Qty: {item.quantity}
                </Text>
                <Text style={styles.cartItemPrice}>
                  {item.price ? `${item.price.amount} ${getCurrency()}` : 'N/A'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalAmount}>
            {getTotalAmount().toFixed(2)} {getCurrency()}
          </Text>
        </View>
      </View>

      <View style={styles.termsSection}>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={acceptsTermsConditions}
            onValueChange={setAcceptsTermsConditions}
            tintColors={{
              true: '#007BFF',
              false: termsError ? '#FF3B30' : '#757575',
            }}
          />
          <Text
            style={[
              styles.checkboxLabel,
              termsError && !acceptsTermsConditions && styles.errorText,
            ]}>
            I accept the Terms and Conditions
          </Text>
        </View>

        <View style={styles.checkboxContainer}>
          <CheckBox
            value={acceptsPurchaseConditions}
            onValueChange={setAcceptsPurchaseConditions}
            tintColors={{
              true: '#007BFF',
              false: termsError ? '#FF3B30' : '#757575',
            }}
          />
          <Text
            style={[
              styles.checkboxLabel,
              termsError && !acceptsPurchaseConditions && styles.errorText,
            ]}>
            I accept the Purchase Conditions
          </Text>
        </View>

        {termsError && (
          <Text style={styles.errorText}>
            You must accept both the Terms and Purchase Conditions to proceed
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Back"
          onPress={onBack}
          buttonStyle={styles.backButton}
          titleStyle={styles.backButtonText}
          type="outline"
          disabled={loading}
        />
        <Button
          title={loading ? 'Processing...' : 'Proceed to Payment'}
          onPress={handleCheckout}
          buttonStyle={styles.continueButton}
          titleStyle={styles.continueButtonText}
          disabled={loading}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#000000',
  },
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  emailText: {
    fontSize: 16,
    color: '#333333',
  },
  addressesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 16,
  },
  addressContainer: {
    flex: 1,
    paddingRight: 10,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  addressText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  cartItems: {
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cartItemImage: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
    borderRadius: 4,
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  cartItemQuantity: {
    fontSize: 14,
    color: '#666666',
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
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
  termsSection: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  backButton: {
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
