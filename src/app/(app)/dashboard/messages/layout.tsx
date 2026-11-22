import type { ReactNode } from "react";
import { MessagesShell } from "@/features/messages";

export default function MessagesLayout({ children }: { children: ReactNode }) {
  return <MessagesShell>{children}</MessagesShell>;
}
