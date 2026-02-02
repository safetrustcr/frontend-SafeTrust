"use client";

import { useQuery, useMutation } from "@apollo/client";
import { GET_ESCROW_TRANSACTIONS } from "@/graphql/queries/testQuery.graphql";
import { CREATE_TEST_USER } from "@/graphql/mutations/test-user";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";

export default function ApolloTestComponent() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const {
    data: escrowData,
    loading: escrowLoading,
    error: escrowError,
    refetch: refetchEscrow,
  } = useQuery(GET_ESCROW_TRANSACTIONS);

  const [
    createTestUser,
    { data: mutationData, loading: mutationLoading, error: mutationError },
  ] = useMutation(
    CREATE_TEST_USER,
    {
      onCompleted: (data) => {
        if (data?.insert_users_one) {
          toast.success(
            `Successfully created user: ${data.insert_users_one.email}`,
          );
          setEmail("");
          setFirstName("");
          setLastName("");
        }
      },
      onError: (error) => {
        toast.error(`Mutation Error: ${error.message}`);
      },
    },
  );

  const handleCreateUser = async () => {
    if (!email || !firstName || !lastName) {
      toast.warn("Please fill in all user fields.");
      return;
    }
    await createTestUser({ variables: { email, firstName, lastName } });
  };

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Escrow Transactions (Query Test)
          </h2>
        </div>
        <div>
          {escrowLoading && (
            <p className="text-gray-600">Loading escrow transactions...</p>
          )}
          {escrowError && (
            <p className="text-red-500">
              Error loading escrow transactions: {escrowError.message}
            </p>
          )}
          {escrowData && (
            <div>
              <h3 className="font-semibold mb-2">
                Latest 10 Escrow Transactions:
              </h3>
              {escrowData.escrow_transactions.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {escrowData.escrow_transactions.map((tx) => (
                    <li key={tx.id} className="text-gray-700">
                      ID: {tx.id.substring(0, 8)}... | Contract:{" "}
                      {tx.contract_id.substring(0, 8)}... | Created:{" "}
                      {new Date(tx.created_at).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">
                  No escrow transactions found. Make sure your Hasura is seeded.
                </p>
              )}
              <button
                onClick={() => refetchEscrow()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Refetch Escrow Data
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Create Test User (Mutation Test)
          </h2>
        </div>
        <div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                id="lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleCreateUser}
              disabled={mutationLoading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {mutationLoading ? "Creating..." : "Create User"}
            </button>
            {mutationError && (
              <p className="text-red-500 mt-2">
                Error creating user: {mutationError.message}
              </p>
            )}
            {mutationData?.insert_users_one && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
                <p className="font-medium">User created successfully!</p>
                <p>ID: {mutationData.insert_users_one.id}</p>
                <p>Email: {mutationData.insert_users_one.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
