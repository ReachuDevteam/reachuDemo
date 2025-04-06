import { useQuery } from '@apollo/client';
import { GET_PRODUCT_DETAILS_QUERY } from '../queries/productDetails';
import { useState, useEffect } from 'react';
import { SELECT_CURRENCY, SELECT_COUNTRY } from '../../consts/env';

export const useGetProductDetails = (productId) => {
    const [productDetails, setProductDetails] = useState(null);

    // Convertir el productId a número si es una cadena
    const parsedProductId = parseInt(productId, 10);

    const { data, loading, error, refetch } = useQuery(GET_PRODUCT_DETAILS_QUERY, {
        variables: {
            productIds: [parsedProductId],
            currency: SELECT_CURRENCY,
            shippingCountryCode: SELECT_COUNTRY
        },
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
        skip: !productId || isNaN(parsedProductId),
    });

    useEffect(() => {
        if (data && data.Channel && data.Channel.GetProductsByIds && data.Channel.GetProductsByIds.length > 0) {
            console.log('Product details fetched successfully:', data.Channel.GetProductsByIds[0]);
            setProductDetails(data.Channel.GetProductsByIds[0]);
        }
    }, [data]);

    const refreshProductDetails = () => {
        console.log('Refreshing product details for ID:', parsedProductId);
        return refetch({
            productIds: [parsedProductId],
            currency: SELECT_CURRENCY,
            shippingCountryCode: SELECT_COUNTRY
        });
    };

    return {
        productDetails,
        loading,
        error,
        refreshProductDetails,
    };
}; 