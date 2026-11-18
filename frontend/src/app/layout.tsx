"use client";

import "./globals.css";
import "@cloudscape-design/global-styles/index.css";
import React, { useState, useEffect } from "react";
import AppLayout from "@cloudscape-design/components/app-layout";
import { applyMode, Mode } from "@cloudscape-design/global-styles";
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
    applyMode(isDark ? Mode.Dark : Mode.Light);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const handleToggleDark = (val: boolean) => {
    setDarkMode(val);
    localStorage.setItem("route53_dark", String(val));
    applyMode(val ? Mode.Dark : Mode.Light);
    document.documentElement.classList.toggle("dark", val);
  };

  useEffect(() => {
    applyMode(darkMode ? Mode.Dark : Mode.Light);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <html lang="en">
      <head>
        <title>Amazon Route 53 - DNS Management Console</title>
        <meta name="description" content="AWS Route 53 Web Console Clone" />
      </head>
      <body className="min-h-screen flex flex-col">
        <TopNav darkMode={darkMode} setDarkMode={handleToggleDark} />
        <AppLayout
          navigation={<Sidebar />}
          toolsHide
          contentType="default"
          disableContentPaddings
          navigationWidth={250}
          content={<main className="min-h-[calc(100vh-50px)] p-4 sm:p-6 bg-aws-bg dark:bg-aws-darkBg">{children}</main>}
        />
        <KeyboardShortcutsModal />
      </body>
    </html>
  );
}
