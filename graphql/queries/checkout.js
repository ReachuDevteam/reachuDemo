import {gql} from '@apollo/client';

export const GET_CHECKOUT_QUERY = gql`
  query GetCheckout($checkoutId: String!) {
    Checkout {
      GetCheckout(checkout_id: $checkoutId) {
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
