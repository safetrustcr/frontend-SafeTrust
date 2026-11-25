import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { EditProfileForm } from "./EditProfileForm";

const mockUpdateProfile = jest.fn();
const mockToastSuccess = jest.fn();

jest.mock("next/dynamic", () => () => {
  const Stub = () => null;
  return Stub;
});
jest.mock("sonner", () => ({
  toast: { success: (m: string) => mockToastSuccess(m), error: jest.fn() },
}));
jest.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: { displayName: "Ana Mora", getIdToken: jest.fn() },
  },
}));
jest.mock("@/features/account", () => ({
  AccountApiError: class extends Error {},
  listWallets: jest.fn().mockResolvedValue({ wallets: [] }),
}));
jest.mock("firebase/auth", () => ({
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  onAuthStateChanged: (_auth: unknown, cb: (u: unknown) => void) => {
    cb({
      displayName: "Ana Mora",
      email: "ana@example.com",
      metadata: {},
      getIdToken: () => Promise.resolve("t"),
    });
    return () => undefined;
  },
}));

describe("EditProfileForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateProfile.mockResolvedValue(undefined);
  });

  it("keeps Save disabled until the name changes", () => {
    render(<EditProfileForm />);
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeDisabled();
  });

  it("says only 'Name updated.' after the name is saved", async () => {
    render(<EditProfileForm />);
    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Bea" },
    });
    const save = screen.getByRole("button", { name: /save changes/i });
    expect(save).toBeEnabled();
    fireEvent.click(save);

    await waitFor(() =>
      expect(mockToastSuccess).toHaveBeenCalledWith("Name updated."),
    );
    expect(mockUpdateProfile).toHaveBeenCalledWith(expect.anything(), {
      displayName: "Bea Mora",
    });
    await waitFor(() => expect(save).toBeDisabled());
  });

  it("disables unstored fields and links them to the note", () => {
    render(<EditProfileForm />);
    const note = document.getElementById("profile-unstored-fields-note");
    expect(note).toHaveTextContent(/can't be saved yet/i);
    for (const el of [
      screen.getByLabelText("Phone"),
      screen.getByLabelText("Location"),
      screen.getByLabelText("Summary"),
      screen.getByLabelText("Country code"),
    ]) {
      expect(el).toBeDisabled();
      expect(el).toHaveAttribute(
        "aria-describedby",
        "profile-unstored-fields-note",
      );
    }
  });
});
