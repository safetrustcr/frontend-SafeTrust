"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardGlassCard as Card } from "@/components/dashboard/ui/DashboardGlassCard";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl?: string;
}

interface UserProfileCardProps {
  user: UserProfile;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <Card>
      <CardHeader className="flex !flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          My Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted">
            {user.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profileImageUrl}
                alt="Profile"
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <User className="h-7 w-7 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
            {user.phoneNumber ? (
              <p className="text-sm text-muted-foreground">
                {user.phoneNumber}
              </p>
            ) : null}
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="min-h-11 shrink-0"
          >
            <Link href="/dashboard/profile">Edit Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
