export const REPORT_CATEGORIES = [
  { value: "inaccurate", label: "Inaccurate or misleading" },
  { value: "scam_or_fraud", label: "Scam or fraud" },
  { value: "offensive", label: "Offensive content" },
  { value: "safety", label: "Safety concern" },
  { value: "duplicate", label: "Duplicate listing" },
  { value: "other", label: "Something else" },
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number]["value"];

export const isApartmentId = (id: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );

export const isReportCategory = (value: unknown): value is ReportCategory =>
  REPORT_CATEGORIES.some((category) => category.value === value);

export const validateReportInput = (
  category: ReportCategory | "",
  details: string,
): string | null => {
  if (!category) return "Choose a category for this report.";
  if (details.length > 1000) return "Details must be 1000 characters or fewer.";
  if (category === "other" && details.trim().length < 10) {
    return "Please provide at least 10 characters of details.";
  }
  return null;
};
