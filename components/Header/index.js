import React, {useState} from 'react';
import {Header, Badge, Icon} from '@rneui/themed';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Image} from '@rneui/base/dist/Image/Image';
import {SELECT_CURRENCY} from '../../consts/env';
import {useCart} from '../../context/cartContext';
import CartSummaryModal from './CartSummaryModal';

const AppHeader = ({title}) => {
  const {
    state: {cartItems},
  } = useCart();
  const countSelectProducts = cartItems.length;
  const countryFlag = require('../../images/flags/no.png');
  const [isCartSummaryVisible, setIsCartSummaryVisible] = useState(false);

  const toggleCartSummaryModal = () => {
    setIsCartSummaryVisible(!isCartSummaryVisible);
  };

  return (
    <>
      <Header
        centerComponent={{
          text: title,
          style: styles.centerComponentStyle,
        }}
        leftComponent={
          <TouchableOpacity onPress={toggleCartSummaryModal}>
            <View style={styles.leftComponentContainer}>
              <Icon
                name="shopping-cart"
                type="font-awesome"
                color="#fff"
                size={24}
              />
              <View style={styles.badgeContainer}>
                <Badge
                  value={countSelectProducts}
                  status="error"
                  textStyle={styles.badgeTextStyle}
                />
              </View>
            </View>
          </TouchableOpacity>
        }
        rightComponent={
          <View style={styles.leftComponentContainer}>
            <View>
              <Image source={countryFlag} style={styles.flagStyle} />
            </View>
            <View>
              <Badge
                value={SELECT_CURRENCY}
                status="warning"
                textStyle={styles.badgeCurrencyTextStyle}
              />
            </View>
          </View>
        }
        backgroundColor="#007bff"
      />
      <CartSummaryModal
        isVisible={isCartSummaryVisible}
        onClose={toggleCartSummaryModal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  centerComponentStyle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  leftComponentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    right: -15,
    top: -3,
    zIndex: 1,
  },
  badgeTextStyle: {
    fontSize: 10,
    color: 'white',
  },

  badgeCurrencyTextStyle: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  flagStyle: {
    width: 30,
    height: 20,
    marginRight: 6,
  },
});

export default AppHeader;
