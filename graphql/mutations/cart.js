import {gql} from '@apollo/client';

export const CREATE_CART_MUTATION = gql`
  mutation CreateCart(
    $customerSessionId: String!
    $currency: String!
    $shippingCountry: String
  ) {
    Cart {
      CreateCart(
        customer_session_id: $customerSessionId
        currency: $currency
        shipping_country: $shippingCountry
      ) {
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
            compare_at_incl_taxes
            amount_incl_taxes
            tax_amount
            tax_rate
          }
          shipping {
            id
            name
            description
            price {
              amount
              currency_code
              amount_incl_taxes
              tax_amount
              tax_rate
            }
          }
          available_shippings {
            id
            name
            description
            country_code
            price {
              amount
              currency_code
              amount_incl_taxes
              tax_amount
              tax_rate
            }
          }
        }
        subtotal
        shipping
        currency
        available_shipping_countries
      }
    }
  }
`;

export const ADD_ITEM_MUTATION = gql`
  mutation AddItem($cartId: String!, $lineItems: [LineItemInput!]!) {
    Cart {
      AddItem(cart_id: $cartId, line_items: $lineItems) {
        subtotal
        line_items {
          id
          title
          price {
            amount_incl_taxes
            currency_code
          }
          quantity
          product_id
        }
      }
    }
  }
`;

export const UPDATE_CART_MUTATION = gql`
  mutation UpdateCart($cartId: String!, $shippingCountry: String!) {
    Cart {
      UpdateCart(cart_id: $cartId, shipping_country: $shippingCountry) {
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
    }
  }
`;
