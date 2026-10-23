import { render, screen } from "@testing-library/react";
import GuestProfilePage, { metadata } from "./page";

jest.mock("@/features/auth", () => ({
  GuestProfileLanding: () => <div data-testid="guest-profile-landing" />,
}));

describe("guest profile page", () => {
  it("sets the page title", () => {
    expect(metadata.title).toBe("Your account | SafeTrust");
  });

  it("renders the public landing from the auth feature", () => {
    render(<GuestProfilePage />);

    expect(screen.getByTestId("guest-profile-landing")).toBeInTheDocument();
  });
});
