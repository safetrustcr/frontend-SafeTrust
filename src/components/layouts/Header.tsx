"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
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
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center gap-2">
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
                  className="h-8 w-auto"
                />
                <span className="hidden sm:block text-xl font-semibold text-gray-800 dark:text-white ml-2">
                  SafeTrust
                </span>
              </Link>
            </div>

            <div className="flex-1 max-w-2xl">
              <SearchHeader />
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
