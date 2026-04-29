"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Illustration from "@/components/auth/ui/Illustration";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use":
    "An account with this email already exists",
  "auth/weak-password": "Password must be at least 6 characters",
  "auth/invalid-email": "Invalid email address",
};

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+506");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const clearError = () => setError("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await updateProfile(credential.user, { displayName: fullName });

      const token = await credential.user.getIdToken();

      const syncRes = await fetch("/api/auth/sync-user", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!syncRes.ok) {
        throw new Error("SYNC_USER_FAILED");
      }

      useGlobalAuthenticationStore.getState().setToken(token);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        setError(
          ERROR_MESSAGES[err.code] ??
            "Registration failed — please try again",
        );
      } else {
        setError("Registration failed — please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

   return (
     <div className="relative flex min-h-screen bg-white dark:bg-gray-900">
       <div className="absolute top-4 right-4 z-20">
         <ThemeToggle />
       </div>
       <div className="flex w-full flex-col items-center justify-center px-4 md:w-1/2 dark:bg-gray-800">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center space-x-2">
            <Image src="/img/logo-new.png" alt="SafeTrust" width={40} height={40} />
            <h1 className="text-2xl font-bold">SafeTrust</h1>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="space-y-2">
              <Label className="dark:text-gray-200" htmlFor="name">
                Full Name
              </Label>
               <Input
                 id="name"
                 placeholder="Enter your full name"
                 required
                 value={fullName}
                 onChange={(e) => {
                   setFullName(e.target.value);
                   clearError();
                 }}
                 className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
               />
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-200" htmlFor="phone">
                Phone Number
              </Label>
              <div className="flex gap-2">
                <Select
                  value={phoneCountryCode}
                  onValueChange={(v) => {
                    setPhoneCountryCode(v);
                    clearError();
                  }}
                >
                  <SelectTrigger className="w-[100px] dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+506">+506</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+52">+52</SelectItem>
                    <SelectItem value="+34">+34</SelectItem>
                  </SelectContent>
                </Select>
                 <Input
                   id="phone"
                   type="tel"
                   placeholder="Enter your phone number"
                   required
                   value={phone}
                   onChange={(e) => {
                     setPhone(e.target.value);
                     clearError();
                   }}
                   className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                 />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-200" htmlFor="location">
                Location
              </Label>
              <Select
                value={location || undefined}
                onValueChange={(v) => {
                  setLocation(v);
                  clearError();
                }}
              >
                <SelectTrigger id="location" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select your location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cr">Costa Rica</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="mx">Mexico</SelectItem>
                  <SelectItem value="es">Spain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-200" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-200" htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#2857B8] hover:bg-[#2857B8]/90"
              disabled={isLoading}
            >
              Sign Up
            </Button>

            {error ? (
              <p className="text-center text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}
          </form>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#2857B8] hover:underline dark:text-blue-400"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <Illustration />
    </div>
  );
}
