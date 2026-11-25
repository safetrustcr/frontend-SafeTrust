"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactButtonProps {
  onContact?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function ContactButton({
  onContact,
  disabled = false,
  className,
}: ContactButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onContact}
      disabled={disabled}
      aria-label="Contact host"
      className={cn("flex items-center gap-2", className)}
    >
      <MessageCircle className="w-4 h-4" />
      <span className="hidden sm:inline">Contact Host</span>
    </Button>
  );
}
