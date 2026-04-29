"use client";

import { Button } from "@/components/ui/button";
import { Shield, Phone, Star } from "lucide-react";
import FavoriteButton from "@/components/room/mobile/FavoriteButton";
import ShareButton from "./ShareButton";
import ContactButton from "./ContactButton";
import ReportButton from "./ReportButton";

interface RoomActionBarProps {
  isLiked?: boolean;
  likeCount?: number;
  onShare?: () => void;
  onLike?: () => void;
  onContact?: () => void;
  onReport?: () => void;
  onCall?: () => void;
  showTrustBadges?: boolean;
  className?: string;
}

const RoomActionBar = ({
  isLiked = false,
  likeCount = 24,
  onShare,
  onLike,
  onContact,
  onReport,
  onCall,
  showTrustBadges = true,
  className = "",
}: RoomActionBarProps) => {
  const handleCall = () => {
    if (onCall) {
      onCall();
    } else {
      console.log("Call host clicked");
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Primary Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShareButton onShare={onShare} />

          <FavoriteButton
            isLiked={isLiked}
            likeCount={likeCount}
            onLike={onLike}
          />
        </div>

        <div className="flex items-center gap-2">
          <ContactButton onContact={onContact} />

          <Button
            variant="outline"
            size="sm"
            onClick={handleCall}
            className="flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Call</span>
          </Button>
        </div>
      </div>

      {/* Trust & Safety */}
      {showTrustBadges && (
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-muted/30 rounded-lg">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <Shield className="w-4 h-4" />
              <span>Verified Host</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Star className="w-4 h-4" />
              <span>Superhost</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <Shield className="w-4 h-4" />
              <span>Identity Verified</span>
            </div>
          </div>

          <ReportButton onReport={onReport} />
        </div>
      )}

      {/* Mobile Actions */}
      <div className="flex sm:hidden gap-2">
        <ShareButton className="flex-1" onShare={onShare} />
        <FavoriteButton
          className="flex-1"
          isLiked={isLiked}
          likeCount={0}
          showCount={false}
          onLike={onLike}
        />
        <ContactButton className="flex-1" onContact={onContact} />
      </div>
    </div>
  );
};

export default RoomActionBar;
