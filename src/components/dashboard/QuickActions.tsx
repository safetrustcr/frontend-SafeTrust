"use client";

import { Plus, Hotel, User, Settings, CreditCard, FileText, HelpCircle, Zap, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  userRole: 'guest' | 'hotel' | 'admin';
}

interface Action {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  description: string;
}

interface ActionButtonProps {
  action: Action;
  variant?: "outline" | "ghost";
  onClick: () => void;
}

function ActionButton({
  action,
  variant = "outline",
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left",
        "transition-all duration-150 hover:shadow-sm",
        variant === "outline"
          ? "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          : "hover:bg-gray-50 dark:hover:bg-gray-800",
      )}
    >
      <div className="p-1.5 rounded-md bg-primary/10 text-primary dark:bg-primary/20 shrink-0">
        <action.icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {action.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {action.description}
        </p>
      </div>
    </button>
  );
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const router = useRouter();

  const handleRoute = (route: string) => {
    if (route.startsWith("http")) {
      window.open(route, "_blank", "noopener,noreferrer");
    } else {
      router.push(route);
    }
  };

  const guestActions: Action[] = [
    {
      title: 'New Booking',
      icon: Plus,
      route: '/rent',
      description: 'Start a new hotel booking',
    },
    {
      title: 'My Profile',
      icon: User,
      route: '/dashboard/profile',
      description: 'Update your profile',
    },
    {
      title: 'Payment Methods',
      icon: CreditCard,
      route: '/dashboard/escrow',
      description: 'Manage payment options',
    },
  ];

  const hotelActions: Action[] = [
    {
      title: 'New Apartment',
      icon: Plus,
      route: '/dashboard/apartments/new',
      description: 'List a new property',
    },
    {
      title: 'My Apartments',
      icon: Hotel,
      route: '/dashboard/apartments',
      description: 'View and manage apartments',
    },
    {
      title: 'My Profile',
      icon: User,
      route: '/dashboard/profile',
      description: 'Update your profile',
    },
  ];

  const adminActions: Action[] = [
    {
      title: 'Manage Escrows',
      icon: FileText,
      route: '/dashboard/escrow',
      description: 'View all escrow transactions',
    },
    {
      title: 'User Management',
      icon: User,
      route: '/dashboard/users',
      description: 'Manage platform users',
    },
    {
      title: 'System Settings',
      icon: Settings,
      route: '/dashboard/profile',
      description: 'Configure platform settings',
    },
  ];

  const actions = userRole === 'guest' 
    ? guestActions 
    : userRole === 'hotel' 
      ? hotelActions 
      : adminActions;

  const NOTIFICATIONS_ACTION: Action = {
    title: 'Notifications',
    icon: Bell,
    route: '/dashboard/notifications',
    description: 'View your recent alerts',
  };

  const helpAction: Action = {
    title: 'Get Help',
    icon: HelpCircle,
    route: 'https://docs.trustlesswork.com',
    description: 'Contact support or view help docs',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium dark:text-white flex items-center gap-2">
          <Zap className="h-4 w-4 text-purple-500" />
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
              onClick={() => handleRoute(action.route)}
            />
          ))}
          <ActionButton
            key={NOTIFICATIONS_ACTION.route}
            action={NOTIFICATIONS_ACTION}
            variant="outline"
            onClick={() => handleRoute(NOTIFICATIONS_ACTION.route)}
          />
        </div>
        
        <div className="border-t dark:border-gray-700 pt-4">
          <ActionButton
            key={helpAction.route}
            action={helpAction}
            variant="ghost"
            onClick={() => handleRoute(helpAction.route)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
