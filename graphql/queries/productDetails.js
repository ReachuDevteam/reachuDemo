import {gql} from '@apollo/client';

export const GET_PRODUCT_DETAILS_QUERY = gql`
  query GetProductsByIds(
    $productIds: [Int!]!
    $currency: String
    $shippingCountryCode: String
  ) {
    Channel {
      GetProductsByIds(
        product_ids: $productIds
        currency: $currency
        shipping_country_code: $shippingCountryCode
      ) @connection(key: "productDetails") {
        id
        description
        title
        price {
          amount_incl_taxes
          currency_code
        }
        sku
        variants {
          id
          barcode
          price {
            amount_incl_taxes
            currency_code
          }
          quantity
          sku
          title
          images {
            id
            url
          }
        }
        options_enabled
        images {
          height
          id
          order
          url
          width
        }
      }
    }
  }
`;
