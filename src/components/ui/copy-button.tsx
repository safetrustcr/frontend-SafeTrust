"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({
  text,
  label = "Copy",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setCopied(true);
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
        className,
      )}
    >
      {copied ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400">
            Copied!
          </span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 text-slate-500" />
          <span className="text-slate-600 dark:text-slate-400">{label}</span>
        </>
      )}
    </button>
  );
}
