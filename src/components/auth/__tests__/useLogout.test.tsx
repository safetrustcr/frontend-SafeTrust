import { act, renderHook } from "@testing-library/react";
import { useLogout } from "../LogoutButton";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("firebase/auth", () => ({ signOut: jest.fn() }));
jest.mock("@/lib/firebase", () => ({ auth: {} }));
jest.mock("@/lib/auth/session", () => ({ clearSessionCookie: jest.fn() }));
jest.mock("@/hooks/useWallet", () => ({
  useWallet: () => ({ disconnect: jest.fn() }),
}));
jest.mock("@/core/store/data", () => ({
  useGlobalAuthenticationStore: (
    select: (state: { clearAuth: () => void }) => unknown,
  ) => select({ clearAuth: jest.fn() }),
}));

const mockResetLocation = jest.fn();
jest.mock("@/features/location", () => ({
  resetLocation: () => mockResetLocation(),
}));

it("forgets the in-memory location on logout", async () => {
  const { result } = renderHook(() => useLogout());

  await act(() => result.current());

  expect(mockResetLocation).toHaveBeenCalledTimes(1);
});
