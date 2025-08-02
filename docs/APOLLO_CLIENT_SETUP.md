# Hasura & Apollo Client Testing Guide

## Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose

## Quick Setup

### 1. Install & Configure
```bash
git clone <your-repo-url>
cd safetrust-apollo-client
npm install
cp .env.local.example .env.local
```

### 2. Start Services
```bash
npm run docker:up
```

This starts:
- PostgreSQL on `localhost:5432`
- Hasura GraphQL on `localhost:8080`

## Testing Steps

### Step 1: Verify Services
```bash
docker-compose ps
npm run docker:logs
```

Look for:
- PostgreSQL: `database system is ready to accept connections`
- Hasura: `server: running on http://0.0.0.0:8080`

### Step 2: Access Hasura Console
```bash
npm run hasura:console
```
Or go to: **http://localhost:8080/console**

### Step 3: Setup Database
1. In Hasura Console → **Data** tab → **SQL**
2. Run `scripts/01-create-tables.sql`
3. Run `scripts/02-seed-data.sql`

### Step 4: Track Tables
1. Go to **Data** tab → Click **"Track All"**
2. Set up relationships:
   - `escrow_transaction_users` → `user` (Object) → `users` via `user_id`
   - `escrow_transaction_users` → `escrow_transaction` (Object) → `escrow_transactions` via `escrow_transaction_id`
   - `escrow_transactions` → `escrow_transaction_users` (Array) via `id`
   - `users` → `escrow_transaction_users` (Array) via `id`

### Step 5: Test GraphQL
In **GraphiQL** tab, test:
```graphql
query TestQuery {
  users(limit: 5) {
    id
    email
    first_name
    last_name
  }
  
  escrow_transactions(limit: 5) {
    id
    contract_id
    status
    escrow_transaction_users {
      funding_status
      user {
        email
        first_name
      }
    }
  }
}
```

### Step 6: Test Frontend
```bash
npm run dev
```
Visit: **http://localhost:3000**

Test:
- View escrow transactions and users
- Create new user via form
- Use refetch buttons

## Environment Variables
```env
NEXT_PUBLIC_HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql
NEXT_PUBLIC_HASURA_ADMIN_SECRET=safetrust_admin_secret_2024
NEXT_PUBLIC_HASURA_WS_URL=ws://localhost:8080/v1/graphql
```

## Troubleshooting

### Port Conflicts
```bash
# Check ports
lsof -i :5433  # PostgreSQL
lsof -i :8080  # Hasura

# Clean restart
npm run docker:down
npm run docker:clean
npm run docker:up
```

### Service Issues
```bash
# Check logs
npm run docker:logs

# Test Hasura health
# Visit: http://localhost:8080/healthz
```

## Success Indicators
✅ Both containers show "Up" status  
✅ Hasura console loads at localhost:8080  
✅ GraphQL query returns data  
✅ Frontend shows data and forms work  
✅ Can create users and see updates