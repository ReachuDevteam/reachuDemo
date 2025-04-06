import React from 'react';
import { View, StyleSheet } from 'react-native';
import ProductList from '../../ProductList';

export const ProductsScreen = () => {
  return (
    <View style={styles.container}>
      <ProductList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
