"use client";

import React from "react";
import { Phone, Mail } from "lucide-react";

interface OwnerContactProps {
  phone: string;
  email: string;
}

export const OwnerContact = ({ phone, email }: OwnerContactProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Owner contact</h3>
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100/50 text-orange-500">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-gray-600">{phone}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100/50 text-orange-500">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-gray-600">{email}</span>
        </div>
      </div>
    </div>
  );
};
