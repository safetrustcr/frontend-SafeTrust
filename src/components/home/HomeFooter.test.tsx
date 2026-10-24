import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { HomeFooter } from "./HomeFooter";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt="" {...props} />
  ),
}));

describe("HomeFooter", () => {
  it("renders a footer landmark with a nav labelled 'Footer'", () => {
    render(<HomeFooter />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();

    const nav = screen.getByRole("navigation", { name: "Footer" });
    expect(nav).toBeInTheDocument();
  });

  it("renders the SafeTrust brand link pointing to home with logo and text", () => {
    render(<HomeFooter />);
    const brandLink = screen.getByRole("link", { name: "SafeTrust" });
    expect(brandLink).toHaveAttribute("href", "/");
  });

  it("renders all expected left navigation links", () => {
    render(<HomeFooter />);
    const homeLinks = screen.getAllByRole("link", { name: "Home" });
    expect(homeLinks.length).toBeGreaterThanOrEqual(1);
    expect(homeLinks[0]).toHaveAttribute("href", "/");

    const browseLink = screen.getByRole("link", { name: "Browse stays" });
    expect(browseLink).toHaveAttribute("href", "/rent");

    const suggestionsLink = screen.getByRole("link", { name: "Suggestions" });
    expect(suggestionsLink).toHaveAttribute("href", "/guest/suggestions");
  });

  it("renders all expected right navigation links including external GitHub link", () => {
    render(<HomeFooter />);
    const listPropertyLink = screen.getByRole("link", {
      name: "List your property",
    });
    expect(listPropertyLink).toHaveAttribute(
      "href",
      "/login?redirect=/dashboard/apartments/new",
    );

    const githubLink = screen.getByRole("link", { name: "GitHub" });
    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/safetrustcr",
    );
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not contain any empty or '#' links", () => {
    const { container } = render(<HomeFooter />);
    const links = container.querySelectorAll("a");
    for (const link of links) {
      const href = link.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).not.toBe("#");
    }
  });
});
