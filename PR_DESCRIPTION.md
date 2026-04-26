# Add "Interested People" Bid Requests Table for Apartments

## Summary
Implements the "Interested people" page showing all bid requests (rental offers) for a specific apartment. This feature allows property owners to view tenant contact information, wallet addresses, offer dates, and bid status for their listed apartments.

## Changes

### Database Schema
- **New Tables**:
  - `apartments`: Stores apartment listings with details (name, location, price, bedrooms, bathrooms, status, promoted flag)
  - `rental_offers`: Stores bid requests from interested tenants with contact info, wallet address, offer date, and bid status

- **SQL Scripts**:
  - `scripts/03_create_apartments_offers.sql`: Creates tables with proper indexes and triggers
  - `scripts/04_seed_apartments_offers.sql`: Seeds sample data (3 apartments, 10 offers for testing)

### GraphQL Layer
- **New Queries** (`src/graphql/queries/apartment-queries.ts`):
  - `GET_APARTMENTS`: Fetches apartments with offer counts
  - `GET_APARTMENT_BY_ID`: Fetches single apartment details
  - `GET_RENTAL_OFFERS`: Fetches paginated rental offers for an apartment

### UI Components
- **`InterestedPeopleTable`**: Paginated table with search, status filter, and responsive design
- **`PropertySummaryHeader`**: Displays apartment details (name, address, bedrooms, bathrooms, price)
- **`BidStatusBadge`**: Color-coded status badges (Pending/Accepted/Rejected)

### Pages
- **`/dashboard/apartments/[id]/offers`**: Main page showing property summary and interested people table

### Features
- ✅ Paginated table (5, 10, 20 items per page)
- ✅ Search by tenant name, phone, or wallet address
- ✅ Filter by bid status (All, Pending, Accepted, Rejected)
- ✅ Responsive design with mobile support
- ✅ Property summary header with key details
- ✅ Color-coded status badges
- ✅ "Showing X-Y of Z" counter
- ✅ Navigation from apartments table (click name or action menu)

## Routes
- `GET /dashboard/apartments` → Apartments list (existing)
- `GET /dashboard/apartments/[id]/offers` → Interested people table (new)

## Testing Notes
⚠️ **Requires Hasura Setup**: This feature requires a running Hasura instance with the database schema applied.

### Setup Steps:
1. Start Hasura: `docker compose up -d`
2. Apply migrations: Run SQL scripts in `scripts/` folder
3. Track tables in Hasura Console
4. Generate types: `npm run codegen`
5. Start dev server: `npm run dev`

See `docs/APARTMENTS_OFFERS_SETUP.md` for detailed setup instructions.

### Test Data:
- Apartment ID 1 ("La sabana house") has 10 sample offers
- Various bid statuses for testing filters
- Multiple tenants with contact info and wallet addresses

## Screenshots
The UI matches the provided mockup with:
- Property header with apartment icon, name, address, and amenities
- Paginated table with ID, Name, Phone, Wallet, Offer date, Status columns
- Search bar and status filter dropdown
- Items per page selector
- Page navigation with numbered buttons

## Notes
- Stub data is used in the page component until Hasura is running
- GraphQL queries are commented out but ready to use after codegen
- All components follow existing project patterns (Radix UI, Tailwind CSS)
- Responsive design tested for mobile and desktop viewports

## Documentation
- Added comprehensive setup guide: `docs/APARTMENTS_OFFERS_SETUP.md`
- Includes database schema, GraphQL queries, troubleshooting, and usage instructions
