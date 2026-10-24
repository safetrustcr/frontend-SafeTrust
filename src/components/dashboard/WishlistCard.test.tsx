import { render, screen } from "@testing-library/react";
import { WishlistCard } from "./WishlistCard";

describe("WishlistCard", () => {
  it("links to the wishlist with its name and subtitle", () => {
    render(
      <WishlistCard
        name="Saved stays"
        subtitle="2 stays"
        images={["/img/a.webp", "/img/b.webp"]}
        href="/dashboard/favorites/saved"
      />,
    );

    expect(screen.getByRole("link", { name: /saved stays/i })).toHaveAttribute(
      "href",
      "/dashboard/favorites/saved",
    );
    expect(screen.getByText("2 stays")).toBeInTheDocument();
  });
});
