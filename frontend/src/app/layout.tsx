"use client";

import "./globals.css";
import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { KeyboardShortcutsModal } from "@/components/layout/KeyboardShortcutsModal";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("route53_dark") === "true";
    setDarkMode(isDark);
  }, []);

  const handleToggleDark = (val: boolean) => {
    setDarkMode(val);
    localStorage.setItem("route53_dark", String(val));
    if (val) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <html lang="en">
      <head>
        <title>Amazon Route 53 - DNS Management Console</title>
        <meta name="description" content="AWS Route 53 Web Console Clone" />
      </head>
      <body className="min-h-screen flex flex-col bg-aws-bg dark:bg-aws-darkBg text-aws-text dark:text-gray-200">
        <TopNav darkMode={darkMode} setDarkMode={handleToggleDark} />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-aws-bg dark:bg-aws-darkBg">
            {children}
          </main>
        </div>
        <KeyboardShortcutsModal />
      </body>
    </html>
  );
}
