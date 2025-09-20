"use client";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet, Shield } from "lucide-react";
import { useWallet } from "@/components/auth/wallet/hooks/wallet.hook";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import {
  initializedReservationEscrow,
  fundReservationEscrow,
} from "@/services/escrow.service";

interface BookingButtonProps {
  dateRange?: DateRange;
  isAvailable: boolean;
  totalPrice: number;
  onBookingStart?: () => void;
  onBookingComplete?: (bookingId: string) => void;
  onBookingError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  maxRetries?: number;
}

const BookingButton: React.FC<BookingButtonProps> = ({
  dateRange,
  isAvailable,
  totalPrice,
  onBookingStart,
  onBookingComplete,
  onBookingError,
  className,
  disabled = false,
  maxRetries = 3,
}) => {
  const [isBooking, setIsBooking] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const { handleConnect } = useWallet();
  const { address } = useGlobalAuthenticationStore();

  const isConnected = React.useMemo(() => {
    return Boolean(address && address.trim().length > 0);
  }, [address]);

  const canBook = React.useMemo(() => {
    return (
      dateRange?.from &&
      dateRange?.to &&
      isAvailable &&
      totalPrice > 0 &&
      !disabled
    );
  }, [dateRange, isAvailable, totalPrice, disabled]);

  React.useEffect(() => {
    return () => {
      setIsBooking(false);
      setRetryCount(0);
    };
  }, []);

  const handleBooking = async () => {
    if (!canBook) return;

    try {
      setIsBooking(true);
      onBookingStart?.();

      if (!isConnected) {
        await handleConnect();
        setIsBooking(false);
        return;
      }

      if (!dateRange?.from || !dateRange?.to) {
        throw new Error("Please select check-in and check-out dates");
      }

      if (totalPrice <= 0) {
        throw new Error("Invalid price amount");
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (dateRange.from < now) {
        throw new Error("Check-in date cannot be in the past");
      }

      if (dateRange.to <= dateRange.from) {
        throw new Error("Check-out date must be after check-in date");
      }

      const nights = Math.ceil(
        (dateRange.to.getTime() - dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const basePrice = totalPrice / (1 + 0.1 + 0.05);
      const tax = basePrice * 0.1;
      const platformFee = basePrice * 0.05;

      if (basePrice <= 0 || tax < 0 || platformFee < 0) {
        throw new Error("Invalid price calculation");
      }

      const escrowResult = await initializedReservationEscrow({
        hotelName: "Shikara Hotel",
        description: `Room reservation for ${nights} nights from ${dateRange.from.toLocaleDateString()} to ${dateRange.to.toLocaleDateString()}`,
        price: basePrice,
        tax: tax,
      });

      if (!escrowResult?.data?.contractId) {
        throw new Error("Failed to create escrow contract");
      }

      await fundReservationEscrow({
        contractId: escrowResult.data.contractId,
        amount: totalPrice,
      });

      const bookingId = escrowResult.data.contractId;
      setRetryCount(0);
      onBookingComplete?.(bookingId);
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during booking";

      const shouldRetry =
        retryCount < maxRetries &&
        (errorMessage.toLowerCase().includes("network") ||
          errorMessage.toLowerCase().includes("timeout") ||
          errorMessage.toLowerCase().includes("connection"));

      if (shouldRetry) {
        setRetryCount((prev) => prev + 1);
        setTimeout(
          () => {
            handleBooking();
          },
          1000 * (retryCount + 1)
        );
        return;
      }

      setRetryCount(0);
      onBookingError?.(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  const getButtonText = () => {
    if (isBooking) {
      return retryCount > 0
        ? `Retrying... (${retryCount}/${maxRetries})`
        : "Processing...";
    }
    if (!isConnected) return "Connect Wallet to Book";
    if (!dateRange?.from || !dateRange?.to) return "Select Dates";
    if (!isAvailable) return "Not Available";
    return `Book Now - $${totalPrice.toFixed(2)}`;
  };

  const getButtonIcon = () => {
    if (isBooking) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (!isConnected) return <Wallet className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  return (
    <Button
      onClick={handleBooking}
      disabled={!canBook || isBooking}
      size="lg"
      className={`w-full ${className}`}
      aria-label={getButtonText()}
      aria-disabled={!canBook || isBooking}
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );
};

export { BookingButton };
export type { BookingButtonProps };
