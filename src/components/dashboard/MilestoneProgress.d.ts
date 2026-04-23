import { FC } from 'react';

declare module './MilestoneProgress' {
  interface MilestoneProgressProps {
    milestones: Array<{
      id: string;
      name: string;
      status: 'pending' | 'in_progress' | 'completed' | 'rejected';
      dueDate?: string;
      completedAt?: string;
    }>;
    className?: string;
  }

  const MilestoneProgress: FC<MilestoneProgressProps>;
  
  export { MilestoneProgress };
}
