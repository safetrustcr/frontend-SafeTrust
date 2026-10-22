import { auth } from "@/lib/firebase";
import { isApartmentId, type ReportCategory } from "./report-schema";

export { REPORT_CATEGORIES, validateReportInput } from "./report-schema";
export type { ReportCategory } from "./report-schema";

export class ReportError extends Error {
  constructor(
    readonly code: string,
    message = code,
  ) {
    super(message);
    this.name = "ReportError";
  }
}

export async function submitListingReport(
  listingId: string,
  input: { category: ReportCategory; details?: string },
  clientOpId: string,
): Promise<{ id: string; status: "open" }> {
  if (!isApartmentId(listingId)) {
    throw new ReportError("BACKEND_NOT_CONFIGURED");
  }

  const user = auth.currentUser;
  if (!user) throw new ReportError("UNAUTHENTICATED");

  const token = await user.getIdToken();
  const response = await fetch(
    `/api/listings/${encodeURIComponent(listingId)}/reports`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...input,
        ...(input.details?.trim() ? { details: input.details.trim() } : {}),
        clientOpId,
      }),
    },
  );

  const data: unknown = await response.json().catch(() => ({}));
  const error =
    response.status === 429
      ? "429"
      : data && typeof data === "object" && "error" in data
        ? String(data.error)
        : `HTTP_${response.status}`;

  if (!response.ok) throw new ReportError(error);

  if (
    !data ||
    typeof data !== "object" ||
    !("id" in data) ||
    typeof data.id !== "string" ||
    !("status" in data) ||
    data.status !== "open"
  ) {
    throw new ReportError("INVALID_RESPONSE");
  }

  return { id: data.id, status: "open" };
}
