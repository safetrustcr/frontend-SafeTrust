"use client";

import React from "react";

import { useEscrowUpdates } from "../hook/useEscrowUpdates";

export function LiveEscrowStatus({ escrowId }: { escrowId: string }) {
  const { status } = useEscrowUpdates(escrowId);

  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-2xl shadow-sm border bg-white">
        <div className="relative flex items-center">
          <span
            className={`w-3 h-3 rounded-full ${
              status === "pending"
                ? "bg-gray-400"
                : status === "pending_action"
                  ? "bg-yellow-500"
                  : status === "milestone_approved"
                    ? "bg-green-500"
                    : status === "disputed"
                      ? "bg-red-500"
                      : "bg-gray-400"
            }`}
          />
          <span
            className={`absolute inline-flex w-3 h-3 rounded-full opacity-75 animate-ping ${
              status === "pending"
                ? "bg-gray-400"
                : status === "pending_action"
                  ? "bg-yellow-500"
                  : status === "milestone_approved"
                    ? "bg-green-500"
                    : status === "disputed"
                      ? "bg-red-500"
                      : "bg-gray-400"
            }`}
          />
        </div>

        <div className="flex flex-col">
          <span
            className={`font-semibold capitalize text-xl ${
              status === "pending"
                ? "text-gray-500"
                : status === "pending_action"
                  ? "text-yellow-600"
                  : status === "milestone_approved"
                    ? "text-green-600"
                    : status === "disputed"
                      ? "text-red-600"
                      : "text-gray-600"
            }`}
          >
            {status.replace("_", " ")}
          </span>
          <span className="text-base text-black">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </>
  );
}