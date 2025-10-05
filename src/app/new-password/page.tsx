
"use client";

import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function Page() {
  return (
    <ResetPasswordForm
      onSubmit={async (password: string, confirmPassword: string) => {
        console.log('New password:', password);
      }}
      isValidToken={true}
    />
  );
}
