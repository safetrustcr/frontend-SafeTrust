import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import type { ConversationMessage } from '../model/types';

type MessageBubbleProps = {
  message: ConversationMessage;
  isOwn: boolean;
};

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const initials = `${message.sender.first_name[0] ?? ''}${message.sender.last_name[0] ?? ''}`;
  
  return (
    <div className={cn("flex w-full mt-2 space-x-3 max-w-xl", isOwn ? "ml-auto justify-end" : "")}>
      {!isOwn && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {initials.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn("flex flex-col space-y-1", isOwn ? "items-end" : "items-start")}>
        <div 
          className={cn(
            "p-3 rounded-xl", 
            isOwn 
              ? "bg-primary text-primary-foreground rounded-tr-sm" 
              : "bg-muted rounded-tl-sm"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.body}</p>
        </div>
        
        <span className="text-xs text-muted-foreground px-1">
          {format(new Date(message.created_at), 'MMM d, h:mm a')}
        </span>
      </div>
    </div>
  );
}
