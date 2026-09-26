import { MoreHorizontal, Eye, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { EscrowData } from './RoleEscrowDashboard';
import { useRouter } from 'next/navigation';

interface EscrowTableProps {
  escrows: EscrowData[];
  userRole: 'guest' | 'hotel' | 'admin';
}

const statusBadgeVariant = {
  pending: 'outline',
  funded: 'default',
  check_in_approved: 'secondary',
  check_out_approved: 'secondary',
  completed: 'default',
  cancelled: 'destructive',
} as const;

const statusText = {
  pending: 'Pending',
  funded: 'Funded',
  check_in_approved: 'Check-in Approved',
  check_out_approved: 'Check-out Approved',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

export function EscrowTable({ escrows, userRole }: EscrowTableProps) {
  const router = useRouter();

  const handleViewDetails = (escrowId: string) => {
    router.push(`/dashboard/escrow/${escrowId}`);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'XLM' ? 'USD' : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getActionButton = (escrow: EscrowData) => {
    if (userRole === 'hotel' && escrow.status === 'funded' && escrow.nextMilestone === 'check_in') {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => handleViewDetails(escrow.id)}
        >
          Approve Check-in
        </Button>
      );
    }
    
    if (userRole === 'admin' && escrow.status === 'check_in_approved') {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => handleViewDetails(escrow.id)}
        >
          Complete Check-out
        </Button>
      );
    }
    
    return (
      <Button 
        variant="ghost" 
        size="sm"
        className="w-full justify-start"
        onClick={() => handleViewDetails(escrow.id)}
      >
        <Eye className="h-4 w-4 mr-2" />
        View
      </Button>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-700">
            <TableHead className="w-[50px] text-gray-600 dark:text-gray-300 font-semibold">
              <Checkbox />
            </TableHead>
            <TableHead className="text-gray-600 dark:text-gray-300 font-semibold">Booking ID</TableHead>
            <TableHead className="text-gray-600 dark:text-gray-300 font-semibold">Hotel</TableHead>
            <TableHead className="text-gray-600 dark:text-gray-300 font-semibold">Check-in</TableHead>
            <TableHead className="text-gray-600 dark:text-gray-300 font-semibold">Check-out</TableHead>
            <TableHead className="text-gray-600 dark:text-gray-300 font-semibold">Amount</TableHead>
            <TableHead className="text-gray-600 dark:text-gray-300 font-semibold">Status</TableHead>
            <TableHead className="text-right text-gray-600 dark:text-gray-300 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {escrows.length === 0 ? (
            <TableRow className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <TableCell colSpan={8} className="h-24 text-center text-gray-500 dark:text-slate-400">
                No escrows found
              </TableCell>
            </TableRow>
          ) : (
            escrows.map((escrow) => (
              <TableRow key={escrow.id} className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell className="font-mono text-sm text-gray-500 dark:text-gray-400">
                  {escrow.metadata?.bookingId || 'N/A'}
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">
                  <div className="font-medium">
                    {escrow.metadata?.hotelName || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground dark:text-slate-400">
                    {escrow.marker.slice(0, 6)}...{escrow.marker.slice(-4)}
                  </div>
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">{formatDate(escrow.metadata?.checkInDate)}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{formatDate(escrow.metadata?.checkOutDate)}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">
                  {formatCurrency(escrow.amount, escrow.asset.code)}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={statusBadgeVariant[escrow.status] || 'outline'}
                    className="whitespace-nowrap"
                  >
                    {statusText[escrow.status] || escrow.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end items-center gap-2">
                    {getActionButton(escrow)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(escrow.id)}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <FileText className="h-4 w-4 mr-2" />
                          View Contract
                        </DropdownMenuItem>
                        {escrow.status === 'completed' && (
                          <DropdownMenuItem className="cursor-pointer">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            Mark as Completed
                          </DropdownMenuItem>
                        )}
                        {escrow.status !== 'cancelled' && escrow.status !== 'completed' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 cursor-pointer">
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Booking
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
