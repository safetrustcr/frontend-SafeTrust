"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-1 text-sm ${className}`}
    >
      <Link
        href="/"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4 text-breadcrumb-separator" />
          {item.href && !item.isCurrentPage ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={
                item.isCurrentPage
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};
