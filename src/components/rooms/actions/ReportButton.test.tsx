import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import ReportButton from "./ReportButton";
import { auth } from "@/lib/firebase";
import { ReportError, submitListingReport } from "@/features/listings/reports";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/lib/firebase", () => ({
  auth: { currentUser: { getIdToken: jest.fn() } },
}));

jest.mock("@/features/listings/reports", () => ({
  REPORT_CATEGORIES: [
    { value: "safety", label: "Safety concern" },
    { value: "other", label: "Something else" },
  ],
  ReportError: class ReportError extends Error {
    constructor(readonly code: string) {
      super(code);
    }
  },
  submitListingReport: jest.fn(),
  validateReportInput: (category: string, details: string) => {
    if (!category) return "Choose a category for this report.";
    if (category === "other" && details.trim().length < 10) {
      return "Please provide at least 10 characters of details.";
    }
    return null;
  },
}));

const mockSubmit = jest.mocked(submitListingReport);
const validId = "123e4567-e89b-42d3-a456-426614174000";

describe("ReportButton", () => {
  const originalDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
    (auth as unknown as { currentUser: unknown }).currentUser = {
      getIdToken: jest.fn().mockResolvedValue("token"),
    };
  });

  afterAll(() => {
    if (originalDemoMode === undefined) {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
    } else {
      process.env.NEXT_PUBLIC_DEMO_MODE = originalDemoMode;
    }
  });

  it("requires a category and details for other before enabling submission", () => {
    render(<ReportButton listingId={validId} listingName="Apartment" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Report this listing" }),
    );

    const submit = screen.getByRole("button", { name: "Submit Report" });
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByLabelText("Something else"));
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Details (required)"), {
      target: { value: "The listing is misleading." },
    });
    expect(submit).toBeEnabled();
  });

  it("shows confirmation and focuses it only after the server accepts", async () => {
    mockSubmit.mockResolvedValue({ id: "report-1", status: "open" });
    render(<ReportButton listingId={validId} listingName="Apartment" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Report this listing" }),
    );
    fireEvent.click(screen.getByLabelText("Safety concern"));
    fireEvent.click(screen.getByRole("button", { name: "Submit Report" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveFocus());
    expect(
      screen.getByText(
        "Thanks. We've received your report and our team will review it.",
      ),
    ).toBeInTheDocument();
    expect(mockSubmit).toHaveBeenCalledWith(
      validId,
      { category: "safety" },
      expect.any(String),
    );
  });

  it("keeps the form and reuses the operation ID when retrying failed submissions", async () => {
    mockSubmit
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce({ id: "report-1", status: "open" });
    render(<ReportButton listingId={validId} listingName="Apartment" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Report this listing" }),
    );
    fireEvent.click(screen.getByLabelText("Safety concern"));
    fireEvent.click(screen.getByRole("button", { name: "Submit Report" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Check your connection and try again.",
    );
    expect(
      screen.getByRole("button", { name: "Submit Report" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Submit Report" }));
    await screen.findByText(
      "Thanks. We've received your report and our team will review it.",
    );
    expect(mockSubmit.mock.calls[0][2]).toBe(mockSubmit.mock.calls[1][2]);
  });

  it("keeps an in-flight report attempt when the dialog is closed and reopened", async () => {
    let rejectFirst!: (error: TypeError) => void;
    mockSubmit.mockImplementationOnce(
      () =>
        new Promise<Awaited<ReturnType<typeof submitListingReport>>>(
          (_, reject) => {
            rejectFirst = reject;
          },
        ),
    );
    render(<ReportButton listingId={validId} listingName="Apartment" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Report this listing" }),
    );
    fireEvent.click(screen.getByLabelText("Safety concern"));
    fireEvent.click(screen.getByRole("button", { name: "Submit Report" }));
    const operationId = mockSubmit.mock.calls[0][2];

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Report this listing" }),
    );
    expect(screen.getByLabelText("Safety concern")).toBeChecked();
    expect(screen.getByRole("button", { name: /Sending/ })).toBeDisabled();

    await act(async () => {
      rejectFirst(new TypeError("offline"));
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Check your connection and try again.",
    );
    mockSubmit.mockResolvedValueOnce({ id: "report-1", status: "open" });
    fireEvent.click(screen.getByRole("button", { name: "Submit Report" }));
    await screen.findByText(
      "Thanks. We've received your report and our team will review it.",
    );
    expect(mockSubmit.mock.calls[1][2]).toBe(operationId);
  });

  it.each([
    ["CANNOT_REPORT_OWN_LISTING", "You can't report your own listing."],
    ["429", "You've sent several reports recently. Try again later."],
    [
      "BACKEND_NOT_CONFIGURED",
      "Reporting isn't available in this environment.",
    ],
    ["DEMO_MODE", "Reporting isn't available in this environment."],
  ])("shows the specific message for %s", async (code, message) => {
    mockSubmit.mockRejectedValueOnce(new ReportError(code));
    render(<ReportButton listingId={validId} listingName="Apartment" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Report this listing" }),
    );
    fireEvent.click(screen.getByLabelText("Safety concern"));
    fireEvent.click(screen.getByRole("button", { name: "Submit Report" }));

    const messageElement =
      code === "BACKEND_NOT_CONFIGURED" || code === "DEMO_MODE"
        ? await screen.findByRole("status")
        : await screen.findByRole("alert");
    expect(messageElement).toHaveTextContent(message);
    expect(screen.queryByText(/team will review/i)).not.toBeInTheDocument();
  });

  it("shows the unavailable state for fixture IDs without a review promise", () => {
    render(<ReportButton listingId="1" listingName="Demo apartment" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Report this listing" }),
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Reporting isn't available in this environment.",
    );
    expect(screen.queryByText(/team will review/i)).not.toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("redirects signed-out users to login and preserves the listing URL", () => {
    (auth as unknown as { currentUser: unknown }).currentUser = null;
    window.history.pushState({}, "", "/rent/1?checkIn=2030-01-01");
    render(<ReportButton listingId={validId} listingName="Apartment" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Report this listing" }),
    );

    expect(mockPush).toHaveBeenCalledWith(
      "/login?redirect=%2Frent%2F1%3FcheckIn%3D2030-01-01",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
