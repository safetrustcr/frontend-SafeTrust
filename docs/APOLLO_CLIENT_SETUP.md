# SafeTrust Apollo Client Setup

This project demonstrates the implementation of Apollo Client with a local Hasura GraphQL backend for the SafeTrust application. It includes Docker setup for local development, GraphQL queries/mutations, and a comprehensive test interface.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### 1. Clone and Install

\`\`\`bash
git clone <your-repo-url>
cd safetrust-apollo-client
npm install
\`\`\`

### 2. Environment Setup

Copy the environment variables:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

The default `.env.local` is already configured for local development.

### 3. Start Docker Services

\`\`\`bash
# Start PostgreSQL and Hasura
npm run docker:up

# Check logs (optional)
npm run docker:logs
\`\`\`

This will start:
- PostgreSQL database on `localhost:5432`
- Hasura GraphQL Engine on `localhost:8080`

## 🧪 **Step-by-Step Testing Guide**

### **Step 1: Verify Services are Running**

First, check that both PostgreSQL and Hasura are running:

\`\`\`bash
# Check container status
docker-compose ps

# You should see both containers with "Up" status:
# frontend-safetrust-postgres-1   Up   0.0.0.0:5433->5432/tcp
# frontend-safetrust-hasura-1     Up   0.0.0.0:8080->8080/tcp

# Check logs to ensure they're healthy
npm run docker:logs
\`\`\`

Look for these success messages:
- **PostgreSQL**: `database system is ready to accept connections`
- **Hasura**: `server: running on http://0.0.0.0:8080`

### **Step 2: Access Hasura Console**

Open the Hasura Console in your browser:

\`\`\`bash
# This will open http://localhost:8080/console
npm run hasura:console
\`\`\`

Or manually go to: **http://localhost:8080/console**

### **Step 3: Run SQL Scripts to Set Up Database**

In the Hasura Console:

1. **Click on the "Data" tab** (top navigation)
2. **Click "SQL" in the left sidebar**
3. **Copy and paste the first SQL script:**
   - Open `scripts/01-create-tables.sql` in your code editor
   - Copy ALL the content
   - Paste it into the SQL editor in Hasura Console
   - **Click "Run!" button**

4. **Run the second SQL script:**
   - Open `scripts/02-seed-data.sql` in your code editor  
   - Copy ALL the content
   - Paste it into the SQL editor (replace the previous content)
   - **Click "Run!" button**

### **Step 4: Track Tables and Set Up Relationships**

After running the SQL scripts:

1. **Go back to the "Data" tab main page**
2. **Click "Track All" button** (this will track all your new tables)
3. **Set up relationships** for each table:

   **For `escrow_transaction_users` table:**
   - Click on the table name
   - Go to "Relationships" tab
   - Add Object Relationship: `user` → `users` table via `user_id`
   - Add Object Relationship: `escrow_transaction` → `escrow_transactions` table via `escrow_transaction_id`

   **For `escrow_transactions` table:**
   - Go to "Relationships" tab  
   - Add Array Relationship: `escrow_transaction_users` → `escrow_transaction_users` table via `id`

   **For `users` table:**
   - Go to "Relationships" tab
   - Add Array Relationship: `escrow_transaction_users` → `escrow_transaction_users` table via `id`

### **Step 5: Test GraphQL Queries**

In Hasura Console:

1. **Click "GraphiQL" tab** (top navigation)
2. **Test this query:**

\`\`\`graphql
query TestQuery {
  users(limit: 5) {
    id
    email
    first_name
    last_name
    created_at
  }
  
  escrow_transactions(limit: 5) {
    id
    contract_id
    status
    created_at
    escrow_transaction_users {
      funding_status
      user {
        email
        first_name
        last_name
      }
    }
  }
}
\`\`\`

3. **Click the "Play" button** - you should see data returned!

### **Step 6: Start Your Next.js Application**

\`\`\`bash
npm run dev
\`\`\`

Visit: **http://localhost:3000**

### **Step 7: Test the Apollo Client Interface**

On the webpage, you should see:

1. **Escrow Transactions section** - showing data from your database
2. **Users section** - showing user data  
3. **Create Test User form** - try creating a new user

**Test the functionality:**
- Click "Refetch" buttons to reload data
- Fill out the user form and click "Create User"
- Verify the new user appears in the users list

### 4. Set Up Database Schema

1. Open Hasura Console:
   \`\`\`bash
   # Option 1: Open in browser
   open http://localhost:8080/console
   
   # Option 2: Use Hasura CLI (if installed)
   npm run hasura:console
   \`\`\`

2. In the Hasura Console:
   - Go to the "Data" tab
   - Click "SQL" in the left sidebar
   - Copy and paste the contents of `scripts/01-create-tables.sql`
   - Click "Run!"
   - Then copy and paste the contents of `scripts/02-seed-data.sql`
   - Click "Run!" again

3. Track tables and relationships:
   - Go back to the "Data" tab
   - Click "Track All" for untracked tables
   - Set up relationships:
     - In `escrow_transaction_users` table, create:
       - Object relationship: `user` → `users` table via `user_id`
       - Object relationship: `escrow_transaction` → `escrow_transactions` table via `escrow_transaction_id`
     - In `escrow_transactions` table, create:
       - Array relationship: `escrow_transaction_users` → `escrow_transaction_users` table via `id`
     - In `users` table, create:
       - Array relationship: `escrow_transaction_users` → `escrow_transaction_users` table via `id`

### 5. Start the Next.js Application

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the Apollo Client test interface.

## 📁 Project Structure

\`\`\`
src/
├── app/
│   ├── layout.tsx              # Root layout with Apollo Provider
│   ├── test-page/page.tsx                # Home page with test component
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── ApolloTestComponent.tsx # Main test component
├── graphql/
│   ├── queries/
│   │   └── testQuery.ts       # GraphQL queries
│   ├── mutations/
│   │   └── user-mutations.ts   # GraphQL mutations
│   └── types.ts                # TypeScript types
├── lib/
│   ├── apollo.ts        # Apollo Client configuration
│   ├── apolloProvider.tsx     # Apollo Provider component
│   └── utils.ts                # Utility functions
└── scripts/
    ├── 01-create-tables.sql    # Database schema
    └── 02-seed-data.sql        # Sample data
\`\`\`

## 🔧 Configuration

### Apollo Client Features

- **Error Handling**: Global error handling with retry logic
- **Caching**: Intelligent caching with type policies
- **Loading States**: Built-in loading and error states
- **Development Tools**: Apollo DevTools integration

### Environment Variables

\`\`\`env
# Required for local development
NEXT_PUBLIC_HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql
NEXT_PUBLIC_HASURA_ADMIN_SECRET=safetrust_admin_secret_2024
NEXT_PUBLIC_HASURA_WS_URL=ws://localhost:8080/v1/graphql
\`\`\`

## 🧪 Testing the Setup

The test component (`ApolloTestComponent`) provides:

1. **Query Testing**: 
   - Fetch escrow transactions
   - Fetch users
   - Real-time loading states
   - Error handling

2. **Mutation Testing**:
   - Create new users
   - Form validation
   - Success/error feedback

3. **Cache Testing**:
   - Refetch functionality
   - Cache updates after mutations

## 📊 Database Schema

### Tables

- **users**: User information
- **escrow_transactions**: Escrow transaction records
- **escrow_transaction_users**: Junction table linking users to transactions

### Key Relationships

- Users can have multiple escrow transactions
- Escrow transactions can have multiple users
- Each user-transaction relationship has a funding status

## 🛠️ Development Commands

\`\`\`bash
# Start development server
npm run dev

# Docker commands
npm run docker:up      # Start services
npm run docker:down    # Stop services
npm run docker:logs    # View logs

# Hasura console (if Hasura CLI installed)
npm run hasura:console
\`\`\`

## 🔍 Troubleshooting

### Port Conflict Resolution

The most common issue is port conflicts. We've configured the services to use:
- **PostgreSQL**: Port `5433` (instead of default 5432)
- **Hasura**: Port `8080`

### Quick Fixes

1. **Check what's using your ports**:
   \`\`\`bash
   # Check if anything is using our ports
   lsof -i :5433  # PostgreSQL
   lsof -i :8080  # Hasura
   
   # Or use our helper script
   chmod +x scripts/check-setup.sh
   ./scripts/check-setup.sh
   \`\`\`

2. **Stop conflicting services**:
   \`\`\`bash
   # If you have local PostgreSQL running
   brew services stop postgresql
   # or
   sudo systemctl stop postgresql
   
   # If you have other services on port 8080
   # Find the process ID and kill it
   kill -9 $(lsof -ti:8080)
   \`\`\`

3. **Clean restart Docker**:
   \`\`\`bash
   # Stop everything and clean up
   npm run docker:clean
   
   # Start fresh
   npm run docker:up
   \`\`\`

### Common Issues

1. **"Port already allocated" error**:
   - Change the port in `docker-compose.yml`
   - Or stop the conflicting service
   - Use our setup checker: `./scripts/check-setup.sh`

2. **Docker services not starting**:
   \`\`\`bash
   # Check Docker is running
   docker info
   
   # Check container logs
   npm run docker:logs
   
   # Restart services
   npm run docker:restart
   \`\`\`

3. **Hasura connection errors**:
   - Verify Hasura is running: `http://localhost:8080/healthz`
   - Check environment variables in `.env.local`
   - Ensure admin secret matches in both files

4. **Database connection issues**:
   \`\`\`bash
   # Check PostgreSQL logs
   docker-compose logs postgres
   
   # Check Hasura logs  
   docker-compose logs hasura
   
   # Test database connection
   docker-compose exec postgres psql -U postgres -d safetrust -c "SELECT version();"
   \`\`\`

### Step-by-Step Recovery

If you're having issues, try this complete reset:

\`\`\`bash
# 1. Stop everything
npm run docker:down

# 2. Clean up (removes volumes and unused containers)
npm run docker:clean

# 3. Check for port conflicts
./scripts/check-setup.sh

# 4. Start fresh
npm run docker:up

# 5. Wait for services (should see "server: running on http://0.0.0.0:8080")
npm run docker:logs

# 6. Set up database (open browser)
npm run hasura:console

# 7. Start your app
npm run dev
\`\`\`

## 🚀 Next Steps

This setup provides the foundation for:

1. **Real-time Subscriptions** (Phase 2)
2. **Authentication Integration** with JWT tokens
3. **Advanced Caching Strategies**
4. **Optimistic Updates**
5. **File Upload Handling**

## 📚 Additional Resources

- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Hasura Documentation](https://hasura.io/docs/latest/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Next.js with Apollo Client](https://www.apollographql.com/blog/apollo-client/next-js/next-js-getting-started/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
