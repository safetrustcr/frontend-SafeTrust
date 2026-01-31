"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingEscrowWrapper } from "@/components/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Create Escrow Page
 * 
 * Route: /dashboard/hotel/create-escrow
 * 
 * Simple page for users to create an escrow by entering a booking ID.
 * In production, users would typically arrive here from the booking flow.
 */
export default function CreateEscrowPage() {
  const router = useRouter();
  const [bookingId, setBookingId] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingId.trim()) {
      setShowForm(true);
    }
  };

  if (showForm && bookingId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setBookingId("");
              }}
              className="mb-4"
            >
              ← Back
            </Button>
          </div>
          <BookingEscrowWrapper
            bookingId={bookingId}
            onComplete={() => router.push("/dashboard")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Escrow for Booking</CardTitle>
          <CardDescription>
            Enter your booking ID to create a secure escrow payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookingId">Booking ID</Label>
              <Input
                id="bookingId"
                placeholder="e.g., booking-123"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                required
              />
              <p className="text-xs text-slate-500">
                You can find your booking ID in your booking confirmation email
              </p>
            </div>
            <Button type="submit" className="w-full">
              Continue to Escrow Creation
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              Your payment will be secured using blockchain escrow technology
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
