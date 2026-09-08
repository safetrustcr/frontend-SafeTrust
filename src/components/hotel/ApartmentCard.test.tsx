import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import ApartmentCard from "./ApartmentCard";
import { STUB_HOTELS } from "@/lib/mockData/hotels";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();

describe("ApartmentCard – Message host", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders Book and Message host for a mapped apartment", () => {
    render(<ApartmentCard apartment={STUB_HOTELS[0]} />);

    expect(screen.getByRole("button", { name: /Book/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Message host/i }),
    ).toBeInTheDocument();
  });

  it("navigates to the matching conversation thread when Message host is clicked", () => {
    render(<ApartmentCard apartment={STUB_HOTELS[0]} />);

    fireEvent.click(screen.getByRole("button", { name: /Message host/i }));

    expect(mockPush).toHaveBeenCalledWith("/dashboard/messages/conv-4");
  });

  it("does not trigger the card onClick when Message host is clicked", () => {
    const onClick = jest.fn();
    render(<ApartmentCard apartment={STUB_HOTELS[0]} onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: /Message host/i }));

    expect(onClick).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/dashboard/messages/conv-4");
  });

  it("hides the Message host button when no conversation exists for the apartment", () => {
    const unmapped = { ...STUB_HOTELS[0], name: "Nonexistent Villa" };
    render(<ApartmentCard apartment={unmapped} />);

    expect(screen.getByRole("button", { name: /Book/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Message host/i }),
    ).not.toBeInTheDocument();
  });
});
