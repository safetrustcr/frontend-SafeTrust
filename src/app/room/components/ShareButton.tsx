"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Share,
  Copy,
  Check,
  Facebook,
  Twitter,
  Mails,
  Link as LinkIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  onShare?: () => void;
  className?: string;
}

export default function ShareButton({ onShare, className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Try native share first for mobile
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: "Check out this amazing room on SafeTrust!",
          url: window.location.href,
        });
        return;
      } catch (err) {
        console.log("Error sharing:", err);
        // Fallback to modal if native share fails or user cancels
      }
    }
    setIsOpen(true);
  };

  const copyToClipboard = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const socialShare = (platform: string) => {
    const url = encodeURIComponent(
      typeof window !== "undefined" ? window.location.href : "",
    );
    const text = encodeURIComponent("Check out this amazing room!");

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${text}&body=${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className={cn("flex items-center gap-2", className)}
      >
        <Share className="w-4 h-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this room</DialogTitle>
          <DialogDescription>
            Share this listing with friends and family
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 py-4 justify-center">
          <Button
            variant="outline"
            className="flex-col h-20 w-20 gap-2 border-muted"
            onClick={() => socialShare("facebook")}
          >
            <Facebook className="w-6 h-6 text-blue-600" />
            <span className="text-xs">Facebook</span>
          </Button>

          <Button
            variant="outline"
            className="flex-col h-20 w-20 gap-2 border-muted"
            onClick={() => socialShare("twitter")}
          >
            <Twitter className="w-6 h-6 text-sky-500" />
            <span className="text-xs">Twitter</span>
          </Button>

          <Button
            variant="outline"
            className="flex-col h-20 w-20 gap-2 border-muted"
            onClick={() => socialShare("email")}
          >
            <Mails className="w-6 h-6 text-gray-600" />
            <span className="text-xs">Email</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <div className="flex items-center space-x-2 border rounded-md p-2 bg-muted/50">
              <LinkIcon className="w-4 h-4 text-muted-foreground" />
              <input
                className="flex-1 bg-transparent border-none text-sm focus:outline-none text-muted-foreground truncate"
                readOnly
                value={
                  typeof window !== "undefined" ? window.location.href : ""
                }
              />
            </div>
          </div>
          <Button size="sm" onClick={copyToClipboard} className="px-3">
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
