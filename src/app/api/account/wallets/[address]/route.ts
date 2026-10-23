import { proxyToBackend } from "@/app/api/account/_proxy";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ address: string }> },
) {
  const { address } = await params;
  return proxyToBackend(
    request,
    `/api/auth/wallets/${encodeURIComponent(address)}`,
    { method: "DELETE" },
  );
}
