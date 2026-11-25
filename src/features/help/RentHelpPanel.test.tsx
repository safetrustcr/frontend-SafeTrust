import "@testing-library/jest-dom";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useRef, useState } from "react";
import { RentHelpPanel } from "./RentHelpPanel";

// Mutable so each test can pick the advertised Stellar network. Keep the
// variable name `mock*`-prefixed: jest.mock factories may only reference those.
const mockNetwork = { value: "testnet" as "testnet" | "mainnet" };

jest.mock("@/config/env", () => ({
  clientEnv: {
    get NEXT_PUBLIC_TRUSTLESS_NETWORK() {
      return mockNetwork.value;
    },
  },
}));

jest.mock("next/navigation", () => ({
  usePathname: () => mockLocation.pathname,
  useSearchParams: () => new URLSearchParams(mockLocation.search),
}));

const mockLocation = {
  pathname: "/rent",
  search: "",
};

beforeEach(() => {
  mockLocation.pathname = "/rent";
  mockLocation.search = "";
  mockNetwork.value = "testnet";
});

function Harness() {
  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={launcherRef} type="button" onClick={() => setOpen(true)}>
        Help &amp; docs
      </button>
      <RentHelpPanel
        open={open}
        onOpenChange={setOpen}
        restoreFocusTo={() => launcherRef.current}
      />
    </>
  );
}

const openPanel = async () => {
  render(<Harness />);
  const launcher = screen.getByRole("button", { name: "Help & docs" });
  launcher.focus();
  fireEvent.click(launcher);
  const dialog = await screen.findByRole("dialog");
  return { dialog, launcher };
};

// While the sheet is open the page behind it is made inert, so helpers must
// reference nodes captured before opening. The nav links live inside the
// dialog and remain accessible while it is open.
const navLinks = () => {
  const nav = screen.getByRole("navigation", { name: "Help topics" });
  return Array.from(within(nav).getAllByRole("link")).map((link) => ({
    href: link.getAttribute("href") ?? "",
    text: link.textContent ?? "",
  }));
};

describe("RentHelpPanel", () => {
  it("announces itself as 'Help & docs, dialog' with exactly one close button", async () => {
    await openPanel();

    expect(screen.getByRole("dialog", { name: "Help & docs" })).toBeVisible();
    expect(screen.getAllByRole("button", { name: "Close" })).toHaveLength(1);
  });

  it("links all five quick guides to their /help articles", async () => {
    await openPanel();

    const from = encodeURIComponent("/rent");
    const guides = navLinks().filter(
      (link) => link.href.startsWith("/help/") && !link.href.includes("from=/"),
    );
    // Five quick guides plus "Open full documentation" -> href is exactly
    // /help/<slug>?from=<encoded rent snapshot>.
    expect(guides.map((link) => link.href)).toEqual([
      `/help/using-rent-filters?from=${from}`,
      `/help/guest-guide?from=${from}`,
      `/help/escrow-explained?from=${from}`,
      `/help/host-guide?from=${from}`,
      `/help/troubleshooting?from=${from}`,
    ]);
    expect(guides.map((link) => link.text)).toEqual([
      "Finding a placeDestinations, filters, sort and location.",
      "Guest guideSave, message hosts, book.",
      "How escrow payments workWhere your money is held and who releases it.",
      "Host guideList a property and manage offers.",
      "TroubleshootingLocation, wallet and payment issues.",
    ]);
  });

  it("encodes the current path and query parameters into the from parameter", async () => {
    mockLocation.search = "sort=nearest&q=San%20Jos%C3%A9";
    await openPanel();

    // The panel rebuilds the search from the parsed params, which normalizes
    // spaces to '+', exactly what a real Next.js URL would produce.
    const query = new URLSearchParams(mockLocation.search).toString();
    const from = encodeURIComponent(`/rent?${query}`);
    const nav = navLinks();
    expect(
      nav.find((link) => link.text.includes("Finding a place"))?.href,
    ).toBe(`/help/using-rent-filters?from=${from}`);
    expect(
      screen
        .getByRole("link", { name: "Open full documentation" })
        .getAttribute("href"),
    ).toBe(`/help?from=${from}`);
  });

  it("shows the Stellar network and the testnet test-money clarification", async () => {
    await openPanel();

    expect(screen.getByText(/Stellar network:/)).toHaveTextContent("testnet");
    expect(screen.getByText(/test money only/)).toBeInTheDocument();
  });

  it("omits the test-money clarification on mainnet", async () => {
    mockNetwork.value = "mainnet";
    await openPanel();

    expect(screen.getByText(/Stellar network:/)).toHaveTextContent("mainnet");
    expect(screen.queryByText(/test money only/)).not.toBeInTheDocument();
  });

  it("closes with Escape, restores focus to the launcher and keeps the URL", async () => {
    // The URL itself must never change while the panel opens or closes.
    const urlBefore = window.location.href;
    const { dialog, launcher } = await openPanel();

    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    // Radix restores launcher focus in a queued task after unmount.
    await waitFor(() => expect(launcher).toHaveFocus());
    expect(window.location.href).toBe(urlBefore);
  });

  it("reuses the same from snapshot for every link, including full documentation", async () => {
    mockLocation.search = "sort=price-low";
    await openPanel();

    const from = encodeURIComponent("/rent?sort=price-low");
    const hrefs = [
      ...navLinks().map((link) => link.href),
      screen
        .getByRole("link", { name: "Open full documentation" })
        .getAttribute("href"),
    ];
    for (const href of hrefs) {
      expect(href).toContain(`from=${from}`);
    }
    expect(hrefs).toHaveLength(6);
  });
});
