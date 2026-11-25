import { proxyToBackend } from "@/app/api/account/_proxy";

export function GET(request: Request) {
  return proxyToBackend(request, "/api/auth/wallets", { method: "GET" });
}
