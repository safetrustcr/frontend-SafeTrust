import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Buildings from "@/components/auth/ui/Buildings";

export default function VerifyEmail() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <div className="bg-primary p-3 rounded-full">
            <MailCheck className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold">Check your E-mail</h1>
        <p className="text-muted-foreground text-sm">
          Please, check your email and type the code sent to{" "}
          <span className="font-semibold text-foreground">
            JhonCasas@gmail.com
          </span>
        </p>

        <div className="flex justify-center space-x-2">
          {Array(6)
            .fill("")
            .map((_, index) => (
              <Input
                key={index}
                className="w-12 h-12 text-center text-lg"
                maxLength={1}
              />
            ))}
        </div>

        <Button className="w-full">Resend code</Button>
      </div>

      <Buildings />
    </div>
  );
}
