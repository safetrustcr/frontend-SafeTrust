# Escrow Dashboard Components

This directory contains the React components for the Escrow Monitoring Dashboard. The dashboard provides a comprehensive interface for tracking and managing escrow transactions with role-based access control.

## Components Overview

### 1. EscrowDashboard (`EscrowDashboard.tsx`)
The main container component that orchestrates all other dashboard components. It's a stateless component that receives all necessary data through props.

**Props:**
- `userRole: 'guest' | 'hotel' | 'admin'` - The role of the current user
- `escrows?: EscrowData[]` - Array of escrow objects (optional, defaults to `[]`)
- `notifications?: NotificationData[]` - Array of notification objects (optional, defaults to `[]`)
- `isLoading?: boolean` - Loading state (optional, defaults to `false`)
- `error?: string | null` - Error message (optional, defaults to `null`)
- `onRefresh?: () => void` - Callback function for refresh/retry actions (optional)

### 2. DashboardHeader (`DashboardHeader.tsx`)
Displays the dashboard header with user information, notifications, and quick actions.

**Props:**
- `userRole: 'guest' | 'hotel' | 'admin'` - The role of the current user
- `notifications: NotificationData[]` - Array of notification objects
- `onMenuClick?: () => void` - Callback for mobile menu toggle

### 3. EscrowStatusCard (`EscrowStatusCard.tsx`)
Displays a single escrow's status and details in a card format.

**Props:**
- `escrow: EscrowData` - The escrow data to display
- `userRole: 'guest' | 'hotel' | 'admin'` - The role of the current user
- `onActionComplete?: () => void` - Callback when an action is completed

### 4. EscrowsByStatus (`EscrowsByStatus.tsx`)
Shows statistics and counts of escrows grouped by status.

**Props:**
- `escrows: EscrowData[]` - Array of escrow objects
- `userRole: 'guest' | 'hotel' | 'admin'` - The role of the current user

### 5. RecentActivity (`RecentActivity.tsx`)
Displays a list of recent escrow activities and updates.

**Props:**
- `escrows: EscrowData[]` - Array of escrow objects to display activities for

### 6. QuickActions (`QuickActions.tsx`)
Provides quick access to common actions based on user role.

**Props:**
- `userRole: 'guest' | 'hotel' | 'admin'` - The role of the current user

### 7. EscrowTable (`EscrowTable.tsx`)
A data table displaying escrow transactions with sorting and filtering capabilities.

**Props:**
- `escrows: EscrowData[]` - Array of escrow objects to display
- `userRole: 'guest' | 'hotel' | 'admin'` - The role of the current user

## Usage Example

```tsx
<EscrowDashboard
  userRole="admin"
  escrows={escrowsData}
  notifications={notificationsData}
  isLoading={isLoading}
  error={error}
  onRefresh={fetchData}
/>
```

## Data Types

### EscrowData
```typescript
interface EscrowData {
  id: string;
  contractId: string;
  status: 'pending' | 'funded' | 'check_in_approved' | 'check_out_approved' | 'completed' | 'cancelled';
  amount: number;
  asset: {
    code: string;
    issuer?: string;
  };
  metadata?: {
    bookingId: string;
    hotelName: string;
    checkInDate: string;
    checkOutDate: string;
  };
  nextMilestone?: string;
  milestones?: Milestone[];
  marker: string;
  createdAt: string;
  updatedAt: string;
}
```

### NotificationData
```typescript
interface NotificationData {
  id: string;
  type: 'milestone' | 'payment' | 'alert';
  message: string;
  timestamp: string;
  read: boolean;
  escrowId?: string;
}
```

### Milestone
```typescript
interface Milestone {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  dueDate?: string;
  completedAt?: string;
}
```

## Usage Example

```tsx
import { EscrowDashboard } from './components/dashboard/EscrowDashboard';

function App() {
  // In a real app, this would come from your auth context
  const userRole = 'hotel'; // or 'guest' or 'admin'
  
  return (
    <div className="min-h-screen bg-gray-50">
      <EscrowDashboard userRole={userRole} />
    </div>
  );
}
```

## Styling

This project uses Tailwind CSS for styling. All components are designed to be responsive and work well on both desktop and mobile devices.

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- Lucide React (for icons)
- date-fns (for date manipulation)

## Development

To add a new component:

1. Create a new `.tsx` file in this directory
2. Export the component as a named export
3. Add PropTypes or TypeScript interfaces for all props
4. Document the component in this README
5. Ensure the component is responsive and accessible

## Testing

Components should be tested using React Testing Library. Test files should be named `ComponentName.test.tsx` and placed alongside the component files.
