"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import {
  REPORT_CATEGORIES,
  ReportError,
  submitListingReport,
  validateReportInput,
  type ReportCategory,
} from "@/features/listings/reports";
import { isApartmentId } from "@/features/listings/report-schema";

interface ReportButtonProps {
  listingId: string;
  listingName: string;
  className?: string;
}

const errorMessage = (error: unknown): string => {
  const code = error instanceof ReportError ? error.code : "";
  if (code === "CANNOT_REPORT_OWN_LISTING") {
    return "You can't report your own listing.";
  }
  if (code === "429" || code === "HTTP_429" || code === "RATE_LIMITED") {
    return "You've sent several reports recently. Try again later.";
  }
  if (
    code === "BACKEND_NOT_CONFIGURED" ||
    code === "DEMO_MODE"
  ) {
    return "Reporting isn't available in this environment.";
  }
  if (error instanceof TypeError) {
    return "We couldn't send your report. Check your connection and try again.";
  }
  return "We couldn't send your report. Please try again.";
};

const createClientOpId = (): string => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
};

export default function ReportButton({
  listingId,
  listingName,
  className,
}: ReportButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<ReportCategory | "">("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState("");
  const successRef = useRef<HTMLParagraphElement>(null);
  const operationRef = useRef<{ key: string; id: string } | null>(null);
  const submitLockRef = useRef(false);
  const validationError = validateReportInput(category, details);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  const handleOpen = () => {
    if (!auth.currentUser) {
      const redirect = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    const isUnavailable =
      process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
      !isApartmentId(listingId);
    setUnavailable(isUnavailable);
    setCategory("");
    setDetails("");
    setError("");
    setSubmitted(false);
    operationRef.current = null;
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !category ||
      validationError ||
      unavailable ||
      isSubmitting ||
      submitLockRef.current
    ) {
      return;
    }
    setError("");
    setIsSubmitting(true);
    submitLockRef.current = true;

    try {
      const key = JSON.stringify([listingId, category, details.trim()]);
      let operation = operationRef.current;
      if (!operation || operation.key !== key) {
        operation = { key, id: createClientOpId() };
        operationRef.current = operation;
      }

      await submitListingReport(
        listingId,
        {
          category,
          ...(details.trim() ? { details: details.trim() } : {}),
        },
        operation.id,
      );
      setSubmitted(true);
      operationRef.current = null;
    } catch (submitError) {
      const message = errorMessage(submitError);
      setError(message);
      if (message === "Reporting isn't available in this environment.") {
        setUnavailable(true);
      }
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className={cn(
          "text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
          className,
        )}
      >
        <Flag className="mr-2 h-4 w-4" />
        Report this listing
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report {listingName}
          </DialogTitle>
          <DialogDescription>
            {submitted
              ? "Your report was accepted."
              : unavailable
                ? "Reporting isn't available in this environment."
                : "Choose a reason for reporting this listing."}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-4">
            <p
              ref={successRef}
              tabIndex={-1}
              role="status"
              className="outline-none"
            >
              Thanks. We&apos;ve received your report and our team will review
              it.
            </p>
            <DialogFooter className="mt-6">
              <Button onClick={() => setIsOpen(false)}>Close</Button>
            </DialogFooter>
          </div>
        ) : unavailable ? (
          <div className="py-4">
            <p role="status">
              Reporting isn&apos;t available in this environment.
            </p>
            <DialogFooter className="mt-6">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <fieldset className="space-y-3">
                <legend className="mb-2 text-sm font-medium">
                  Report category <span aria-hidden="true">*</span>
                </legend>
                {REPORT_CATEGORIES.map((option) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <input
                      id={`report-${listingId}-${option.value}`}
                      type="radio"
                      name={`report-category-${listingId}`}
                      value={option.value}
                      checked={category === option.value}
                      onChange={() => setCategory(option.value)}
                      className="h-4 w-4 accent-destructive"
                    />
                    <Label htmlFor={`report-${listingId}-${option.value}`}>
                      {option.label}
                    </Label>
                  </div>
                ))}
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor={`report-details-${listingId}`}>
                  Details{category === "other" ? " (required)" : " (optional)"}
                </Label>
                <Textarea
                  id={`report-details-${listingId}`}
                  placeholder="Add details that can help us understand the issue."
                  value={details}
                  maxLength={1000}
                  onChange={(event) => setDetails(event.target.value)}
                  aria-describedby={
                    category === "other"
                      ? `report-details-hint-${listingId}`
                      : undefined
                  }
                />
                {category === "other" && (
                  <p
                    id={`report-details-hint-${listingId}`}
                    className="text-xs text-muted-foreground"
                  >
                    Enter at least 10 characters.
                  </p>
                )}
              </div>
              {error && <p role="alert">{error}</p>}
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => void handleSubmit()}
                disabled={!category || !!validationError || isSubmitting}
              >
                {isSubmitting ? "Sending…" : "Submit Report"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
