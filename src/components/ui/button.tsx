import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out",
    "focus-visible:outline-none    focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Light: white glass, dark text, border + shadow. Dark: orange-500 fill, slate-950 text.
        // Focus = 2px orange ring + offset on white, dark and orange surfaces.
        default: [
          "border border-white/30 bg-white text-slate-900 font-semibold shadow-sm hover:shadow-md active:shadow-sm",
          "hover:bg-slate-50",
          "dark:border-orange-700/60 dark:bg-orange-500 dark:text-slate-950",
          "dark:hover:bg-orange-400 dark:hover:text-slate-950",
        ].join(" "),
        // Light: translucent white, neutral border. Dark: orange border + orange-300 text.
        outline: [
          "border border-border bg-background/70 text-foreground shadow-sm backdrop-blur-sm hover:bg-orange-50",
          "dark:border-orange-700 dark:text-orange-300",
          "hover:dark:bg-orange-500/10",
          "dark:hover:text-orange-200",
        ].join(" "),
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: [
          "text-primary underline-offset-4 hover:underline",
          "dark:text-orange-300",
          "hover:dark:text-orange-200",
        ].join(" "),
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
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
