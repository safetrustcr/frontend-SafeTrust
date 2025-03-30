'use client';

import { FaUserCircle, FaBell, FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';
import LanguageSwitcher from '@/components/language/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = (menu: string) => {
    if (menu === 'search') {
      setIsSearchVisible(!isSearchVisible);
      if (isProfileVisible) setIsProfileVisible(false);
    } else if (menu === 'profile') {
      setIsProfileVisible(!isProfileVisible);
      if (isSearchVisible) setIsSearchVisible(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-[#1E1E1E] dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="flex items-center">
            <img
              src={theme === 'dark' ? '/img/logolight.png' : '/img/logo.png'}
              alt="SafeTrust Logo"
              className="h-12"
            />
          </Link>
          <span className="ml-2 text-3xl font-bold text-black dark:text-white">
            SafeTrust
          </span>
        </div>

        <div className="flex items-center space-x-4 ml-auto">
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-gray-800 dark:text-white focus:outline-none transition-transform duration-300 ease-in-out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-6 h-6 transform ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>

          <div className="relative hidden lg:block">
            <FaBell
              size={24}
              className="text-black dark:text-white cursor-pointer transition-colors duration-300 ease-in-out hover:text-gray-600 dark:hover:text-gray-300"
              title={t('header.notifications')}
            />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </div>

          <div className="relative">
            <button
              onClick={() => toggleMenu('search')}
              className="flex items-center justify-center w-10 h-10 text-black dark:text-white focus:outline-none transition-colors duration-300 ease-in-out hover:text-gray-600 dark:hover:text-gray-300"
              title={t('header.search')}
            >
              <FaSearch size={20} />
            </button>
            {isSearchVisible && (
              <div className="absolute top-full right-0 mt-2 w-[250px] bg-white dark:bg-[#1E1E1E] border border-gray-300 dark:border-gray-600 rounded-lg shadow-md p-2 z-50 transition-all duration-300 ease-in-out opacity-100 scale-100 origin-top-right">
                <input
                  type="text"
                  id="search-navbar"
                  className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#1E1E1E] dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-colors duration-300 ease-in-out"
                  placeholder={t('header.search')}
                />
              </div>
            )}
          </div>

          <div className="relative hidden lg:block">
            <button
              onClick={() => toggleMenu('profile')}
              className="flex items-center justify-center w-10 h-10 text-black dark:text-white focus:outline-none transition-colors duration-300 ease-in-out hover:text-gray-600 dark:hover:text-gray-300"
              title={t('header.profile')}
            >
              <FaUserCircle size={24} />
            </button>
            {isProfileVisible && (
              <div className="absolute top-full right-0 mt-2 w-[200px] bg-white dark:bg-[#1E1E1E] border border-gray-300 dark:border-gray-600 rounded-lg shadow-md z-50 transition-all duration-300 ease-in-out opacity-100 scale-100 origin-top-right">
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-900 dark:text-white font-semibold">
                    Randall Valenciano
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    name@example.com
                  </p>
                </div>
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-400">
                  <li>
                    <a
                      href="/profile/my-apartments"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white transition-colors duration-300 ease-in-out"
                    >
                      {t('header.myApartments')}
                    </a>
                  </li>
                  <li>
                    <a
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white transition-colors duration-300 ease-in-out"
                    >
                      {t('header.settings')}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white transition-colors duration-300 ease-in-out"
                    >
                      {t('header.signOut')}
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out">
          <div className="absolute top-0 right-0 w-3/4 h-full bg-white dark:bg-[#1E1E1E] transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="p-4">
              <button
                onClick={toggleMobileMenu}
                className="text-2xl text-gray-800 dark:text-white absolute top-4 left-4 transition-transform duration-300 ease-in-out hover:rotate-90"
              >
                &times;
              </button>
              <div className="flex flex-col space-y-4 mt-12">
                <button
                  onClick={() => toggleMenu('search')}
                  className="flex items-center text-left text-gray-800 dark:text-white transition-colors duration-300 ease-in-out hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaSearch size={20} className="mr-2" />
                  {t('header.search')}
                </button>
                <button
                  onClick={() => toggleMenu('profile')}
                  className="flex items-center text-left text-gray-800 dark:text-white transition-colors duration-300 ease-in-out hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaUserCircle size={20} className="mr-2" />
                  {t('header.profile')}
                </button>

                {isProfileVisible && (
                  <div className="mt-4 transition-all duration-300 ease-in-out">
                    <ul className="space-y-2">
                      <li>
                        <Link
                          href="/profile/my-apartments"
                          className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out"
                        >
                          {t('header.myApartments')}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out"
                        >
                          {t('header.settings')}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out"
                        >
                          {t('header.signOut')}
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}

                <button className="flex items-center text-left text-gray-800 dark:text-white mt-4 transition-colors duration-300 ease-in-out hover:text-gray-600 dark:hover:text-gray-300">
                  <FaBell size={20} className="mr-2" />
                  {t('header.notifications')}
                  <span className="ml-2 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex justify-between items-center mt-4">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
