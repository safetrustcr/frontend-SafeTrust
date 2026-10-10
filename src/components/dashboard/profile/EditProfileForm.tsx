"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountOverviewTable } from "./AccountOverviewTable";
import { AvatarUpload } from "./AvatarUpload";

interface ProfileFormData {
  firstName: string;
  surnames: string;
  phone: string;
  countryCode: string;
  location: string;
  summary: string;
  avatar: File | null;
}

interface AccountData {
  createdAt: string;
  walletAddress: string;
  email: string;
}

const EMPTY_FORM: ProfileFormData = {
  firstName: "",
  surnames: "",
  phone: "",
  countryCode: "+506",
  location: "",
  summary: "",
  avatar: null,
};

const COUNTRY_CODES = [
  { code: "+1",   flag: "🇺🇸", label: "+1" },
  { code: "+44",  flag: "🇬🇧", label: "+44" },
  { code: "+506", flag: "🇨🇷", label: "+506" },
  { code: "+52",  flag: "🇲🇽", label: "+52" },
  { code: "+55",  flag: "🇧🇷", label: "+55" },
  { code: "+34",  flag: "🇪🇸", label: "+34" },
];

export function EditProfileForm() {
  const [form, setForm] = useState<ProfileFormData>(EMPTY_FORM);
  const [account, setAccount] = useState<AccountData>({
    createdAt: "—",
    walletAddress: "—",
    email: "—",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // ── Read Firebase user on mount ──────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const parts = (user.displayName ?? "").split(" ");
        const firstName = parts[0] ?? "";
        const surnames = parts.slice(1).join(" ");

        setForm((prev) => ({
          ...prev,
          firstName,
          surnames,
        }));

        setAccount({
          createdAt: user.metadata.creationTime
            ? new Date(user.metadata.creationTime).toLocaleDateString("en-GB")
            : "—",
          walletAddress: "—", // TODO: read from Hasura → public.users.wallet_address
          email: user.email ?? "—",
        });
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChange =
    (field: keyof ProfileFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      // Update Firebase displayName
      await updateProfile(user, {
        displayName: `${form.firstName} ${form.surnames}`.trim(),
      });

      // TODO: wire to Hasura mutation → UPDATE public.users
      // WHERE owner_id = user.uid
      // SET first_name   = form.firstName,
      //     last_name    = form.surnames,
      //     phone        = form.phone,
      //     country_code = form.countryCode,
      //     location     = form.location,
      //     summary      = form.summary

      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Derive initials ───────────────────────────────────────────────────────
  const initials = [form.firstName[0], form.surnames[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "?";

  if (isInitializing) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <h1 className="text-2xl font-semibold mb-4">Edit profile</h1>

      <div className="border border-gray-200 dark:border-gray-700
                      rounded-lg p-6 space-y-6">

        {/* Avatar + Summary */}
        <div className="flex gap-4">
          <AvatarUpload
            initials={initials}
            onFileChange={(file) =>
              setForm((prev) => ({ ...prev, avatar: file }))
            }
          />
          <div className="flex-1">
            <Label htmlFor="summary" className="mb-1.5 block">
              Summary
            </Label>
            <Textarea
              id="summary"
              placeholder="Write a short bio..."
              value={form.summary}
              onChange={handleChange("summary")}
              className="resize-none h-20"
            />
          </div>
        </div>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="mb-1.5 block">
              First Name
            </Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={handleChange("firstName")}
              placeholder="First name"
            />
          </div>
          <div>
            <Label htmlFor="surnames" className="mb-1.5 block">
              Surnames
            </Label>
            <Input
              id="surnames"
              value={form.surnames}
              onChange={handleChange("surnames")}
              placeholder="Last name"
            />
          </div>
        </div>

        {/* Phone + Location row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 block">Phone</Label>
            <div className="flex gap-2">
              <Select
                value={form.countryCode}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, countryCode: val }))
                }
              >
                <SelectTrigger className="w-28 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map(({ code, flag, label }) => (
                    <SelectItem key={code} value={code}>
                      {flag} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="Phone number"
                type="tel"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="location" className="mb-1.5 block">
              Location
            </Label>
            <Input
              id="location"
              value={form.location}
              onChange={handleChange("location")}
              placeholder="City, Country"
            />
          </div>
        </div>

        {/* Account overview — real Firebase data */}
        <AccountOverviewTable
          createdAt={account.createdAt}
          walletAddress={account.walletAddress}
          email={account.email}
        />

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white
                       disabled:opacity-60"
          >
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}