import { gql } from '@apollo/client';

export const GET_PRODUCTS_QUERY = gql`
  query GetProducts($currency: String, $shippingCountryCode: String) {
    Channel {
      GetProducts(currency: $currency, shipping_country_code: $shippingCountryCode) @connection(key: "products") {
        price {
          amount
          amount_incl_taxes
          currency_code
        }
        title
        id
        images {
          id
          order
          url
        }
      }
    }
  }
`; 