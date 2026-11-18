"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import SideNavigation from "@cloudscape-design/components/side-navigation";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const items = [
    { type: "section", text: "DNS management", items: [
      { type: "link", text: "Hosted zones", href: "/hosted-zones" },
      { type: "link", text: "Traffic policies", href: "/traffic-policies" },
      { type: "link", text: "Traffic policy records", href: "/traffic-policy-records" },
    ] },
    { type: "section", text: "Health checking", items: [
      { type: "link", text: "Health checks", href: "/health-checks" },
    ] },
    { type: "section", text: "DNS firewall & resolver", items: [
      { type: "link", text: "Resolver", href: "/resolver" },
      { type: "link", text: "Profiles", href: "/profiles" },
    ] },
    { type: "section", text: "Monitoring", items: [
      { type: "link", text: "Dashboard", href: "/dashboard" },
    ] },
  ] as const;

  return (
    <SideNavigation
      header={{ text: "Route 53", href: "/hosted-zones" }}
      activeHref={pathname.startsWith("/hosted-zones") ? "/hosted-zones" : pathname}
      items={items}
      onFollow={(event) => {
        event.preventDefault();
        router.push(event.detail.href);
      }}
    />
  );
};
