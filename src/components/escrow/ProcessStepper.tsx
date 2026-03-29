"use client";

import React from "react";
import { Check, Building, Banknote, IdCard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

interface ProcessStepperProps {
  currentStep: number;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Escrow created",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry.",
    icon: Building,
  },
  {
    id: 2,
    title: "Payment sent",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry.",
    icon: Banknote,
  },
  {
    id: 3,
    title: "Deposit blocked",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry.",
    icon: IdCard,
  },
  {
    id: 4,
    title: "Deposit released",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry.",
    icon: LogOut,
  },
];

export const ProcessStepper = ({ currentStep }: ProcessStepperProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Process</h3>
      <div className="relative space-y-8">
        {/* Vertical line connecting steps */}
        <div 
          className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-200" 
          aria-hidden="true"
        />

        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative flex items-start group">
              <div className="flex items-center h-10">
                <span className={cn(
                  "relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-colors",
                  isActive ? "bg-emerald-500 text-white" : 
                  isCompleted ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                )}>
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </span>
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className={cn(
                  "text-sm font-medium leading-6",
                  isActive ? "text-gray-900" : "text-gray-500"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
