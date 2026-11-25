import { proxyToBackend } from "@/app/api/account/_proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ address: string }> },
) {
  const { address } = await params;
  return proxyToBackend(
    request,
    `/api/auth/wallets/${encodeURIComponent(address)}/primary`,
    { method: "POST" },
  );
}
