"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchHeader } from "@/components/layouts/SearchHeader";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 dark:border-b dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={onMenuClick}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>

              <Link href="/" className="flex items-center shrink-0">
                <img
                  src="/img/logo.png"
                  alt="SafeTrust Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
                <span className="hidden sm:block text-xl font-semibold text-gray-800 dark:text-white ml-2">
                  SafeTrust
                </span>
              </Link>
            </div>

            {/* Centre: search — fixed width, not stretching */}
            <div className="w-80 lg:w-96">
              <SearchHeader />
            </div>

            {/* Right: bell | name | avatar — matching Figma order */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              <button
                type="button"
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full px-2 py-1 transition-colors"
              >
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Randall Valenciano
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    RV
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Spacer div to prevent content from being hidden under fixed header */}
      <div className="h-16" />
    </>
  );
};


export default Header;
