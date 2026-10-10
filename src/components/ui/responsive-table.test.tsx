import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ResponsiveTable, type Column } from "./responsive-table";

type Listing = { id: string; name: string; promoted: boolean };
const rows: Listing[] = [{ id: "escrow-123-long-id", name: "Bay apartment", promoted: true }];
const columns: Column<Listing>[] = [
  { key: "name", header: "Name", primary: true, cell: (row) => row.name },
  { key: "id", header: "ID", cell: (row) => row.id },
  { key: "promoted", header: "Promoted", cell: (row) => row.promoted ? "Yes" : "No" },
];

describe("ResponsiveTable", () => {
  it("retains every data field and the row action in both desktop and mobile views", () => {
    const { container } = render(
      <ResponsiveTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        rowActions={() => <button type="button">View</button>}
      />,
    );

    expect(screen.getAllByText("escrow-123-long-id")).toHaveLength(2);
    expect(screen.getAllByText("Yes")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "View" })).toHaveLength(2);
    expect(container.querySelector("ul dl")).toHaveTextContent("ID");
  });

  it("shows the empty state on both viewports", () => {
    render(<ResponsiveTable columns={columns} rows={[]} getRowKey={(row) => row.id} emptyMessage="No listings" />);
    expect(screen.getAllByText("No listings")).toHaveLength(2);
  });
});
