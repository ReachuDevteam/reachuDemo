import React, {useEffect} from 'react';

import {Text, ActivityIndicator} from 'react-native';
import {useCreateCart} from '../../graphql/hooks/cart';
import {useCart} from '../../context/cartContext';

export const InitializationMain = ({children}) => {
  const {executeCreateCart, data, loading, error} = useCreateCart();
  const {
    state: {selectedCurrency, selectedCountry},
    dispatch,
  } = useCart();

  useEffect(() => {
    const initializeCart = async () => {
      const id = `customerSessionId-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}`;
      const customerSessionId = id;
      const currency = selectedCurrency || 'NOK';
      const shippingCountry = selectedCountry || 'NO';
      await executeCreateCart(customerSessionId, currency, shippingCountry);
    };

    initializeCart();
  }, [selectedCurrency, selectedCountry, executeCreateCart]);

  useEffect(() => {
    if (!loading && data) {
      const cartId = data.Cart.CreateCart.cart_id;
      dispatch({type: 'SET_CART_ID', payload: cartId});
    }
  }, [data, loading, dispatch]);

  if (loading) {
    return <ActivityIndicator />;
  }

  if (error) {
    console.error('Initialization error:', error);
    return <Text>Error initializing the app</Text>;
  }

  return <>{children}</>;
};
