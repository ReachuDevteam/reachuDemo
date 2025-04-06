import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useGetProductDetails } from '../../graphql/hooks/productDetails';
import { useAddItemToCart } from '../../graphql/hooks/cart';
import { useCart } from '../../context/cartContext';
import HTML from 'react-native-render-html';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Función para capitalizar la primera letra de cada palabra
const titleCase = (str) => {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const QuantitySelector = ({ quantity, onIncrease, onDecrease }) => {
    return (
        <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={onDecrease}
                    disabled={quantity <= 1}
                >
                    <Text style={[styles.quantityButtonText, quantity <= 1 && styles.quantityButtonDisabled]}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={onIncrease}
                >
                    <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const ProductDetail = ({ productId, onBack }) => {
    const { productDetails, loading, error, refreshProductDetails } = useGetProductDetails(productId);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const { executeAddItemToCart, loading: addingToCart } = useAddItemToCart();
    const { state, dispatch } = useCart();

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#000000" />
            </View>
        );
    }

    if (error) {
        console.error('Error fetching product details:', error);
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Error loading product details.</Text>
                <TouchableOpacity onPress={refreshProductDetails} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!productDetails) {
        return (
            <View style={styles.centered}>
                <Text>Product not found.</Text>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Usar la primera variante como predeterminada si no hay una seleccionada
    const currentVariant = selectedVariant ||
        (productDetails.variants && productDetails.variants.length > 0
            ? productDetails.variants[0]
            : null);

    // Obtener la imagen de la variante seleccionada o imágenes del producto principal
    const variantImage = currentVariant && currentVariant.images && currentVariant.images.length > 0
        ? currentVariant.images[0].url
        : null;

    const productImage = productDetails.images && productDetails.images.length > 0
        ? productDetails.images[0].url
        : null;

    // Usar la imagen de la variante si está disponible, si no, usar la imagen del producto
    const imageToShow = variantImage || productImage;

    // Obtener el precio correcto
    const price = currentVariant && currentVariant.price && currentVariant.price.amount_incl_taxes
        ? {
            amount: currentVariant.price.amount_incl_taxes,
            currency: currentVariant.price.currency_code
        }
        : productDetails.price && productDetails.price.amount_incl_taxes
            ? {
                amount: productDetails.price.amount_incl_taxes,
                currency: productDetails.price.currency_code
            }
            : null;

    const handleAddToCart = async () => {
        if (!state.cartId) {
            Alert.alert("Error", "Cart not initialized. Please try again later.");
            return;
        }

        try {
            const variantId = currentVariant ? currentVariant.id : null;
            await executeAddItemToCart(state.cartId, productDetails, quantity, variantId);

            // Add to local state
            const newItem = {
                cartItemId: Date.now().toString(),
                productId: productDetails.id,
                variantId: variantId,
                title: productDetails.title,
                price: price,
                quantity: quantity,
                image: imageToShow,
            };

            dispatch({ type: 'ADD_CART_ITEM', payload: newItem });

            Alert.alert(
                "Success",
                `${productDetails.title} has been added to your cart.`,
                [
                    {
                        text: "Continue Shopping",
                        onPress: () => onBack(),
                        style: "cancel"
                    },
                    {
                        text: "View Cart",
                        onPress: () => {
                            dispatch({ type: 'SET_SELECTED_SCREEN', payload: 'Checkout' });
                            onBack();
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert("Error", "Failed to add product to cart. Please try again.");
        }
    };

    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={onBack} style={styles.backButtonSmall}>
                <Text style={styles.backButtonTextSmall}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>{titleCase(productDetails.title)}</Text>

            {imageToShow ? (
                <Image source={{ uri: imageToShow }} style={styles.productImage} />
            ) : (
                <View style={styles.placeholderImage}>
                    <Text>No Image Available</Text>
                </View>
            )}

            <View style={styles.priceContainer}>
                {price ? (
                    <Text style={styles.price}>{price.amount} {price.currency}</Text>
                ) : (
                    <Text style={styles.price}>Price not available</Text>
                )}
                {currentVariant && currentVariant.sku && (
                    <Text style={styles.sku}>SKU: {currentVariant.sku}</Text>
                )}
            </View>

            {productDetails.description && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <HTML
                        source={{ html: productDetails.description }}
                        contentWidth={width - 32}
                        tagsStyles={{
                            p: { fontSize: 16, lineHeight: 24, color: '#000000' },
                            li: { fontSize: 16, lineHeight: 24, color: '#000000' },
                            ul: { paddingLeft: 20 },
                            ol: { paddingLeft: 20 },
                            a: { color: '#000000', textDecorationLine: 'underline' },
                        }}
                    />
                </View>
            )}

            {productDetails.variants && productDetails.variants.length > 1 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Variants</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.variantsScroll}>
                        {productDetails.variants.map((variant) => (
                            <TouchableOpacity
                                key={variant.id}
                                style={[
                                    styles.variantItem,
                                    selectedVariant && selectedVariant.id === variant.id && styles.selectedVariant,
                                ]}
                                onPress={() => setSelectedVariant(variant)}>
                                <Text style={styles.variantTitle}>{titleCase(variant.title)}</Text>
                                {variant.price && variant.price.amount_incl_taxes && (
                                    <Text style={styles.variantPrice}>
                                        {variant.price.amount_incl_taxes} {variant.price.currency_code}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            <QuantitySelector
                quantity={quantity}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
            />

            <TouchableOpacity
                style={styles.addToCartButton}
                onPress={handleAddToCart}
                disabled={addingToCart}
            >
                {addingToCart ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                    <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    errorText: {
        color: '#FF0000',
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#000000',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    backButton: {
        backgroundColor: '#000000',
        padding: 10,
        borderRadius: 5,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    backButtonSmall: {
        padding: 8,
        marginBottom: 16,
    },
    backButtonTextSmall: {
        fontSize: 16,
        color: '#000000',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#000000',
    },
    productImage: {
        width: '100%',
        height: 300,
        resizeMode: 'contain',
        marginBottom: 20,
        borderRadius: 8,
        backgroundColor: '#F8F8F8',
    },
    placeholderImage: {
        width: '100%',
        height: 300,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 8,
    },
    priceContainer: {
        marginBottom: 20,
    },
    price: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000000',
    },
    sku: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#000000',
    },
    variantsScroll: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    variantItem: {
        marginRight: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 5,
        minWidth: 100,
    },
    selectedVariant: {
        borderColor: '#000000',
        backgroundColor: '#F8F8F8',
    },
    variantTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
    },
    variantPrice: {
        fontSize: 12,
        color: '#000000',
        marginTop: 4,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    quantityLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 16,
        color: '#000000',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 5,
    },
    quantityButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },
    quantityButtonDisabled: {
        color: '#CCCCCC',
    },
    quantityValue: {
        width: 40,
        textAlign: 'center',
        fontSize: 18,
        color: '#000000',
    },
    addToCartButton: {
        backgroundColor: '#000000',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 20,
    },
    addToCartButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ProductDetail; 