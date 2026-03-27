"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchHeader } from "@/components/layouts/SearchHeader";


interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-dark-background shadow-sm">
        <div className="px-4 md:px-6">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={onMenuClick}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>

              <Link href="/" className="flex items-center">
                <img
                  src="/img/logo.png"
                  alt="SafeTrust Logo"
                  className="h-8 w-auto min-w-[32px]"
                />
                <span className="hidden sm:inline-block text-xl font-semibold text-gray-800 dark:text-white ml-2">
                  SafeTrust
                </span>
              </Link>
            </div>

            <div className="flex-1 max-w-2xl">
              <div className="hidden md:block">
                <SearchHeader />
              </div>
              <Button variant="ghost" size="icon" className="md:hidden ml-auto">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
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
