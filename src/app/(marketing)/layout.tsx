import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/QueryProvider";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
