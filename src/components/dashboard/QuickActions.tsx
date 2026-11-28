"use client";

import {
  Plus,
  Hotel,
  User,
  ShieldCheck,
  FileText,
  HelpCircle,
  Zap,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardGlassCard as Card } from "@/components/dashboard/ui/DashboardGlassCard";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  userRole: "guest" | "hotel" | "admin";
}

interface Action {
  title: string;
  icon: LucideIcon;
  route: string;
  description: string;
}

interface ActionButtonProps {
  action: Action;
  variant?: "outline" | "ghost";
}

function ActionButton({ action, variant = "outline" }: ActionButtonProps) {
  return (
    <Link
      href={action.route}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left",
        "transition-shadow duration-150 hover:shadow-sm motion-safe:hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        variant === "outline"
          ? "border border-border hover:bg-accent"
          : "hover:bg-accent",
      )}
    >
      <div className="p-1.5 rounded-md bg-primary/10 text-primary dark:bg-primary/20 shrink-0">
        <action.icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{action.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {action.description}
        </p>
      </div>
    </Link>
  );
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const guestActions: Action[] = [
    {
      title: "New booking",
      icon: Plus,
      route: "/rent",
      description: "Find a stay and book it with escrow",
    },
    {
      title: "My profile",
      icon: User,
      route: "/dashboard/profile",
      description: "Update your name and photo",
    },
    {
      title: "My escrows",
      icon: FileText,
      route: "/dashboard/escrow",
      description: "See the bookings held in escrow",
    },
  ];

  const hotelActions: Action[] = [
    {
      title: "New apartment",
      icon: Plus,
      route: "/dashboard/apartments/new",
      description: "List a new property",
    },
    {
      title: "My apartments",
      icon: Hotel,
      route: "/dashboard/apartments",
      description: "View and manage apartments",
    },
    {
      title: "My profile",
      icon: User,
      route: "/dashboard/profile",
      description: "Update your name and photo",
    },
  ];

  const adminActions: Action[] = [
    {
      title: "Manage escrows",
      icon: FileText,
      route: "/dashboard/escrow",
      description: "View all escrow transactions",
    },
    {
      title: "Your account",
      icon: User,
      route: "/dashboard/users",
      description: "Your profile and linked wallets",
    },
    {
      title: "Account security",
      icon: ShieldCheck,
      route: "/dashboard/profile/security",
      description: "Wallets and sign-in email",
    },
  ];

  const actions =
    userRole === "guest"
      ? guestActions
      : userRole === "hotel"
        ? hotelActions
        : adminActions;

  const NOTIFICATIONS_ACTION: Action = {
    title: "Notifications",
    icon: Bell,
    route: "/dashboard/notifications",
    description: "View your recent alerts",
  };

  const helpAction: Action = {
    title: "Help",
    icon: HelpCircle,
    route: "/help",
    description: "Guides for guests and hosts",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          {actions.map((action) => (
            <ActionButton
              key={action.route}
              action={action}
              variant="outline"
            />
          ))}
          <ActionButton
            key={NOTIFICATIONS_ACTION.route}
            action={NOTIFICATIONS_ACTION}
            variant="outline"
          />
        </div>

        <div className="border-t border-border pt-4">
          <ActionButton
            key={helpAction.route}
            action={helpAction}
            variant="ghost"
          />
        </div>
      </CardContent>
    </Card>
  );
}
