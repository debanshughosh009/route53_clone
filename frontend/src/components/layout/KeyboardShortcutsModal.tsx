"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Command } from "lucide-react";

export const KeyboardShortcutsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        // Focus the global search or page search input
        e.preventDefault();
        const searchInput =
          (document.querySelector('input[type="text"][placeholder*="Find"]') as HTMLInputElement) ||
          (document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement);
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const shortcuts = [
    { key: "/", desc: "Focus search bar" },
    { key: "c", desc: "Open Create modal (on Hosted Zones or Records page)" },
    { key: "Esc", desc: "Close active modal or dismiss alerts" },
    { key: "?", desc: "Open this keyboard shortcuts reference" },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-3 right-3 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full shadow-md text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-xs flex items-center gap-1.5 transition-colors z-30"
        title="Keyboard shortcuts (?)"
      >
        <Command className="w-3.5 h-3.5" />
        <span className="text-[11px] font-mono font-bold pr-1">?</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Keyboard Shortcuts"
        maxWidth="md"
        footer={
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3 py-1">
          <p className="text-xs text-gray-500 mb-2">
            Use these keyboard shortcuts to navigate Route 53 efficiently:
          </p>
          <div className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded">
            {shortcuts.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 text-xs"
              >
                <span className="text-gray-700 dark:text-gray-300">{s.desc}</span>
                <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded font-mono font-bold text-[11px] text-gray-800 dark:text-gray-200 shadow-sm">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
};
