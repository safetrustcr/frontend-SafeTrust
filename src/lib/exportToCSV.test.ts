import { exportTransactionsToCSV, TransactionRow } from "./exportToCSV";

describe("exportTransactionsToCSV", () => {
  let originalCreateObjectURL: typeof window.URL.createObjectURL;
  let originalRevokeObjectURL: typeof window.URL.revokeObjectURL;
  let createdUrl: string;
  let linkClickSpy: jest.SpyInstance;
  let createdLink: HTMLAnchorElement | null = null;

  beforeEach(() => {
    createdUrl = "blob:http://localhost/test-blob-url";
    originalCreateObjectURL = window.URL.createObjectURL;
    originalRevokeObjectURL = window.URL.revokeObjectURL;

    window.URL.createObjectURL = jest.fn().mockReturnValue(createdUrl);
    window.URL.revokeObjectURL = jest.fn();

    createdLink = null;
    const originalCreateElement = document.createElement.bind(document);
    jest
      .spyOn(document, "createElement")
      .mockImplementation((tagName: string) => {
        const element = originalCreateElement(tagName);
        if (tagName === "a") {
          createdLink = element as HTMLAnchorElement;
          linkClickSpy = jest
            .spyOn(createdLink, "click")
            .mockImplementation(() => {});
        }
        return element;
      });
  });

  afterEach(() => {
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;
    jest.restoreAllMocks();
  });

  it("should generate CSV and trigger download for transaction rows", () => {
    const mockTransactions: TransactionRow[] = [
      {
        bookingId: "BOOK-101",
        hotel: "Grand Hotel",
        checkIn: "2026-08-01",
        checkOut: "2026-08-05",
        amount: 250,
        asset: "USDC",
        status: "completed",
      },
      {
        bookingId: 'BOOK-"102"',
        hotel: 'Hotel "Lux"',
        checkIn: "2026-08-10",
        checkOut: "2026-08-15",
        amount: 500.5,
        asset: "XLM",
        status: "pending",
      },
    ];

    exportTransactionsToCSV(mockTransactions, "custom-filename.csv");

    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(createdLink).not.toBeNull();
    expect(createdLink?.download).toBe("custom-filename.csv");
    expect(createdLink?.href).toBe(createdUrl);
    expect(linkClickSpy).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(createdUrl);
  });

  it("should use default filename if omitted", () => {
    const mockTransactions: TransactionRow[] = [];

    exportTransactionsToCSV(mockTransactions);

    expect(createdLink?.download).toBe("safetrust-transactions.csv");
  });
});
