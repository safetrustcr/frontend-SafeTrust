import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const lightLift =
  "motion-safe:light:hover:-translate-y-px motion-safe:light:hover:shadow-md motion-safe:light:active:translate-y-0 motion-safe:light:active:shadow-sm";

// Light `default` and `outline` are both white, so a selected button needs more
// than its fill: an orange border plus a shaped bar, never colour alone.
const selectedCue = [
  "aria-[current=page]:border-ring aria-pressed:border-ring",
  "light:aria-[current=page]:shadow-[inset_0_-2px_0_hsl(var(--ring))]",
  "light:aria-pressed:shadow-[inset_0_-2px_0_hsl(var(--ring))]",
].join(" ");

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:transform-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Light: white glass, dark text. Dark: orange fill, slate-950 text (7.2:1).
        default: [
          "border border-action-border bg-action text-action-foreground font-semibold shadow-sm",
          "hover:bg-action-hover hover:shadow-md active:shadow-sm",
          "dark:shadow-[0_0_0_1px_hsl(var(--action-border))]",
          selectedCue,
          lightLift,
        ].join(" "),
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        // Light: translucent white, neutral border. Dark: orange border and text.
        outline: [
          "border border-action-border bg-background/60 text-foreground shadow-sm backdrop-blur-sm hover:bg-accent hover:text-accent-foreground",
          "dark:border-orange-700 dark:bg-transparent dark:text-orange-300 dark:hover:bg-accent dark:hover:text-accent-foreground",
          lightLift,
        ].join(" "),
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline dark:text-orange-300",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
