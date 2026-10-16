import type { ReactNode } from "react";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { WalletProviderScoped } from "@/providers/WalletProviderScoped";
import { EscrowProviders } from "@/providers/EscrowProviders";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        <WalletProviderScoped>
          <EscrowProviders>{children}</EscrowProviders>
        </WalletProviderScoped>
      </QueryProvider>
    </AuthProvider>
  );
}
