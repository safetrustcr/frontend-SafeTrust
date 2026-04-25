import { graphql } from "@/graphql/generated";

export const GET_APARTMENTS = graphql(`
  query GetApartments(
    $limit: Int
    $offset: Int
    $where: apartments_bool_exp
    $order_by: [apartments_order_by!]
  ) {
    apartments(
      limit: $limit
      offset: $offset
      where: $where
      order_by: $order_by
    ) {
      id
      name
      location
      address
      bedrooms
      bathrooms
      price
      status
      promoted
      created_at
      updated_at
      rental_offers_aggregate {
        aggregate {
          count
        }
      }
    }
    apartments_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`);

export const GET_APARTMENT_BY_ID = graphql(`
  query GetApartmentById($id: Int!) {
    apartments_by_pk(id: $id) {
      id
      name
      location
      address
      bedrooms
      bathrooms
      price
      status
      promoted
      created_at
      updated_at
    }
  }
`);

export const GET_RENTAL_OFFERS = graphql(`
  query GetRentalOffers(
    $apartment_id: Int!
    $limit: Int
    $offset: Int
    $order_by: [rental_offers_order_by!]
  ) {
    rental_offers(
      where: { apartment_id: { _eq: $apartment_id } }
      limit: $limit
      offset: $offset
      order_by: $order_by
    ) {
      id
      tenant_name
      tenant_phone
      tenant_wallet_address
      offer_date
      bid_status
      created_at
    }
    rental_offers_aggregate(where: { apartment_id: { _eq: $apartment_id } }) {
      aggregate {
        count
      }
    }
  }
`);
