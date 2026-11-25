import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ChartContainer } from "./ChartContainer";

jest.mock("recharts", () => {
  const Stub = () => null;
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="chart">{children}</div>
    ),
    LineChart: Stub,
    BarChart: Stub,
    AreaChart: Stub,
    Line: Stub,
    Bar: Stub,
    Area: Stub,
    XAxis: Stub,
    YAxis: Stub,
    CartesianGrid: Stub,
    Tooltip: Stub,
  };
});

const data = [
  { date: "2026-01-01", pageViews: 1000, clicks: 200, users: 80 },
  { date: "2026-01-02", pageViews: 1080, clicks: 196, users: 90 },
];

describe("ChartContainer text alternative", () => {
  it("names the figure after the title and describes it with a visible summary", () => {
    render(<ChartContainer data={data} title="Traffic Overview" />);

    const figure = screen.getByRole("figure", { name: "Traffic Overview" });
    const summary = within(figure).getByText(/Page Views: 1,080, up 8%/);
    expect(summary).toHaveTextContent("Clicks: 196, down 2%");
    expect(summary).not.toHaveClass("sr-only");
    expect(figure).toHaveAccessibleDescription(summary.textContent!);
  });

  it("follows the selected metrics", () => {
    render(<ChartContainer data={data} title="Traffic Overview" />);

    fireEvent.click(screen.getByRole("button", { name: "Users" }));
    expect(screen.getByRole("figure")).toHaveAccessibleDescription(
      /Users: 90, up 13%/,
    );
  });

  it("toggles a captioned data table in place of the chart", () => {
    render(<ChartContainer data={data} title="Traffic Overview" />);

    const toggle = screen.getByRole("button", { name: "View as table" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("chart")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByTestId("chart")).not.toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Traffic Overview" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual(["Date", "Page Views", "Clicks"]);
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    expect(within(table).getByText("1,080")).toBeInTheDocument();
    expect(
      document.getElementById(toggle.getAttribute("aria-controls")!),
    ).toContainElement(table);

    fireEvent.click(toggle);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByTestId("chart")).toBeInTheDocument();
  });

  it("applies the responsive height classes", () => {
    render(
      <ChartContainer
        data={data}
        title="Traffic Overview"
        heightClassName="h-60 sm:h-80"
      />,
    );
    expect(screen.getByTestId("chart").parentElement).toHaveClass(
      "h-60",
      "sm:h-80",
    );
  });
});
