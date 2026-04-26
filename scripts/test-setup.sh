#!/bin/bash

echo "🧪 SafeTrust Setup Test"
echo "======================"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "\n${YELLOW}Test 1: Checking Docker containers...${NC}"
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Docker containers are running${NC}"
    docker-compose ps
else
    echo -e "${RED}❌ Docker containers are not running${NC}"
    echo "Run 'npm run docker:up' first"
    exit 1
fi

echo -e "\n${YELLOW}Test 2: Testing PostgreSQL connection...${NC}"
if docker-compose exec -T postgres psql -U postgres -d safetrust -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is accessible${NC}"
else
    echo -e "${RED}❌ Cannot connect to PostgreSQL${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Test 3: Testing Hasura GraphQL endpoint...${NC}"
if curl -s http://localhost:8080/healthz | grep -q "OK"; then
    echo -e "${GREEN}✅ Hasura is responding${NC}"
else
    echo -e "${RED}❌ Hasura is not responding${NC}"
    echo "Check: http://localhost:8080/healthz"
    exit 1
fi

echo -e "\n${YELLOW}Test 4: Checking if database tables exist...${NC}"
TABLES=$(docker-compose exec -T postgres psql -U postgres -d safetrust -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ' | grep -v '^$')

if echo "$TABLES" | grep -q "users"; then
    echo -e "${GREEN}✅ Users table exists${NC}"
else
    echo -e "${RED}❌ Users table missing - run the SQL scripts${NC}"
fi

if echo "$TABLES" | grep -q "escrow_transactions"; then
    echo -e "${GREEN}✅ Escrow transactions table exists${NC}"
else
    echo -e "${RED}❌ Escrow transactions table missing - run the SQL scripts${NC}"
fi

if echo "$TABLES" | grep -q "escrow_transaction_users"; then
    echo -e "${GREEN}✅ Escrow transaction users table exists${NC}"
else
    echo -e "${RED}❌ Escrow transaction users table missing - run the SQL scripts${NC}"
fi

echo -e "\n${YELLOW}Test 5: Checking for sample data...${NC}"
USER_COUNT=$(docker-compose exec -T postgres psql -U postgres -d safetrust -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
if [ "$USER_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Sample users found ($USER_COUNT users)${NC}"
else
    echo -e "${YELLOW}⚠️  No sample data found - run the seed script${NC}"
fi

echo -e "\n${YELLOW}Test 6: Testing GraphQL query...${NC}"
GRAPHQL_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: safetrust_admin_secret_2024" \
  -d '{"query": "query { users(limit: 1) { id email } }"}' \
  http://localhost:8080/v1/graphql)

if echo "$GRAPHQL_RESPONSE" | grep -q '"data"'; then
    echo -e "${GREEN}✅ GraphQL query successful${NC}"
    echo "Response: $GRAPHQL_RESPONSE"
else
    echo -e "${RED}❌ GraphQL query failed${NC}"
    echo "Response: $GRAPHQL_RESPONSE"
fi

echo -e "\n${GREEN}🎉 Setup test complete!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Open Hasura Console: http://localhost:8080/console"
echo "2. If tables are missing, run the SQL scripts in the console"
echo "3. Start your Next.js app: npm run dev"
echo "4. Visit your app: http://localhost:3000"
