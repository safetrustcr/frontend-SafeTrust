# 🌟 SafeTrust 🌟

**SafeTrust** is a decentralized platform designed to revolutionize P2P transactions, providing secure deposits and payments powered by blockchain and trustless technologies. 🌐✨ Experience transparency and reliability in every cryptocurrency transaction. 💸🔒

---

## 🚀 **Why Choose SafeTrust?**

🔐 **Trustless Technology**: Secure and block deposits without intermediaries.  
💾 **Blockchain-Powered Transparency**: Immutable, auditable, and verifiable transactions.  
💱 **Crypto-Payment Support**: Manage cryptocurrency payments safely and efficiently.  
✅ **Automated Refunds**: Streamlined processes ensure refunds and payment releases happen automatically.

---

## 🌟 **Key Features**

🛠️ **Trustless Escrow**:  
Funds are securely held in blockchain-based escrow accounts until all terms are met.

🔎 **Blockchain Transparency**:  
Every transaction is logged on the blockchain for full visibility and accountability. 📜

💰 **Crypto Payments**:  
Supports irreversible and secure cryptocurrency payments while reducing risks of fraud or disputes.

🔗 **Trustline Process**:  
Verified trustlines between parties add an extra layer of transaction security. 🔒

📤 **Automated Refund System**:  
Ensures funds are automatically released based on the terms of the agreement, with no manual intervention required.

---

## ⚙️ **How It Works**

1. **Create Escrow**: The renter creates a secure escrow account. 🏗️
2. **Fund Escrow**: The deposit is funded by the renter. 💵
3. **Rental Agreement**: Terms are agreed upon and stored on the blockchain. 📃
4. **Completion or Cancellation**: Funds are released based on contract outcomes. 🎯

---

## 📋 **Getting Started**

### **Prerequisites**

- Node.js v14 or later 🖥️
- A blockchain wallet like **Albedo** for secure cryptocurrency transactions. 🔐
- Trustless Work API access (details [here](https://docs.trustlesswork.com/trustless-work)). 📖

### **Installation**

1️⃣ Fork this repository

2️⃣ Navigate to the project directory:

```bash
git clone https://github.com/<your_user>/Frontend
```

3️⃣ Add the remote repository upstream:

```bash
git remote add upstream https://github.com/safetrustcr/Frontend
```

4️⃣ Navigate to the project directory:

```bash
cd /Frontend
```

5️⃣ Set up environment variables **(make sure the .env file was created)**

```bash
echo "NEXT_PUBLIC_API_URL=https://api.trustlesswork.com" > .env
```

6️⃣ Install the app and start the development server:

```bash
npm install
```

7️⃣ Execute the app:

```bash
npm run dev
```

---

## 📡 **API Reference**

- **`/escrow/initiate`**: Start the escrow process and create agreements.
- **`/escrow/fund`**: Securely fund the escrow account.
- **`/escrow/complete`**: Complete the process and release funds to the appropriate party.

---

## 🛠️ **Tech Stack**

- **Frontend**: 🧑‍💻 Built with **TypeScript** and styled using **Tailwind CSS** for rapid UI development.
- **Blockchain**: 🛡️ Utilizes smart contracts for secure, immutable transactions.
- **API Integration**: 🌐 Interacts with the Trustless Work API for seamless escrow management.
- **Wallet Integration**: 🪙 Compatible with wallets like Albedo for secure payment handling.

---

## 🧪 **Testing Infrastructure**

This project uses Jest, React Testing Library, and Cypress for comprehensive testing of our Next.js application with App Router.

### **Running Tests**

- Run unit and integration tests: `npm test`
- Run E2E tests: `npm run test:e2e`
- Generate test coverage report: `npm run test:coverage`

### **Test Structure**

- Unit and integration tests are located in `__tests__` directories or as `.test.ts(x)` files next to the code they're testing within the `app` directory.
- E2E tests are located in the `cypress/e2e` directory.

### **Mocking**

We use Mock Service Worker (MSW) to mock API requests, including GraphQL queries. Mock handlers are defined in `mocks/handlers.ts`.

### **Continuous Integration**

We use GitHub Actions for CI. The workflow is defined in `.github/workflows/test.yml`.

### **Coverage Reporting**

Test coverage reports are generated using Jest's built-in coverage tool and uploaded to Codecov in the CI pipeline.

### **Next.js Specific Testing Considerations**

- Server Components: For testing Server Components, focus on integration and E2E tests rather than unit tests.
- API Routes: Use MSW to mock API responses in your tests.
- App Router: Ensure your tests account for the new file-based routing system in the App Router.

---

## 🎨 **Design Mockup**

Check out our Figma design here: [SafeTrust Figma](https://www.figma.com/design/CVg9hoim0f1FIlozIar7ZZ/SafeTrust?node-id=0-1&node-type=canvas&t=LCzPmGeJfVxCMWTT-0).

---

🌟 **Join SafeTrust today and revolutionize the way you manage P2P transactions!** 🌟
