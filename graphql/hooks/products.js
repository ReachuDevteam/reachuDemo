import { useQuery } from '@apollo/client';
import { GET_PRODUCTS_QUERY } from '../queries/products';
import { useState, useEffect } from 'react';
import { SELECT_CURRENCY, SELECT_COUNTRY } from '../../consts/env';

export const useGetProducts = () => {
    const [products, setProducts] = useState([]);

    const { data, loading, error, refetch } = useQuery(GET_PRODUCTS_QUERY, {
        variables: {
            currency: SELECT_CURRENCY,
            shippingCountryCode: SELECT_COUNTRY,
        },
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
    });

    useEffect(() => {
        if (data && data.Channel && data.Channel.GetProducts) {
            console.log('Products fetched successfully:', data.Channel.GetProducts);
            setProducts(data.Channel.GetProducts);
        }
    }, [data]);

    const refreshProducts = () => {
        console.log('Refreshing products with parameters:', {
            currency: SELECT_CURRENCY,
            shippingCountryCode: SELECT_COUNTRY
        });
        return refetch({
            currency: SELECT_CURRENCY,
            shippingCountryCode: SELECT_COUNTRY
        });
    };

    return {
        products,
        loading,
        error,
        refreshProducts,
    };
}; 