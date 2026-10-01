// src/components/ui/icon-button.tsx
import { forwardRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

type IconButtonProps = Omit<ButtonProps, "children" | "aria-label" | "asChild"> & { label: string; icon: React.ReactNode };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({ label, icon, ...props }, ref) => (
  <Button ref={ref} size="icon" variant="ghost" aria-label={label} title={label} {...props}>
    <span aria-hidden="true">{icon}</span>
  </Button>
));
IconButton.displayName = "IconButton";
