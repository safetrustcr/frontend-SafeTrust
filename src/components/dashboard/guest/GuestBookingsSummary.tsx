'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

// TODO: replace with useQuery(GET_MY_ESCROWS) filtered by guest wallet
const STUB_BOOKINGS = [
  {
    id: 'abc-123',
    hotelId: 'hotel-001',
    escrowId: 'escrow-abc-123',
    apartmentName: 'La sabana sur',
    address: '329 Calle santos',
    status: 'active',
    amount: 4000,
    date: '2025-01-25',
    beds: 2,
    baths: 1,
  },
  {
    id: 'def-456',
    hotelId: 'hotel-002',
    escrowId: 'escrow-def-456',
    apartmentName: 'Los yoses',
    address: '329 Calle santos',
    status: 'pending_signature',
    amount: 4000,
    date: '2025-01-22',
    beds: 2,
    baths: 1,
  },
];

// Map escrow status to guest-friendly label
const STATUS_LABELS: Record<string, string> = {
  pending_signature: 'Awaiting payment',
  funded: 'Payment sent',
  active: 'Deposit blocked',
  completed: 'Deposit released',
  disputed: 'In dispute',
  cancelled: 'Cancelled',
  check_in_approved: 'Check-in Approved',
  check_out_approved: 'Check-out Approved',
};

const STATUS_BADGE_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending_signature: 'outline',
  funded: 'secondary',
  active: 'default',
  completed: 'default',
  disputed: 'destructive',
  cancelled: 'destructive',
  check_in_approved: 'secondary',
  check_out_approved: 'secondary',
};

interface Booking {
  id: string;
  hotelId: string;
  escrowId: string;
  apartmentName: string;
  address: string;
  status: string;
  amount: number;
  date: string;
  beds: number;
  baths: number;
}

export function GuestBookingsSummary() {
  const router = useRouter();
  const bookings = STUB_BOOKINGS;

  const handleViewBooking = (hotelId: string, escrowId: string) => {
    router.push(`/hotel/${hotelId}/escrow/${escrowId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMM yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status] || status;
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    return STATUS_BADGE_COLORS[status] || 'default';
  };

  if (bookings.length === 0) {
    return (
      <div className="mt-8 p-8 text-center border rounded-lg bg-muted/40">
        <p className="text-muted-foreground">No active bookings</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">My Active Bookings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          View your current rental agreements and deposit status
        </p>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Apartment</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Deposit Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking: Booking) => (
              <TableRow key={booking.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div>
                    <p className="font-semibold">{booking.apartmentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.beds}bd · {booking.baths}ba
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{booking.address}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(booking.amount)}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(booking.date)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewBooking(booking.hotelId, booking.escrowId)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View booking</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
