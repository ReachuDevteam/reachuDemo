import { gql } from '@apollo/client';

export const CREATE_CHECKOUT = gql`
  mutation CreateCheckout($cartId: String!) {
    Checkout {
      CreateCheckout(cart_id: $cartId) {
        buyer_accepts_purchase_conditions
        buyer_accepts_terms_conditions
        created_at
        updated_at
        id
        deleted_at
        success_url
        cancel_url
        payment_method
        email
        status
        checkout_url
        origin_payment_id
        billing_address {
          id
          first_name
          last_name
          phone_code
          phone
          company
          address1
          address2
          city
          province
          province_code
          country
          country_code
          zip
        }
        shipping_address {
          id
          first_name
          last_name
          phone_code
          phone
          company
          address1
          address2
          city
          province
          province_code
          country
          country_code
          zip
        }
        available_payment_methods {
          name
        }
        discount_code
        cart {
          cart_id
          customer_session_id
          shipping_country
          line_items {
            id
            supplier
            image {
              id
              url
              width
              height
            }
            sku
            barcode
            brand
            product_id
            title
            variant_id
            variant_title
            variant {
              option
              value
            }
            quantity
            price {
              amount
              currency_code
              discount
              compare_at
            }
            shipping {
              id
              name
              description
              price {
                amount
                currency_code
              }
            }
          }
          currency
          available_shipping_countries
        }
        totals {
          currency_code
          subtotal
          shipping
          total
          taxes
          tax_rate
          discounts
        }
      }
    }
  }
`;

export const UPDATE_CHECKOUT = gql`
  mutation UpdateCheckout(
    $checkoutId: String!
    $buyerAcceptsTermsConditions: Boolean
    $buyerAcceptsPurchaseConditions: Boolean
    $billingAddress: AddressArgs
    $shippingAddress: AddressArgs
    $paymentMethod: String
    $cancelUrl: String
    $successUrl: String
    $email: String
    $status: String
  ) {
    Checkout {
      UpdateCheckout(
        checkout_id: $checkoutId
        buyer_accepts_terms_conditions: $buyerAcceptsTermsConditions
        buyer_accepts_purchase_conditions: $buyerAcceptsPurchaseConditions
        billing_address: $billingAddress
        shipping_address: $shippingAddress
        payment_method: $paymentMethod
        cancel_url: $cancelUrl
        success_url: $successUrl
        email: $email
        status: $status
      ) {
        buyer_accepts_purchase_conditions
        buyer_accepts_terms_conditions
        created_at
        updated_at
        id
        deleted_at
        success_url
        cancel_url
        payment_method
        email
        status
        checkout_url
        origin_payment_id
        billing_address {
          id
          first_name
          last_name
          phone_code
          phone
          company
          address1
          address2
          city
          province
          province_code
          country
          country_code
          zip
        }
        shipping_address {
          id
          first_name
          last_name
          phone_code
          phone
          company
          address1
          address2
          city
          province
          province_code
          country
          country_code
          zip
        }
        available_payment_methods {
          name
        }
        discount_code
        cart {
          cart_id
          customer_session_id
          shipping_country
          line_items {
            id
            supplier
            image {
              id
              url
              width
              height
            }
            sku
            barcode
            brand
            product_id
            title
            variant_id
            variant_title
            variant {
              option
              value
            }
            quantity
            price {
              amount
              currency_code
              discount
              compare_at
            }
            shipping {
              id
              name
              description
              price {
                amount
                currency_code
              }
            }
          }
          currency
          available_shipping_countries
        }
        totals {
          currency_code
          subtotal
          shipping
          total
          taxes
          tax_rate
          discounts
        }
      }
    }
  }
`;

export const CHECKOUT_INIT_PAYMENT_KLARNA = gql`
  mutation Payment(
    $checkoutId: String!
    $countryCode: String!
    $href: String!
    $email: String!
  ) {
    Payment {
      CreatePaymentKlarna(
        checkout_id: $checkoutId
        country_code: $countryCode
        href: $href
        email: $email
      ) {
        order_id
        status
        purchase_country
        purchase_currency
        locale
        billing_address {
          given_name
          family_name
          email
          street_address
          postal_code
          city
          country
        }
        shipping_address {
          given_name
          family_name
          email
          street_address
          postal_code
          city
          country
        }
        order_amount
        order_tax_amount
        total_line_items_price
        order_lines {
          type
          name
          quantity
          unit_price
          tax_rate
          total_amount
          total_discount_amount
          total_tax_amount
          merchant_data
        }
        merchant_urls {
          terms
          checkout
          confirmation
          push
        }
        html_snippet
        started_at
        last_modified_at
        options {
          allow_separate_shipping_address
          date_of_birth_mandatory
          require_validate_callback_success
          phone_mandatory
          auto_capture
        }
        shipping_options {
          id
          name
          price
          tax_amount
          tax_rate
          preselected
        }
        merchant_data
        selected_shipping_option {
          id
          name
          price
          tax_amount
          tax_rate
          preselected
        }
      }
    }
  }
`;

export const CHECKOUT_INIT_PAYMENT_STRIPE = gql`
  mutation CreatePaymentStripe(
    $checkoutId: String!
    $successUrl: String!
    $paymentMethod: String!
    $email: String!
  ) {
    Payment {
      CreatePaymentStripe(
        checkout_id: $checkoutId
        success_url: $successUrl
        payment_method: $paymentMethod
        email: $email
      ) {
        checkout_url
        order_id
      }
    }
  }
`;

export const CHECKOUT_PAYMENT_INTENT_STRIPE = gql`
  mutation CreatePaymentIntentStripe(
    $checkoutId: String!
    $returnEphemeralKey: Boolean
  ) {
    Payment {
      CreatePaymentIntentStripe(
        checkout_id: $checkoutId
        return_ephemeral_key: $returnEphemeralKey
      ) {
        client_secret
        customer
        publishable_key
        ephemeral_key
      }
    }
  }
`;
