"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  Radio,
  Activity,
  ShieldAlert,
  Sliders,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navGroups = [
    {
      title: "DNS management",
      items: [
        { name: "Hosted zones", href: "/hosted-zones", icon: Globe, active: pathname.startsWith("/hosted-zones") },
        { name: "Traffic policies", href: "/traffic-policies", icon: Radio, active: pathname === "/traffic-policies" },
        { name: "Traffic policy records", href: "/traffic-policy-records", icon: Sliders, active: pathname === "/traffic-policy-records" },
      ],
    },
    {
      title: "Health checking",
      items: [
        { name: "Health checks", href: "/health-checks", icon: Activity, active: pathname === "/health-checks" },
      ],
    },
    {
      title: "DNS Firewall & Resolver",
      items: [
        { name: "Resolver", href: "/resolver", icon: ShieldAlert, active: pathname === "/resolver" },
        { name: "Profiles", href: "/profiles", icon: Sliders, active: pathname === "/profiles" },
      ],
    },
    {
      title: "Monitoring",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: pathname === "/dashboard" },
      ],
    },
  ];

  return (
    <aside
      className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between transition-all duration-200 select-none z-30 ${
        collapsed ? "w-14" : "w-64"
      }`}
    >
      <div className="flex-1 overflow-y-auto py-3">
        {/* Service Title */}
        {!collapsed && (
          <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-800 mb-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center justify-between">
              <span>Route 53</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">DNS & domain management</p>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="space-y-4 px-2">
          {navGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <div className="px-2.5 pb-1 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {group.title}
                </div>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.name : undefined}
                        className={`flex items-center space-x-2.5 px-3 py-2 rounded text-sm transition-colors ${
                          item.active
                            ? "bg-blue-50 dark:bg-blue-950/60 text-aws-blue dark:text-blue-400 font-semibold border-l-2 border-aws-blue"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
