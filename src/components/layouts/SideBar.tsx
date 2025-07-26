'use client';

import { Bell, Heart } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SideBarProps {
  className?: string;
  notificationCount?: number;
}

export function SideBar({ className, notificationCount = 0 }: SideBarProps) {
  return (
    <div className={cn('hidden md:flex fixed left-0 top-16 flex-col h-[calc(100vh-4rem)] w-48 bg-background border-r', className)}>
      <div className="flex flex-col items-start gap-4 py-4 px-4">
        <Link
          href="/notifications"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors duration-200 w-full relative"
        >
          <Bell className="w-6 h-6" />
          <span>Notifications</span>
          {notificationCount > 0 && (
            <div className="absolute right-2 bg-blue-300 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs">
              {notificationCount}
            </div>
          )}
        </Link>
        <Link
          href="/favorites"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors duration-200 w-full"
        >
          <Heart className="w-6 h-6" />
          <span>Favorite</span>
        </Link>
      </div>
    </div>
  );
} 