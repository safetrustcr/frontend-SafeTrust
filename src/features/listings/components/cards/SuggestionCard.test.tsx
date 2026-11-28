import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import SuggestionCard from "./SuggestionCard";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    fill: _fill,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt="" {...props} />
  ),
}));

const mockPush = jest.fn();

describe("SuggestionCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  const baseProps = {
    id: "2",
    name: "Casa Pacifica",
    address: "Nosara, Guanacaste",
    price: 120,
    bedrooms: 2,
    bathrooms: 1,
    petFriendly: true,
  };

  it("renders with the CSS-only glass surface and visible focus rings", () => {
    const { container } = render(<SuggestionCard {...baseProps} />);
    const card = container.firstElementChild as HTMLElement;

    expect(card).toHaveClass("dashboard-glass-card");
    expect(card).not.toHaveClass("bg-card");

    const viewButton = screen.getByRole("button", {
      name: "View Casa Pacifica",
    });
    expect(viewButton).toHaveClass(
      "focus-visible:ring-2",
      "focus-visible:ring-ring",
    );
    expect(viewButton).not.toHaveAttribute("aria-current");

    const likeButton = screen.getByRole("button", {
      name: "Like Casa Pacifica",
    });
    expect(likeButton).toHaveClass(
      "focus-visible:ring-2",
      "focus-visible:ring-ring",
    );
  });

  it("marks a selected suggestion card with an orange border and aria-current", () => {
    const { container } = render(<SuggestionCard {...baseProps} isSelected />);
    const card = container.firstElementChild as HTMLElement;

    expect(card).toHaveClass("dashboard-glass-card", "border-primary");
    expect(
      screen.getByRole("button", { name: "View Casa Pacifica" }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("invokes onClick and onLike callbacks", () => {
    const onClick = jest.fn();
    const onLike = jest.fn();
    render(<SuggestionCard {...baseProps} onClick={onClick} onLike={onLike} />);

    fireEvent.click(screen.getByRole("button", { name: "View Casa Pacifica" }));
    expect(onClick).toHaveBeenCalledWith("2");

    fireEvent.click(screen.getByRole("button", { name: "Like Casa Pacifica" }));
    expect(onLike).toHaveBeenCalledWith("2");
  });
});
