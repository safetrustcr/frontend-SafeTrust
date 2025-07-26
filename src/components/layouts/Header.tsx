'use client';

import React from 'react';
import Link from 'next/link';
import { SearchHeader } from '@/components/layouts/SearchHeader';

export const Header = () => {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-10 bg-white dark:bg-dark-background shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <img
                src="/img/logo.png"
                alt="SafeTrust Logo"
                className="h-8 w-auto"
              />
              <span className="text-xl font-semibold text-gray-800 dark:text-white ml-2">SafeTrust</span>
            </Link>
            
            <div className="flex-1 max-w-2xl ml-8">
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