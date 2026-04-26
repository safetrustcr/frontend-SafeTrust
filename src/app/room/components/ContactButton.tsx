"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ContactButtonProps {
  onContact?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function ContactButton({
  onContact,
  disabled = false,
  className,
}: ContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleOpen = () => {
    if (onContact) {
      onContact();
    }
    if (!disabled) setIsOpen(true);
  };

  const handleSend = () => {
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setIsOpen(false);
      setMessage("");
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        disabled={disabled}
        className={cn("flex items-center gap-2", className)}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Contact Host</span>
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact Host</DialogTitle>
          <DialogDescription>
            Send a message to the property manager.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Hi, I'm interested in this room..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSend} disabled={isSending || !message.trim()}>
            {isSending ? (
              "Sending..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
