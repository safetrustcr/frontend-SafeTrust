import { Check, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EscrowData } from './EscrowDashboard';

interface MilestoneProgressProps {
  milestones: EscrowData['milestones'];
  className?: string;
}

export function MilestoneProgress({ milestones = [], className }: MilestoneProgressProps) {
  if (!milestones || milestones.length === 0) {
    return null;
  }

  type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed':
        return <Check className="h-3 w-3 text-green-500" />;
      case 'rejected':
        return <X className="h-3 w-3 text-red-500" />;
      case 'in_progress':
        return <div className="h-2 w-2 rounded-full bg-blue-500" />;
      default: // pending
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'in_progress':
        return 'text-blue-600';
      default: // pending
        return 'text-gray-500';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {milestones.map((milestone, index) => (
        <div key={milestone.id} className="relative">
          <div className="flex items-start">
            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-white border-2 border-gray-200 mr-2 mt-0.5">
              {getStatusIcon(milestone.status)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className={cn('text-xs font-medium', getStatusColor(milestone.status))}>
                  {milestone.name.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </span>
                {milestone.dueDate && (
                  <span className="text-xs text-muted-foreground">
                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              {milestone.completedAt && milestone.status === 'completed' && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  Completed on {new Date(milestone.completedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          {index < milestones.length - 1 && (
            <div className="absolute left-2.5 top-5 h-5 w-px bg-gray-200 -ml-px" />
          )}
        </div>
      ))}
    </div>
  );
}
