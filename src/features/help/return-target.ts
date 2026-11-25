import { resolveRedirectPath } from "@/lib/auth/redirect";

export function safeRentReturn(from?: string | null): string {
  const target = resolveRedirectPath(from, "/rent");
  return target === "/rent" || target.startsWith("/rent?") ? target : "/rent";
}
