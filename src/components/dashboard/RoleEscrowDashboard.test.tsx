import { render, screen } from '@testing-library/react';
import { RoleEscrowDashboard } from './RoleEscrowDashboard';

jest.mock('./DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('./EscrowsByStatus', () => ({
  EscrowsByStatus: () => <div data-testid="escrows-by-status" />,
}));

jest.mock('./RecentActivity', () => ({
  RecentActivity: () => <div data-testid="recent-activity" />,
}));

jest.mock('./QuickActions', () => ({
  QuickActions: () => <div data-testid="quick-actions" />,
}));

jest.mock('./EscrowTable', () => ({
  EscrowTable: () => <div data-testid="escrow-table" />,
}));

describe('RoleEscrowDashboard', () => {
  it('renders a link to the full escrow page from recent transactions', () => {
    render(<RoleEscrowDashboard userRole="guest" escrows={[]} />);

    const link = screen.getByRole('link', { name: /view all/i });

    expect(link).toHaveAttribute('href', '/dashboard/escrow');
  });
});
