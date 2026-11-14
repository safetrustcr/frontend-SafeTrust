import { render } from "@testing-library/react";
import { DashboardRunes } from "./DashboardRunes";

describe("DashboardRunes", () => {
  it("shows the runes but keeps them from screen readers", () => {
    const { container } = render(<DashboardRunes />);

    expect(container).toHaveTextContent("ᛒᛁ ᛋᚬᛏᚬ ᚺᛖᚱᚱᛖᚱᚨ");
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});
