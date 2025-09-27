import { EscrowData, NotificationData } from '@/components/dashboard/EscrowDashboard';

// Helper function to generate random dates
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Sample hotels for mock data
const HOTELS = [
  'Grand Plaza Hotel',
  'Oceanview Resort & Spa',
  'Mountain Peak Lodge',
  'Sunset Beach Resort',
  'Downtown Suites',
  'Royal Garden Hotel',
  'Alpine Chalet',
  'Metropolitan Tower',
  'Palm Oasis Resort',
  'Harborview Inn'
];

// Generate mock escrow data
export const generateMockEscrows = (count: number = 10): EscrowData[] => {
  const statuses: Array<EscrowData['status']> = [
    'pending', 'funded', 'check_in_approved', 'check_out_approved', 'completed', 'cancelled'
  ];
  
  const milestones = [
    { id: 'deposit', name: 'Deposit' },
    { id: 'check_in', name: 'Check-in' },
    { id: 'check_out', name: 'Check-out' },
    { id: 'release', name: 'Funds Release' }
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = Math.floor(Math.random() * 5000) + 500; // $500 - $5500
    const checkInDate = randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    const checkOutDate = new Date(checkInDate.getTime() + (Math.floor(Math.random() * 14) + 1) * 24 * 60 * 60 * 1000);
    const createdAt = randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date());
    const updatedAt = randomDate(createdAt, new Date());
    const hotelName = HOTELS[Math.floor(Math.random() * HOTELS.length)];
    
    // Determine milestone statuses based on escrow status
    const milestoneStatuses = milestones.map(milestone => {
      let milestoneStatus: 'pending' | 'in_progress' | 'completed' | 'rejected' = 'pending';
      const escrowStatus = status; // Rename to avoid shadowing
      
      if (milestone.id === 'deposit') {
        milestoneStatus = (escrowStatus === 'pending' || escrowStatus === 'cancelled') ? 'pending' : 'completed';
      } else if (milestone.id === 'check_in') {
        if (escrowStatus === 'check_in_approved' || escrowStatus === 'check_out_approved' || escrowStatus === 'completed') {
          milestoneStatus = 'completed';
        } else if (escrowStatus === 'funded') {
          milestoneStatus = 'in_progress';
        }
      } else if (milestone.id === 'check_out') {
        if (escrowStatus === 'check_out_approved' || escrowStatus === 'completed') {
          milestoneStatus = 'completed';
        } else if (escrowStatus === 'check_in_approved') {
          milestoneStatus = 'in_progress';
        }
      } else if (milestone.id === 'release') {
        milestoneStatus = escrowStatus === 'completed' ? 'completed' : 'pending';
      }
      
      // Ensure we have a valid milestone status
      const validMilestoneStatus = ['pending', 'in_progress', 'completed', 'rejected'].includes(milestoneStatus) 
        ? milestoneStatus as 'pending' | 'in_progress' | 'completed' | 'rejected'
        : 'pending';
        
      return {
        id: milestone.id,
        name: milestone.name,
        status: validMilestoneStatus,
        dueDate: (() => {
          const date = new Date(checkInDate);
          if (milestone.id === 'check_in') return date.toISOString();
          if (milestone.id === 'check_out') return checkOutDate.toISOString();
          if (milestone.id === 'release') return new Date(checkOutDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
          return new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString();
        })(),
        ...(escrowStatus === 'completed' ? { 
          completedAt: (() => {
            const date = new Date(updatedAt);
            // Make sure completedAt is after dueDate
            const dueDate = milestone.id === 'check_in' ? checkInDate : 
                           milestone.id === 'check_out' ? checkOutDate : 
                           new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
            return date > dueDate ? date.toISOString() : new Date(dueDate.getTime() + 1000).toISOString();
          })()
        } : {})
      };
    });
    
    // Determine next milestone
    const nextMilestone = milestoneStatuses.find(m => m.status !== 'completed')?.id;
    
    return {
      id: `escrow_${i + 1}`,
      contractId: `contract_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status,
      amount,
      asset: {
        code: 'XLM',
        issuer: 'G...'
      },
      metadata: {
        bookingId: `BK${Math.floor(10000 + Math.random() * 90000)}`,
        hotelName,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
      },
      nextMilestone,
      milestones: milestoneStatuses,
      marker: `G${Math.random().toString(36).substr(2, 55)}`,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  });
};

// Generate mock notifications
export const generateMockNotifications = (escrows: EscrowData[]): NotificationData[] => {
  const notifications: NotificationData[] = [];
  
  escrows.forEach(escrow => {
    const bookingId = escrow.metadata?.bookingId || 'N/A';
    const hotelName = escrow.metadata?.hotelName ? `at ${escrow.metadata.hotelName}` : '';
    
    // Add notification for current status
    let message = '';
    let type: 'milestone' | 'payment' | 'alert' = 'milestone';
    
    switch(escrow.status) {
      case 'funded':
        message = `Booking #${bookingId} ${hotelName} has been funded`;
        type = 'payment';
        break;
      case 'check_in_approved':
        message = `Check-in approved for booking #${bookingId} ${hotelName}`;
        break;
      case 'check_out_approved':
        message = `Check-out completed for booking #${bookingId} ${hotelName}`;
        break;
      case 'completed':
        message = `Booking #${bookingId} ${hotelName} has been completed`;
        type = 'payment';
        break;
      case 'cancelled':
        message = `Booking #${bookingId} ${hotelName} was cancelled`;
        type = 'alert';
        break;
      default:
        message = `Update for booking #${bookingId} ${hotelName}`;
    }
    
    notifications.push({
      id: `notif_${escrow.id}`,
      type,
      message,
      timestamp: new Date(escrow.updatedAt).toISOString(),
      read: Math.random() > 0.5,
      escrowId: escrow.id
    });
    
    // Add some random notifications for completed milestones
    if (escrow.milestones) {
      escrow.milestones.forEach(milestone => {
        if (milestone.status === 'completed' && milestone.completedAt) {
          notifications.push({
            id: `milestone_${escrow.id}_${milestone.id}`,
            type: 'milestone',
            message: `${milestone.name} completed for booking #${bookingId} ${hotelName}`,
            timestamp: milestone.completedAt,
            read: Math.random() > 0.5,
            escrowId: escrow.id
          });
        }
      });
    }
  });
  
  // Sort by timestamp (newest first)
  return notifications.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

// Helper functions to be used in the components
export const fetchMockEscrows = async (): Promise<EscrowData[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return generateMockEscrows(15);
};

export const fetchMockNotifications = async (): Promise<NotificationData[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  const escrows = generateMockEscrows(5);
  return generateMockNotifications(escrows);
};
