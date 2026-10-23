import { proxyToBackend } from "@/app/api/account/_proxy";

export function POST(request: Request) {
  return proxyToBackend(request, "/api/auth/wallet/challenge", {
    method: "POST",
  });
}
