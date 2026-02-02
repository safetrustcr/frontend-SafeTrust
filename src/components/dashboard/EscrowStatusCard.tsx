import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { EscrowData } from './EscrowDashboard';
import { MilestoneProgress } from './milestone-progress';
import { ApproveMilestone } from '@/components/tw-blocks/escrows/multi-release/approve-milestone/ApproveMilestone';
import { ChangeMilestoneStatus } from '@/components/tw-blocks/escrows/multi-release/change-milestone-status/ChangeMilestoneStatus';
import { useWalletContext } from '@/components/tw-blocks/wallet-kit/WalletProvider';

interface EscrowStatusCardProps {
  escrow: EscrowData;
  userRole: 'guest' | 'hotel' | 'admin';
  onActionComplete?: () => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  funded: 'bg-blue-100 text-blue-800',
  check_in_approved: 'bg-green-100 text-green-800',
  check_out_approved: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
} as const;

const statusLabels = {
  pending: 'Pending',
  funded: 'Funded',
  check_in_approved: 'Check-in Approved',
  check_out_approved: 'Check-out Approved',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

export function EscrowStatusCard({ escrow, userRole, onActionComplete }: EscrowStatusCardProps) {
  const { walletAddress } = useWalletContext();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getActionComponent = () => {
    if (userRole === 'hotel' && escrow.status === 'funded' && escrow.nextMilestone === 'check_in') {
      return (
        <ApproveMilestone
          contractId={escrow.contractId}
          milestoneId="check_in"
          approverWallet={escrow.marker || walletAddress || ''}
          variant="default"
          size="sm"
          onSuccess={onActionComplete}
        />
      );
    }
    
    if (userRole === 'admin' && escrow.status === 'check_in_approved') {
      return (
        <ChangeMilestoneStatus
          contractId={escrow.contractId}
          milestoneId="check_out"
          newStatus="completed"
          walletAddress={process.env.NEXT_PUBLIC_PLATFORM_WALLET || walletAddress || ''}
          variant="default"
          size="sm"
          onSuccess={onActionComplete}
        />
      );
    }
    
    return null;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Booking #{escrow.metadata?.bookingId || 'N/A'}
        </CardTitle>
        <Badge 
          variant="outline" 
          className={`text-xs ${statusColors[escrow.status] || 'bg-gray-100 text-gray-800'}`}
        >
          {statusLabels[escrow.status] || escrow.status}
        </Badge>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: escrow.asset.code === 'XLM' ? 'USD' : escrow.asset.code,
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              }).format(escrow.amount)}
            </span>
          </div>
          
          {escrow.metadata?.hotelName && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hotel:</span>
              <span className="font-medium">{escrow.metadata.hotelName}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Check-in:</span>
            <span className="font-medium">{formatDate(escrow.metadata?.checkInDate)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Check-out:</span>
            <span className="font-medium">{formatDate(escrow.metadata?.checkOutDate)}</span>
          </div>
          
          {escrow.milestones && escrow.milestones.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">MILESTONES</h4>
              <MilestoneProgress milestones={escrow.milestones} />
            </div>
          )}
        </div>
        
        {getActionComponent()}
      </CardContent>
    </Card>
  );
}