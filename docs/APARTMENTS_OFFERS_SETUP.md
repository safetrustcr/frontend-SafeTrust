# Apartments & Offers Feature Setup Guide

This guide explains how to set up and use the "Interested People" (rental offers) feature for apartments.

## Overview

The feature allows property owners to:
- View all their apartments in `/dashboard/apartments`
- Click on an apartment name or "View interested people" to see all bid requests
- View tenant contact information, wallet addresses, offer dates, and bid status
- Filter and paginate through offers

## Database Schema

Two new tables have been created:

### `apartments` table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `location` (VARCHAR)
- `address` (TEXT)
- `bedrooms` (INTEGER)
- `bathrooms` (INTEGER)
- `price` (NUMERIC)
- `status` (VARCHAR) - 'inhabited' or 'not_inhabited'
- `promoted` (BOOLEAN)
- `owner_id` (UUID) - references users table
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `rental_offers` table
- `id` (SERIAL PRIMARY KEY)
- `apartment_id` (INTEGER) - references apartments table
- `tenant_name` (VARCHAR)
- `tenant_phone` (VARCHAR)
- `tenant_wallet_address` (VARCHAR)
- `offer_date` (TIMESTAMPTZ)
- `bid_status` (VARCHAR) - 'pending', 'accepted', or 'rejected'
- `created_at`, `updated_at` (TIMESTAMPTZ)

## Setup Instructions

### 1. Start Hasura (if not already running)

```bash
# Start Docker containers
docker compose up -d

# Or if using older Docker Compose
docker-compose up -d
```

### 2. Apply Database Migrations

Run the SQL scripts in order:

```bash
# Connect to your PostgreSQL database and run:
psql -U postgres -d safetrust -f scripts/03_create_apartments_offers.sql
psql -U postgres -d safetrust -f scripts/04_seed_apartments_offers.sql
```

Or if using Docker:

```bash
# Copy scripts to container
docker compose cp scripts/03_create_apartments_offers.sql postgres:/tmp/
docker compose cp scripts/04_seed_apartments_offers.sql postgres:/tmp/

# Execute scripts
docker compose exec postgres psql -U postgres -d safetrust -f /tmp/03_create_apartments_offers.sql
docker compose exec postgres psql -U postgres -d safetrust -f /tmp/04_seed_apartments_offers.sql
```

### 3. Track Tables in Hasura

1. Open Hasura Console: http://localhost:8080/console
2. Go to "Data" tab
3. Click "Track" for both `apartments` and `rental_offers` tables
4. Set up relationships:
   - In `apartments`: Add array relationship `rental_offers` → `rental_offers.apartment_id`
   - In `rental_offers`: Add object relationship `apartment` → `apartments.id`

### 4. Generate GraphQL Types

```bash
npm run codegen
```

This will generate TypeScript types from your GraphQL schema.

### 5. Start Development Server

```bash
npm run dev
```

## Usage

### Viewing Interested People

1. Navigate to `/dashboard/apartments`
2. Click on an apartment name (e.g., "La sabana house")
   - OR click the three-dot menu → "View interested people"
3. You'll see:
   - Property summary header with apartment details
   - Paginated table of all rental offers/bids
   - Search and filter functionality
   - Bid status badges (Pending, Accepted, Rejected)

### Features

- **Search**: Search by tenant name, phone, or wallet address
- **Filter**: Filter by bid status (All, Pending, Accepted, Rejected)
- **Pagination**: 5, 10, or 20 items per page
- **Responsive**: Mobile-friendly design

## GraphQL Queries

### Get Apartments
```graphql
query GetApartments($limit: Int, $offset: Int) {
  apartments(limit: $limit, offset: $offset) {
    id
    name
    location
    price
    status
    promoted
    rental_offers_aggregate {
      aggregate {
        count
      }
    }
  }
}
```

### Get Rental Offers
```graphql
query GetRentalOffers($apartment_id: Int!, $limit: Int, $offset: Int) {
  rental_offers(
    where: { apartment_id: { _eq: $apartment_id } }
    limit: $limit
    offset: $offset
    order_by: { offer_date: desc }
  ) {
    id
    tenant_name
    tenant_phone
    tenant_wallet_address
    offer_date
    bid_status
  }
}
```

## File Structure

```
src/
├── app/
│   └── dashboard/
│       └── apartments/
│           ├── page.tsx                    # Apartments list
│           └── [id]/
│               └── offers/
│                   └── page.tsx            # Interested people page
├── components/
│   └── dashboard/
│       └── apartments/
│           ├── MyApartmentsTable.tsx       # Main apartments table
│           ├── InterestedPeopleTable.tsx   # Offers table
│           ├── PropertySummaryHeader.tsx   # Property details header
│           ├── BidStatusBadge.tsx          # Status badge component
│           ├── ApartmentActionsMenu.tsx    # Actions dropdown
│           └── ApartmentTableFilters.tsx   # Filter components
└── graphql/
    └── queries/
        └── apartment-queries.ts            # GraphQL queries
```

## Troubleshooting

### Hasura Connection Error
If you see "connect ECONNREFUSED 127.0.0.1:8080":
- Ensure Docker is running: `docker compose ps`
- Check Hasura logs: `docker compose logs hasura`
- Verify `.env` has correct `NEXT_PUBLIC_HASURA_GRAPHQL_URL`

### GraphQL Codegen Fails
- Ensure Hasura is running and accessible
- Check that tables are tracked in Hasura Console
- Verify admin secret in `.env` matches Hasura config

### 404 on /dashboard/apartments/[id]/offers
- Run `npm run codegen` to generate types
- Restart dev server: `npm run dev`
- Clear Next.js cache: `rm -rf .next`

## Testing

Sample data includes:
- 3 apartments (La sabana house, Escazú Apartment, Santa Ana Condo)
- 10 rental offers for apartment ID 1
- Various bid statuses (pending, accepted, rejected)

Test the feature by:
1. Visiting `/dashboard/apartments`
2. Clicking "La sabana house" or its action menu
3. Verifying the offers table shows 10 entries
4. Testing search, filters, and pagination
