import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EscrowData } from './EscrowDashboard';

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Total Escrow Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${getTotalAmount().toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.total} total {stats.total === 1 ? 'escrow' : 'escrows'}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {getStatusStats().map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
