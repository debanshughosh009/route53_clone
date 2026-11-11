"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe,
  Bell,
  Search,
  Moon,
  Sun,
  User,
  ChevronDown,
  LogOut,
  Shield,
  Layers,
} from "lucide-react";
import { logoutUser } from "@/lib/api";

interface TopNavProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ darkMode, setDarkMode }) => {
  const router = useRouter();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    account_id: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("route53_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      } else {
        // Fallback default
        setCurrentUser({
          username: "admin",
          account_id: "1234-5678-9012",
          role: "AdministratorAccess",
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  return (
    <header className="h-12 bg-aws-nav text-gray-200 flex items-center justify-between px-4 text-sm select-none sticky top-0 z-40 border-b border-gray-700">
      {/* Left: AWS Logo & Service Identifier */}
      <div className="flex items-center space-x-3">
        <Link
          href="/hosted-zones"
          className="flex items-center space-x-2.5 hover:opacity-90 transition-opacity font-bold"
        >
          {/* AWS Cube Icon */}
          <div className="w-6 h-6 bg-aws-orange rounded flex items-center justify-center text-white font-black text-sm shadow-sm">
            R
          </div>
          <span className="font-bold text-white tracking-wide text-base hidden sm:inline">
            Route 53
          </span>
        </Link>
        <span className="text-gray-500 hidden md:inline">|</span>
        <span className="text-gray-300 hidden md:inline font-medium text-sm">
          AWS Management Console
        </span>
      </div>

      {/* Middle: AWS Global Search Bar */}
      <div className="flex-1 max-w-lg mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for services, features, docs (Press / to focus)"
            className="w-full bg-aws-navSearch border border-gray-600 rounded px-9 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue transition-colors"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push(`/hosted-zones?search=${(e.target as HTMLInputElement).value}`);
              }
            }}
          />
          <kbd className="absolute right-2.5 top-2 text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded border border-gray-600">
            /
          </kbd>
        </div>
      </div>

      {/* Right: Controls & Account info */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 hover:bg-aws-navHover rounded text-gray-300 hover:text-white transition-colors"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Global Route 53 Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-gray-800/80 rounded border border-gray-700 text-gray-300 text-xs font-medium">
          <Globe className="w-4 h-4 text-blue-400" />
          <span>Global</span>
        </div>

        {/* Notifications */}
        <button
          className="p-2 hover:bg-aws-navHover rounded text-gray-300 hover:text-white relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-aws-orange rounded-full" />
        </button>

        {/* Account Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            className="flex items-center space-x-2 px-2.5 py-1.5 hover:bg-aws-navHover rounded text-white font-medium transition-colors text-sm"
          >
            <User className="w-4 h-4 text-gray-300" />
            <span className="hidden sm:inline">
              {currentUser?.username || "admin"} @ {currentUser?.account_id || "1234-5678-9012"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {accountMenuOpen && (
            <div
              className="absolute right-0 mt-1 w-72 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded shadow-xl border border-gray-300 dark:border-gray-700 py-2.5 z-50 text-sm"
              onMouseLeave={() => setAccountMenuOpen(false)}
            >
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="font-bold text-gray-900 dark:text-white text-base">
                  {currentUser?.username || "admin"}
                </p>
                <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1 space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-green-600" />
                  <span className="font-medium">{currentUser?.role || "AdministratorAccess"}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Account ID: {currentUser?.account_id || "1234-5678-9012"}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/login"
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2.5 text-gray-700 dark:text-gray-300"
                  onClick={() => setAccountMenuOpen(false)}
                >
                  <Layers className="w-4 h-4 text-gray-400" />
                  <span>Switch Role / Account</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center space-x-2.5 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out of AWS Console</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
