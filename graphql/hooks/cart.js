import {useMutation, useQuery} from '@apollo/client';
import {
  CREATE_CART_MUTATION,
  UPDATE_CART_MUTATION,
  ADD_ITEM_MUTATION,
} from '../mutations/cart';
import {useCallback} from 'react';
import {GET_CART_SHIPPING_QUERY} from '../queries/cart';

export const useCreateCart = () => {
  const [mutate, {data, loading, error}] = useMutation(CREATE_CART_MUTATION, {
    errorPolicy: 'all',
    fetchPolicy: 'no-cache',
  });

  const executeCreateCart = useCallback(
    async (customerSessionId, currency, shippingCountry) => {
      try {
        console.log('Creating cart with params:', {
          customerSessionId,
          currency,
          shippingCountry,
        });
        console.log('Mutation:', CREATE_CART_MUTATION.loc.source.body);

        const response = await mutate({
          variables: {customerSessionId, currency, shippingCountry},
        });

        if (response.errors) {
          console.error('GraphQL errors in response:', response.errors);
        }

        if (response.data) {
          console.log('Cart created successfully:', response.data);
          return response.data.Cart.CreateCart;
        } else {
          console.error('No data returned from mutation');
          return null;
        }
      } catch (e) {
        console.error('Error creating cart:', JSON.stringify(e));
        // Intentar proporcionar más detalles sobre el error
        if (e.networkError) {
          console.error('Network error details:', e.networkError);
        }
        if (e.graphQLErrors) {
          console.error('GraphQL error details:', e.graphQLErrors);
        }
        throw e;
      }
    },
    [mutate],
  );

  return {executeCreateCart, data, loading, error};
};

export const useAddItemToCart = () => {
  const [mutate, {data, loading, error}] = useMutation(ADD_ITEM_MUTATION, {
    errorPolicy: 'all',
    fetchPolicy: 'no-cache',
  });

  const executeAddItemToCart = useCallback(
    async (cartId, product, quantity = 1, variantId = null) => {
      try {
        console.log('Adding item to cart:', {
          cartId,
          product,
          quantity,
          variantId,
        });

        const lineItem = {
          product_id: product.id,
          quantity: quantity,
        };

        // Si hay un variantId, lo agregamos al lineItem
        if (variantId) {
          lineItem.variant_id = variantId;
        }

        const response = await mutate({
          variables: {
            cartId: cartId,
            lineItems: [lineItem],
          },
        });

        if (response.errors) {
          console.error('GraphQL errors in response:', response.errors);
        }

        if (response.data) {
          console.log('Item added to cart successfully:', response.data);
          return response.data.Cart.AddItem;
        } else {
          console.error('No data returned from mutation');
          return null;
        }
      } catch (e) {
        console.error('Error adding item to cart:', JSON.stringify(e));
        if (e.networkError) {
          console.error('Network error details:', e.networkError);
        }
        if (e.graphQLErrors) {
          console.error('GraphQL error details:', e.graphQLErrors);
        }
        throw e;
      }
    },
    [mutate],
  );

  return {executeAddItemToCart, data, loading, error};
};

export const useUpdateCart = () => {
  const [mutate, {data, loading, error}] = useMutation(UPDATE_CART_MUTATION);

  const executeUpdateCart = useCallback(
    async (cartId, shippingCountry) => {
      try {
        const response = await mutate({
          variables: {cartId, shippingCountry},
        });
        console.log('Cart updated successfully', response.data);
        return response.data.Cart.UpdateCart;
      } catch (e) {
        console.error('Error updating cart', e);
        throw e;
      }
    },
    [mutate],
  );

  return {executeUpdateCart, data, loading, error};
};

export const useGetCartShippingOptions = () => {
  const {data, loading, error, refetch} = useQuery(GET_CART_SHIPPING_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
    skip: true,
  });

  const getCartShippingOptions = useCallback(
    async (cartId, countryCode) => {
      try {
        console.log('[GetCartShippingOptions] Starting with:', {
          cartId,
          countryCode,
        });

        const response = await refetch({cartId});

        console.log(
          '[GetCartShippingOptions] Raw response:',
          JSON.stringify(response.data, null, 2),
        );

        if (response.errors) {
          console.error(
            '[GetCartShippingOptions] Response has errors:',
            response.errors,
          );
        }

        const cart = response.data?.Cart?.GetCart;

        if (!cart) {
          throw new Error('Cart data not found');
        }

        const filteredLineItems = cart.line_items.map(item => ({
          id: item.id,
          available_shippings: item.available_shippings.filter(
            shipping => shipping.country_code === countryCode,
          ),
        }));

        return {
          cart_id: cart.cart_id,
          line_items: filteredLineItems,
        };
      } catch (e) {
        console.error('[GetCartShippingOptions] Error:', e);
        console.error(
          '[GetCartShippingOptions] Error details:',
          JSON.stringify(
            {
              name: e.name,
              message: e.message,
              networkError: e.networkError,
              graphQLErrors: e.graphQLErrors,
              extraInfo: e.extraInfo,
              stack: e.stack,
            },
            null,
            2,
          ),
        );
        throw e;
      }
    },
    [refetch],
  );

  return {
    getCartShippingOptions,
    data,
    loading,
    error,
  };
};
