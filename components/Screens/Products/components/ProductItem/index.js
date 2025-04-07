import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {Icon} from '@rneui/themed';
import ProductDetailModal from '../ProductDetail';
import {actions, useCart} from '../../../../../context/cartContext';
import {CartItem} from '../../../../../models/productItem';
import {
  useCreateItemToCart,
  useRemoveItemFromCart,
} from '../../../../../graphql/hooks/cartItem';

const ProductItem = ({product}) => {
  const {
    state: {selectedCurrency, cartId, cartItems},
    dispatch,
  } = useCart();
  const _useCreateItemToCart = useCreateItemToCart();
  const _useRemoveItemFromCart = useRemoveItemFromCart();

  const [quantity, setQuantity] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const isInCart = cartItems.find(item => item.productId === product.id);

  const handleIncrement = cartItem => {
    if (!cartItem) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = cartItem => {
    if (!cartItem) {
      setQuantity(prev => (prev > 1 ? prev - 1 : 1));
    }
  };
  const handleAddToCart = async (_product, currency, _cartId) => {
    try {
      setLoading(true);

      const cartItem = new CartItem({
        title: _product.title,
        currency: currency,
        productId: _product.id,
        quantity: quantity,
        unitPrice: parseFloat(_product.price),
        tax: 0,
        image: _product.imageUrl,
        productShipping: _product.productShipping,
        cartItemId: '',
      });

      const lineItems = [
        {
          product_id: cartItem.productId,
          quantity: cartItem.quantity,
          price_data: {
            currency: cartItem.currency,
            tax: cartItem.tax,
            unit_price: cartItem.unitPrice,
          },
        },
      ];

      const result = await _useCreateItemToCart.createItemToCart(
        _cartId,
        lineItems,
      );

      if (Array.isArray(result?.line_items)) {
        const matchingLineItem = result.line_items.find(
          item => +item.product_id === cartItem.productId,
        );
        if (matchingLineItem?.id) {
          cartItem.cartItemId = matchingLineItem.id;
          cartItem.available_shippings = matchingLineItem.available_shippings;
          dispatch({type: actions.ADD_CART_ITEM, payload: cartItem});
        }
      } else {
        throw new Error('Product could not be added to cart.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveToCart = async (cartItemId, _cartId) => {
    try {
      setLoading(true);
      const result = await _useRemoveItemFromCart.removeItemFromCart(
        _cartId,
        cartItemId,
      );
      if (result != null) {
        dispatch({type: actions.REMOVE_CART_ITEM, payload: cartItemId});
      } else {
        throw new Error('Error removing product from cart: result is null');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View style={styles.card}>
        <Image source={{uri: product.imageUrl}} style={styles.productImage} />
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{product.title}</Text>
          <Text
            style={
              styles.price
            }>{`${product.price} ${product.currencyCode}`}</Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              disabled={!!isInCart}
              onPress={() => handleDecrement(isInCart)}
              style={[
                styles.quantityButton,
                isInCart && styles.disabledButton,
              ]}>
              <Icon
                name="minus-circle"
                type="font-awesome"
                size={20}
                color={isInCart ? '#ccc' : '#007bff'}
              />
            </TouchableOpacity>
            <Text style={styles.quantityText}>
              {isInCart ? isInCart.quantity : quantity}
            </Text>
            <TouchableOpacity
              disabled={!!isInCart}
              onPress={() => handleIncrement(isInCart)}
              style={[
                styles.quantityButton,
                isInCart && styles.disabledButton,
              ]}>
              <Icon
                name="plus-circle"
                type="font-awesome"
                size={20}
                color={isInCart ? '#ccc' : '#007bff'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={
                isInCart ? styles.removeToCartButton : styles.detailsButton
              }>
              <Text
                style={styles.buttonText}
                onPress={() =>
                  isInCart
                    ? handleRemoveToCart(isInCart.cartItemId, cartId)
                    : handleAddToCart(product, selectedCurrency, cartId)
                }>
                {isInCart ? 'Remove to cart' : 'Add to cart'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => setModalVisible(true)}>
              <Text style={styles.buttonText}>Detail</Text>
            </TouchableOpacity>
          </View>
        </View>
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      </View>

      <ProductDetailModal
        productId={product.id}
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 50,
  },
  infoContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: '#555',
    marginVertical: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },

  quantityText: {
    fontSize: 15,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  detailsButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 7,
    flexGrow: 1,
    marginRight: 10,
  },
  addToCartButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 7,
    flexGrow: 2,
  },
  removeToCartButton: {
    backgroundColor: 'red',
    borderRadius: 5,
    padding: 7,
    flexGrow: 2,
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});

export default ProductItem;
