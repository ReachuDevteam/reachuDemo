import {gql} from '@apollo/client';

export const GET_CART_SHIPPING_QUERY = gql`
  query GetCart($cartId: String!) {
    Cart {
      GetCart(cart_id: $cartId) {
        cart_id
        line_items {
          id
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
      }
    }
  }
`;
