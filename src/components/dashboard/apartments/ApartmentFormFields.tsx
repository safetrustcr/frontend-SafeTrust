'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ApartmentFormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

interface IconFieldProps extends ComponentProps<typeof Input> {
  icon: ReactNode;
}

interface IconSelectFieldProps {
  icon: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<{ label: string; value: string }>;
}

export function ApartmentFormField({
  label,
  children,
  className,
}: ApartmentFormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-semibold text-gray-900">{label}</Label>
      {children}
    </div>
  );
}

export function IconInputField({
  icon,
  className,
  ...props
}: IconFieldProps) {
  return (
    <div className="flex overflow-hidden rounded-md border border-input bg-white shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-400">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-orange-100 text-orange-500">
        {icon}
      </div>
      <Input
        {...props}
        className={cn(
          'h-11 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0',
          className
        )}
      />
    </div>
  );
}

export function IconSelectField({
  icon,
  value,
  onValueChange,
  placeholder,
  options,
}: IconSelectFieldProps) {
  return (
    <div className="flex overflow-hidden rounded-md border border-input bg-white shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-400">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-orange-100 text-orange-500">
        {icon}
      </div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-11 rounded-none border-0 bg-transparent shadow-none focus:ring-0">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface NumberSelectFieldProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
}

export function NumberSelectField({
  label,
  value,
  onValueChange,
  options,
}: NumberSelectFieldProps) {
  return (
    <ApartmentFormField label={label}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-11 bg-white shadow-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </ApartmentFormField>
  );
}
