import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useCart, actions } from '../../../../context/cartContext';
import { Button } from '@rneui/themed';

const CartItem = ({ item, onRemove }) => {
    return (
        <View style={styles.cartItem}>
            {item.image && (
                <Image source={{ uri: item.image.url }} style={styles.cartItemImage} />
            )}
            <View style={styles.cartItemDetails}>
                <Text style={styles.cartItemTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={styles.cartItemPrice}>
                    {item.price ? `${item.price.amount} ${item.price.currency_code}` : 'N/A'}
                </Text>
                <Text style={styles.cartItemQuantity}>Quantity: {item.quantity}</Text>
            </View>
            <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
        </View>
    );
};

export const CartSummary = ({ onNext }) => {
    const {
        state: { cartItems },
        dispatch,
    } = useCart();

    const handleRemoveItem = (cartItemId) => {
        dispatch({ type: actions.REMOVE_CART_ITEM, payload: cartItemId });
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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Cart</Text>

            {cartItems.length === 0 ? (
                <View style={styles.emptyCart}>
                    <Text style={styles.emptyCartText}>Your cart is empty</Text>
                    <TouchableOpacity
                        style={styles.continueShoppingButton}
                        onPress={() => dispatch({ type: actions.SET_SELECTED_SCREEN, payload: 'Products' })}>
                        <Text style={styles.continueShoppingButtonText}>
                            Continue Shopping
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={cartItems}
                        keyExtractor={(item) => item.cartItemId}
                        renderItem={({ item }) => (
                            <CartItem
                                item={item}
                                onRemove={() => handleRemoveItem(item.cartItemId)}
                            />
                        )}
                        contentContainerStyle={styles.cartList}
                    />

                    <View style={styles.totalContainer}>
                        <Text style={styles.totalText}>Total:</Text>
                        <Text style={styles.totalAmount}>
                            {getTotalAmount().toFixed(2)} {getCurrency()}
                        </Text>
                    </View>

                    <Button
                        title="Proceed to Checkout"
                        onPress={onNext}
                        buttonStyle={styles.checkoutButton}
                        titleStyle={styles.checkoutButtonText}
                    />
                </>
            )}
        </View>
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
        marginBottom: 20,
    },
    checkoutButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
}); 