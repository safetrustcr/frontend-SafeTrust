import { Plus, Hotel, User, Settings, CreditCard, FileText, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface QuickActionsProps {
  userRole: 'guest' | 'hotel' | 'admin';
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const router = useRouter();

  const guestActions = [
    {
      title: 'New Booking',
      icon: Plus,
      onClick: () => router.push('/book'),
      description: 'Start a new hotel booking',
    },
    {
      title: 'My Profile',
      icon: User,
      onClick: () => router.push('/profile'),
      description: 'Update your profile',
    },
    {
      title: 'Payment Methods',
      icon: CreditCard,
      onClick: () => router.push('/payment-methods'),
      description: 'Manage payment options',
    },
  ];

  const hotelActions = [
    {
      title: 'Add Property',
      icon: Plus,
      onClick: () => router.push('/hotel/properties/add'),
      description: 'List a new property',
    },
    {
      title: 'Manage Bookings',
      icon: FileText,
      onClick: () => router.push('/hotel/bookings'),
      description: 'View and manage bookings',
    },
    {
      title: 'Hotel Settings',
      icon: Settings,
      onClick: () => router.push('/hotel/settings'),
      description: 'Update property details',
    },
  ];

  const adminActions = [
    {
      title: 'Manage Escrows',
      icon: FileText,
      onClick: () => router.push('/admin/escrows'),
      description: 'View all escrow transactions',
    },
    {
      title: 'User Management',
      icon: User,
      onClick: () => router.push('/admin/users'),
      description: 'Manage platform users',
    },
    {
      title: 'System Settings',
      icon: Settings,
      onClick: () => router.push('/admin/settings'),
      description: 'Configure platform settings',
    },
  ];

  const actions = userRole === 'guest' 
    ? guestActions 
    : userRole === 'hotel' 
      ? hotelActions 
      : adminActions;

  const helpAction = {
    title: 'Get Help',
    icon: HelpCircle,
    onClick: () => router.push('/support'),
    description: 'Contact support or view help docs',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium dark:text-white">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 dark:border-gray-700 dark:hover:bg-gray-800"
              onClick={action.onClick}
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary dark:bg-primary/20">
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium dark:text-white">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="border-t dark:border-gray-700 pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start h-auto py-3 px-4 dark:hover:bg-gray-800"
            onClick={helpAction.onClick}
          >
            <div className="flex items-center space-x-3">
              <div className="p-1.5 rounded-md bg-muted dark:bg-gray-800">
                <helpAction.icon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="font-medium dark:text-white">{helpAction.title}</div>
                <div className="text-xs text-muted-foreground">
                  {helpAction.description}
                </div>
              </div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
