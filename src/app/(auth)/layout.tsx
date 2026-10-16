import type { ReactNode } from "react";
import { AuthProvider } from "@/providers/AuthProvider";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center">
        {children}
      </div>
    </AuthProvider>
  );
}
