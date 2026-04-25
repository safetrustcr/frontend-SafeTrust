"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";

export default function GuestBookingsSummary() {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl">My active bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stub for bookings - to be replaced by actual data later */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">No active bookings</h4>
              <p className="text-sm text-gray-500">You don't have any upcoming stays yet.</p>
            </div>
          </div>
          <Button variant="outline" className="mt-4 md:mt-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Explore Properties
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
