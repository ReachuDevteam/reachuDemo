import {gql} from '@apollo/client';

export const CREATE_ITEM_TO_CART = gql`
  mutation AddItem($cartId: String!, $lineItems: [LineItemInput!]!) {
    Cart {
      AddItem(cart_id: $cartId, line_items: $lineItems) {
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
            tax
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
        total_amount
        currency
        available_shipping_countries
      }
    }
  }
`;

export const UPDATE_ITEM_TO_CART = gql`
  mutation UpdateItem(
    $cartId: String!
    $cartItemId: String!
    $qty: Int
    $shippingId: String
  ) {
    Cart {
      UpdateItem(
        cart_id: $cartId
        cart_item_id: $cartItemId
        qty: $qty
        shipping_id: $shippingId
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

export const REMOVE_ITEM_FROM_CART = gql`
  mutation DeleteItem($cartId: String!, $cartItemId: String!) {
    Cart {
      DeleteItem(cart_id: $cartId, cart_item_id: $cartItemId) {
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
            tax
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
        total_amount
        currency
        available_shipping_countries
      }
    }
  }
`;
