"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import Input from "@cloudscape-design/components/input";
import { applyMode, Mode } from "@cloudscape-design/global-styles";
import { logoutUser } from "@/lib/api";

interface TopNavProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ darkMode, setDarkMode }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState({ username: "admin", account_id: "1234-5678-9012", role: "AdministratorAccess" });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("route53_user");
      if (stored) setCurrentUser((user) => ({ ...user, ...JSON.parse(stored) }));
    } catch {
      // Keep the default console identity when stored user data is unavailable.
    }
  }, []);

  return (
    <TopNavigation
      identity={{ title: "Route 53", href: "/hosted-zones", onFollow: (event) => { event.preventDefault(); router.push("/hosted-zones"); } }}
      search={
        <Input
          value={search}
          placeholder="Search Route 53"
          ariaLabel="Search Route 53"
          onChange={({ detail }) => setSearch(detail.value)}
          onKeyDown={(event) => {
            if (event.detail.key === "Enter") router.push(`/hosted-zones?search=${encodeURIComponent(search)}`);
          }}
        />
      }
      utilities={[
        { type: "button", text: darkMode ? "Light mode" : "Dark mode", iconName: darkMode ? "view-full" : "status-info", onClick: () => { const nextMode = !darkMode; setDarkMode(nextMode); applyMode(nextMode ? Mode.Dark : Mode.Light); } },
        { type: "button", text: "Notifications", iconName: "notification", badge: true },
        {
          type: "menu-dropdown",
          text: `${currentUser.username} @ ${currentUser.account_id}`,
          iconName: "user-profile",
          items: [
            { id: "identity", text: `${currentUser.username} · ${currentUser.account_id}`, disabled: true },
            { id: "role", text: currentUser.role, disabled: true },
            { id: "switch", text: "Switch role / account" },
            { id: "logout", text: "Sign out" },
          ],
          onItemClick: async ({ detail }) => {
            if (detail.id === "switch") router.push("/login");
            if (detail.id === "logout") { await logoutUser(); router.push("/login"); }
          },
        },
      ]}
    />
  );
};
