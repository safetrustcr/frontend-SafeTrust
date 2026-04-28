"use client";

import Image from "next/image";
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm dark:border-b dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center gap-3 overflow-hidden sm:gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={onMenuClick}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>

              <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2">
                <Image
                  src="/img/logo-new.png"
                  alt="SafeTrust Logo"
                  width={40}
                  height={40}
                  priority
                  className="h-9 w-9 shrink-0 object-contain"
                />
                <span className="hidden truncate text-xl font-semibold text-gray-800 dark:text-white sm:block">
                  SafeTrust
                </span>
              </Link>
            </div>

            <div className="min-w-0 flex-1 max-w-2xl">
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
