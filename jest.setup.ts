import "@testing-library/jest-dom";

// Ensure Web Fetch API primitives are attached to global in Jest JSDOM environment
if (
  typeof global.Request === "undefined" &&
  typeof globalThis.Request !== "undefined"
) {
  global.Request = globalThis.Request;
  global.Response = globalThis.Response;
  global.Headers = globalThis.Headers;
  global.fetch = globalThis.fetch;
}

process.env.NEXT_PUBLIC_FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-api-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy-auth-domain";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project-id";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy-storage-bucket";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID =
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "dummy-sender-id";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID =
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "dummy-app-id";
