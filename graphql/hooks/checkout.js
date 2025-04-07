import {useMutation, useQuery} from '@apollo/client';
import {
  CHECKOUT_INIT_PAYMENT_KLARNA,
  CHECKOUT_INIT_PAYMENT_STRIPE,
  CHECKOUT_PAYMENT_INTENT_STRIPE,
  CREATE_CHECKOUT,
  UPDATE_CHECKOUT,
} from '../mutations/checkout';
import {useCallback} from 'react';
import {GET_CHECKOUT_QUERY} from '../queries/checkout';

export const useCreateCheckout = () => {
  const [mutate, {data, loading, error}] = useMutation(CREATE_CHECKOUT);

  const createCheckout = useCallback(
    async cartId => {
      try {
        console.log('[CreateCheckout] Starting with cartId:', cartId);

        const response = await mutate({variables: {cartId}});

        console.log(
          '[CreateCheckout] Raw response:',
          JSON.stringify(response, null, 2),
        );
        console.log('[CreateCheckout] Success response data:', response.data);

        if (response.errors) {
          console.error(
            '[CreateCheckout] Response has errors:',
            response.errors,
          );
        }

        return response.data.Checkout.CreateCheckout;
      } catch (e) {
        console.error('[CreateCheckout] Error:', e);
        console.error(
          '[CreateCheckout] Error details:',
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
    [mutate],
  );

  return {createCheckout, data, loading, error};
};

export const useUpdateCheckout = () => {
  const [mutate, {data, loading, error}] = useMutation(UPDATE_CHECKOUT);

  const updateCheckout = useCallback(
    async (
      checkoutId,
      email,
      billingAddress,
      shippingAddress,
      buyerAcceptsTermsConditions = true,
      buyerAcceptsPurchaseConditions = true,
    ) => {
      try {
        console.log('[UpdateCheckout] Starting with:', {
          checkoutId,
          email,
          billingAddress: !!billingAddress,
          shippingAddress: !!shippingAddress,
        });

        const response = await mutate({
          variables: {
            checkoutId,
            email,
            billingAddress,
            shippingAddress,
            buyerAcceptsTermsConditions,
            buyerAcceptsPurchaseConditions,
          },
        });

        console.log(
          '[UpdateCheckout] Success response:',
          JSON.stringify(response.data, null, 2),
        );

        if (response.errors) {
          console.error(
            '[UpdateCheckout] Response has errors:',
            response.errors,
          );
        }

        return response.data.Checkout.UpdateCheckout;
      } catch (e) {
        console.error('[UpdateCheckout] Error:', e);
        console.error(
          '[UpdateCheckout] Error details:',
          JSON.stringify(
            {
              name: e.name,
              message: e.message,
              networkError: e.networkError,
              graphQLErrors: e.graphQLErrors,
            },
            null,
            2,
          ),
        );
        throw e;
      }
    },
    [mutate],
  );

  return {updateCheckout, data, loading, error};
};

export const useCheckoutInitPaymentKlarna = () => {
  const [mutate, {data, loading, error}] = useMutation(
    CHECKOUT_INIT_PAYMENT_KLARNA,
  );

  const checkoutInitPaymentKlarna = useCallback(
    async (checkoutId, countryCode, href, email) => {
      try {
        console.log('[InitPaymentKlarna] Starting with:', {
          checkoutId,
          countryCode,
          href,
          email,
        });

        const response = await mutate({
          variables: {checkoutId, countryCode, href, email},
        });

        console.log(
          '[InitPaymentKlarna] Success response:',
          JSON.stringify(response.data, null, 2),
        );

        if (response.errors) {
          console.error(
            '[InitPaymentKlarna] Response has errors:',
            response.errors,
          );
        }

        return response.data.Payment.CreatePaymentKlarna;
      } catch (e) {
        console.error('[InitPaymentKlarna] Error:', e);
        console.error(
          '[InitPaymentKlarna] Error details:',
          JSON.stringify(
            {
              name: e.name,
              message: e.message,
              networkError: e.networkError,
              graphQLErrors: e.graphQLErrors,
            },
            null,
            2,
          ),
        );
        throw e;
      }
    },
    [mutate],
  );

  return {checkoutInitPaymentKlarna, data, loading, error};
};

export const useCheckoutInitPaymentStripe = () => {
  const [mutate, {data, loading, error}] = useMutation(
    CHECKOUT_INIT_PAYMENT_STRIPE,
  );

  const checkoutInitPaymentStripe = useCallback(
    async (email, paymentMethod, successUrl, checkoutId) => {
      try {
        console.log('[InitPaymentStripe] Starting with:', {
          email,
          paymentMethod,
          successUrl,
          checkoutId,
        });

        const response = await mutate({
          variables: {email, paymentMethod, successUrl, checkoutId},
        });

        console.log(
          '[InitPaymentStripe] Success response:',
          JSON.stringify(response.data, null, 2),
        );

        if (response.errors) {
          console.error(
            '[InitPaymentStripe] Response has errors:',
            response.errors,
          );
        }

        return response.data.Payment.CreatePaymentStripe;
      } catch (e) {
        console.error('[InitPaymentStripe] Error:', e);
        console.error(
          '[InitPaymentStripe] Error details:',
          JSON.stringify(
            {
              name: e.name,
              message: e.message,
              networkError: e.networkError,
              graphQLErrors: e.graphQLErrors,
            },
            null,
            2,
          ),
        );
        throw e;
      }
    },
    [mutate],
  );

  return {checkoutInitPaymentStripe, data, loading, error};
};

export const useCheckoutPaymentIntentStripe = () => {
  const [mutate, {data, loading, error}] = useMutation(
    CHECKOUT_PAYMENT_INTENT_STRIPE,
  );

  const checkoutPaymentIntentStripe = useCallback(
    async (checkoutId, returnEphemeralKey) => {
      try {
        console.log('[PaymentIntentStripe] Starting with:', {
          checkoutId,
          returnEphemeralKey,
        });

        const response = await mutate({
          variables: {checkoutId, returnEphemeralKey},
        });

        console.log(
          '[PaymentIntentStripe] Success response:',
          JSON.stringify(response.data, null, 2),
        );

        if (response.errors) {
          console.error(
            '[PaymentIntentStripe] Response has errors:',
            response.errors,
          );
        }

        return response.data.Payment.CreatePaymentIntentStripe;
      } catch (e) {
        console.error('[PaymentIntentStripe] Error:', e);
        console.error(
          '[PaymentIntentStripe] Error details:',
          JSON.stringify(
            {
              name: e.name,
              message: e.message,
              networkError: e.networkError,
              graphQLErrors: e.graphQLErrors,
            },
            null,
            2,
          ),
        );
        throw e;
      }
    },
    [mutate],
  );

  return {checkoutPaymentIntentStripe, data, loading, error};
};

export const useGetCheckoutDetails = () => {
  const {data, loading, error, refetch} = useQuery(GET_CHECKOUT_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
    skip: true,
  });

  const getCheckoutDetails = useCallback(
    async checkoutId => {
      try {
        console.log('[GetCheckoutDetails] Starting with ID:', checkoutId);

        const response = await refetch({checkoutId});

        console.log(
          '[GetCheckoutDetails] Raw response:',
          JSON.stringify(response.data, null, 2),
        );

        if (response.errors) {
          console.error(
            '[GetCheckoutDetails] Response has errors:',
            response.errors,
          );
        }

        return response.data?.Checkout?.GetCheckout;
      } catch (e) {
        console.error('[GetCheckoutDetails] Error:', e);
        console.error(
          '[GetCheckoutDetails] Error details:',
          JSON.stringify(
            {
              name: e.name,
              message: e.message,
              networkError: e.networkError,
              graphQLErrors: e.graphQLErrors,
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
    getCheckoutDetails,
    data,
    loading,
    error,
  };
};
