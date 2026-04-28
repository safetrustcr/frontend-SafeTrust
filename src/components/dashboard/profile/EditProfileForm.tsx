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
import { useState } from "react";
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

const STUB_PROFILE = {
  firstName: "Randall",
  surnames: "Valenciano",
  phone: "6498 6325",
  countryCode: "+506",
  location: "Costa Rica, San José",
  summary: "",
  avatar: "/img/avatar-placeholder.jpg",
  account: {
    createdAt: "20/09/2022",
    walletAddress: "XMDABCDE22DR",
    email: "randalVciano@gmail.com",
  },
};

const COUNTRY_CODES = [
  { code: "+1", flag: "🇺🇸", label: "+1" },
  { code: "+44", flag: "🇬🇧", label: "+44" },
  { code: "+506", flag: "🇨🇷", label: "+506" },
  { code: "+52", flag: "🇲🇽", label: "+52" },
  { code: "+55", flag: "🇧🇷", label: "+55" },
  { code: "+34", flag: "🇪🇸", label: "+34" },
];

export function EditProfileForm() {
  const [form, setForm] = useState<ProfileFormData>({
    firstName: STUB_PROFILE.firstName,
    surnames: STUB_PROFILE.surnames,
    phone: STUB_PROFILE.phone,
    countryCode: STUB_PROFILE.countryCode,
    location: STUB_PROFILE.location,
    summary: STUB_PROFILE.summary,
    avatar: null,
  });

  const handleChange =
    (field: keyof ProfileFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: replace with mutation(UPDATE_USER_PROFILE)
    console.log("Save profile", form);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <h1 className="text-2xl font-semibold mb-4">Edit profile</h1>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
        {/* Avatar + Summary */}
        <div className="flex gap-4">
          <AvatarUpload
            initials={`${form.firstName[0]}${form.surnames[0]}`}
            onFileChange={(file) => setForm((prev) => ({ ...prev, avatar: file }))}
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
            />
          </div>
        </div>

        {/* Account overview */}
        <AccountOverviewTable
          createdAt={STUB_PROFILE.account.createdAt}
          walletAddress={STUB_PROFILE.account.walletAddress}
          email={STUB_PROFILE.account.email}
        />

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Save changes
          </Button>
        </div>
      </div>
    </form>
  );
}
