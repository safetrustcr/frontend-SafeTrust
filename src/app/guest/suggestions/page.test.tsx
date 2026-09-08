import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import GuestSuggestionsPage from "./page";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-image" />,
}));

jest.mock("@/components/hotel/HotelHeader", () => ({
  __esModule: true,
  default: () => <header data-testid="hotel-header" />,
}));

const mockPush = jest.fn();

describe("GuestSuggestionsPage – Message host", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders the Message host button next to Book for the selected apartment", () => {
    render(<GuestSuggestionsPage />);

    expect(screen.getByRole("button", { name: /Book/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Message host/i }),
    ).toBeInTheDocument();
  });

  it("navigates to the conversation thread for the selected apartment", () => {
    render(<GuestSuggestionsPage />);

    fireEvent.click(screen.getByRole("button", { name: /Message host/i }));

    expect(mockPush).toHaveBeenCalledWith("/dashboard/messages/conv-10");
  });

  it("updates the target conversation when another apartment is selected", () => {
    render(<GuestSuggestionsPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /Suite Ejecutiva Sabana Norte/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Message host/i }));

    expect(mockPush).toHaveBeenCalledWith("/dashboard/messages/conv-11");
  });
});
