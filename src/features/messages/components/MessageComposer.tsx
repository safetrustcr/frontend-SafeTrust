"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type MessageComposerProps = {
  conversationId: string;
  onSend: (body: string) => void;
  isDemo: boolean;
};

export function MessageComposer({
  conversationId,
  onSend,
  isDemo,
}: MessageComposerProps) {
  const [body, setBody] = useState("");

  const handleSend = () => {
    if (!body.trim()) return;
    onSend(body.trim());
    if (isDemo) {
      toast.info("Sent in demo mode. Not delivered to anyone.");
    }
    setBody("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="p-4 border-t mt-auto flex gap-3 items-end bg-background"
      data-conversation-id={conversationId}
    >
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="min-h-[60px] max-h-[120px] resize-none"
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!body.trim()}
        className="h-10 w-10 shrink-0"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  );
}
