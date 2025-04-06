import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useGetProducts } from '../../graphql/hooks/products';
import ProductDetail from '../ProductDetail';

// Función para capitalizar la primera letra de cada palabra
const titleCase = (str) => {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const ProductItem = ({ item, onPress }) => {
    const imageUrl = item.images && item.images.length > 0 ? item.images[0].url : null;

    return (
        <TouchableOpacity style={styles.productItem} onPress={onPress}>
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.productImage} />
            ) : (
                <View style={styles.placeholderImage}>
                    <Text>No Image</Text>
                </View>
            )}
            <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>
                    {titleCase(item.title)}
                </Text>
                <Text style={styles.productPrice}>
                    {item.price && item.price.amount ?
                        `${item.price.amount} ${item.price.currency_code}` :
                        'Price not available'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const ProductList = () => {
    const { products, loading, error, refreshProducts } = useGetProducts();
    const [selectedProductId, setSelectedProductId] = useState(null);

    useEffect(() => {
        console.log('ProductList component mounted');
    }, []);

    const handleSelectProduct = (productId) => {
        console.log('Selected product ID:', productId);
        setSelectedProductId(productId);
    };

    const handleBackToList = () => {
        setSelectedProductId(null);
    };

    // Si hay un producto seleccionado, mostrar la pantalla de detalles
    if (selectedProductId) {
        return <ProductDetail productId={selectedProductId} onBack={handleBackToList} />;
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (error) {
        console.error('Error fetching products:', error);
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Error loading products.</Text>
                <TouchableOpacity onPress={refreshProducts} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Products</Text>
            {products.length === 0 ? (
                <Text style={styles.noProductsText}>No products available.</Text>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <ProductItem
                            item={item}
                            onPress={() => handleSelectProduct(item.id)}
                        />
                    )}
                    numColumns={2}
                    contentContainerStyle={styles.listContainer}
                    columnWrapperStyle={styles.columnWrapper}
                />
            )}
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
        color: '#000000',
        textAlign: 'center',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    errorText: {
        color: '#FF0000',
        fontSize: 16,
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#000000',
        padding: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    listContainer: {
        paddingBottom: 40,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    productItem: {
        flex: 1,
        margin: 8,
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
        maxWidth: '47%',
    },
    productImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    placeholderImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        padding: 16,
    },
    productTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#000000',
        lineHeight: 20,
    },
    productPrice: {
        fontSize: 14,
        color: '#000000',
        fontWeight: 'bold',
    },
    noProductsText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#666666',
    },
});

export default ProductList; 