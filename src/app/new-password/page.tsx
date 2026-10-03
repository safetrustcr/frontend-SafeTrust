"use client";

import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function Page() {
  return (
    <ResetPasswordForm
      onSubmit={async (password: string, _confirmPassword: string) => {
        void password;
        void _confirmPassword;
      }}
      isValidToken={true}
    />
  );
}
