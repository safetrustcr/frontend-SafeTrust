import { proxyToBackend } from "@/lib/api/proxy";

export function GET(request: Request) {
  const { search } = new URL(request.url);
  return proxyToBackend(request, `/api/reservations${search}`, {
    method: "GET",
  });
}
