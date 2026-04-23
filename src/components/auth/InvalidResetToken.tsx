import Link from "next/link";
import { KeyRound } from "lucide-react";

export default function InvalidResetToken() {
  return (
    <div className="relative z-10 w-full max-w-sm space-y-6 text-center">
      <div className="flex justify-center">
        <div className="bg-[#2857B8] p-3 rounded-full">
          <KeyRound className="h-10 w-10 text-white" />
        </div>
      </div>
      <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
      <p className="text-gray-500 text-sm">
        This reset link is invalid or has expired
      </p>
      <Link
        href="/forgot-password"
        className="text-[#2857B8] hover:underline block"
      >
        Request a new reset link
      </Link>
    </div>
  );
}
