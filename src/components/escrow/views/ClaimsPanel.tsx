"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  claimErrorMessage,
  submitClaim,
  type ClaimReceipt,
} from "@/features/escrow/claims";

const MIN = 10;
const MAX = 2000;

interface ClaimsPanelProps {
  escrowId: string;
  placeholder: string;
  /** False in demo/standalone mode, where there is no claims backend. */
  available: boolean;
}

export function ClaimsPanel({
  escrowId,
  placeholder,
  available,
}: ClaimsPanelProps) {
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "failed">("idle");
  const [receipt, setReceipt] = useState<ClaimReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Same id for retries of the same draft, so a retry never duplicates a claim.
  const opId = useRef<string | null>(null);
  const length = draft.trim().length;

  useEffect(() => {
    if (!draft) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [draft]);

  const send = async () => {
    if (!available || length < MIN || state === "sending") return;
    opId.current ??= crypto.randomUUID();
    setState("sending");
    setError(null);
    try {
      setReceipt(await submitClaim(escrowId, draft.trim(), opId.current));
      setDraft("");
      opId.current = null;
      setState("idle");
    } catch (e) {
      setState("failed");
      setError(claimErrorMessage(e));
    }
  };

  const clear = () => {
    setDraft("");
    setError(null);
    setState("idle");
    opId.current = null;
  };

  if (receipt) {
    return (
      <section
        role="status"
        className="space-y-2 rounded-lg border border-border bg-card p-4 text-sm"
      >
        <p>
          Claim sent to SafeTrust review. Reference{" "}
          <span className="font-mono">{receipt.id.slice(0, 8)}</span>.
          We&apos;ll review it and contact you.
        </p>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0"
          onClick={() => setReceipt(null)}
        >
          Send another claim
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="claims-heading" className="space-y-3">
      <h2 id="claims-heading" className="text-sm font-semibold text-foreground">
        Claims
      </h2>
      <p className="text-xs text-muted-foreground">
        Claims go to SafeTrust review, not to the host.
      </p>
      <Label htmlFor="claim-body" className="sr-only">
        Describe your claim
      </Label>
      <Textarea
        id="claim-body"
        value={draft}
        maxLength={MAX}
        placeholder={placeholder}
        onChange={(e) => {
          setDraft(e.target.value);
          opId.current = null;
        }}
        aria-describedby="claim-help"
        disabled={state === "sending"}
        className="min-h-[100px] resize-y"
      />
      <p
        id="claim-help"
        aria-live="polite"
        className="text-xs text-muted-foreground"
      >
        {available
          ? state === "sending"
            ? "Sending your claim…"
            : `At least ${MIN} characters · ${length}/${MAX}`
          : "Sending claims isn't available yet in this environment."}
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="sm:w-auto"
          onClick={clear}
          disabled={!draft || state === "sending"}
        >
          Clear
        </Button>
        <Button
          type="button"
          className="sm:w-auto"
          onClick={send}
          disabled={!available || length < MIN || state === "sending"}
        >
          {state === "sending"
            ? "Sending…"
            : state === "failed"
              ? "Try again"
              : "Send"}
        </Button>
      </div>
    </section>
  );
}
