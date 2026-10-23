import { TextEncoder, TextDecoder } from "node:util";
// SDK 14 uses browser encoding APIs that JSDOM does not install.
if (typeof globalThis.TextEncoder === "undefined")
  Object.defineProperty(globalThis, "TextEncoder", {
    value: TextEncoder,
    configurable: true,
  });
if (typeof globalThis.TextDecoder === "undefined")
  Object.defineProperty(globalThis, "TextDecoder", {
    value: TextDecoder,
    configurable: true,
  });

import "@testing-library/jest-dom";

// Prevent server-only import failures in Jest jsdom test environment
jest.mock("server-only", () => ({}));

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

// Provide fallback environment variables for tests
process.env.NEXT_PUBLIC_FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
  "safetrustcr-596e3.firebaseapp.com";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "safetrustcr-596e3";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  "safetrustcr-596e3.firebasestorage.app";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID =
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "736891312580";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID =
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
  "1:736891312580:web:2752bc815204c69fcbec91";

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
