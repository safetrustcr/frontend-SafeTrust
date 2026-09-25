import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EscrowData } from './RoleEscrowDashboard';
import { useInView } from '@/hooks/useInView';
import type { LucideIcon } from 'lucide-react';

interface StatusPanelProps {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  color: string;
}

function StatusPanel({
  title,
  value,
  description,
  icon: Icon,
  color,
}: StatusPanelProps) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <Card ref={ref}>
      {inView ? (
        <>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              {title}
            </CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </>
      ) : (
        <CardContent
          aria-hidden="true"
          className="space-y-2 pt-6 animate-pulse"
        >
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-8 w-20 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </CardContent>
      )}
    </Card>
  );
}

interface EscrowsByStatusProps {
  escrows: EscrowData[];
  userRole: 'guest' | 'hotel' | 'admin';
}

export function EscrowsByStatus({ escrows, userRole }: EscrowsByStatusProps) {
  const stats = {
    total: escrows.length,
    pending: escrows.filter(e => e.status === 'pending').length,
    funded: escrows.filter(e => e.status === 'funded').length,
    completed: escrows.filter(e => e.status === 'completed').length,
    cancelled: escrows.filter(e => e.status === 'cancelled').length,
  };

  const getTotalAmount = () => {
    return escrows.reduce((sum, escrow) => {
      // Skip cancelled escrows from total
      if (escrow.status === 'cancelled') return sum;
      return sum + escrow.amount;
    }, 0);
  };

  const getStatusStats = () => {
    if (userRole === 'guest') {
      return [
        { 
          title: 'Active Bookings',
          value: stats.pending + stats.funded,
          icon: Clock,
          color: 'text-blue-500',
          description: 'Your active reservations',
        },
        { 
          title: 'Completed Stays',
          value: stats.completed,
          icon: CheckCircle,
          color: 'text-green-500',
          description: 'Successfully completed',
        },
      ];
    }

    if (userRole === 'hotel') {
      return [
        { 
          title: 'Pending Check-ins',
          value: stats.pending,
          icon: Clock,
          color: 'text-yellow-500',
          description: 'Awaiting guest confirmation',
        },
        { 
          title: 'Active Stays',
          value: stats.funded,
          icon: AlertCircle,
          color: 'text-blue-500',
          description: 'Guests currently staying',
        },
      ];
    }

    // Admin view
    return [
      { 
        title: 'Active Escrows',
        value: stats.pending + stats.funded,
        icon: AlertCircle,
        color: 'text-blue-500',
        description: 'Active in the system',
      },
      { 
        title: 'Completed',
        value: stats.completed,
        icon: CheckCircle,
        color: 'text-green-500',
        description: 'Successfully completed',
      },
      { 
        title: 'Cancelled',
        value: stats.cancelled,
        icon: XCircle,
        color: 'text-red-500',
        description: 'Cancelled or refunded',
      },
    ];
  };

  return (
    <div className="space-y-4">
      <StatusPanel
        title="Total Escrow Value"
        value={`$${getTotalAmount().toLocaleString()}`}
        description={`${stats.total} total ${stats.total === 1 ? 'escrow' : 'escrows'}`}
        icon={DollarSign}
        color="text-muted-foreground"
      />

      <div className="grid gap-4">
        {getStatusStats().map((stat, i) => (
          <StatusPanel key={i} {...stat} />
        ))}
      </div>
    </div>
  );
}
