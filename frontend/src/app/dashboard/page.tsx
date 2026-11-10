"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { getHostedZones } from "@/lib/api";
import { Globe, ShieldCheck, Activity, Radio, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const [zoneCount, setZoneCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    getHostedZones({ limit: 100 })
      .then((res) => {
        setZoneCount(res.total || 0);
        const recs = (res.items || []).reduce(
          (acc: number, item: any) => acc + (item.record_count || 0),
          0
        );
        setTotalRecords(recs);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Route 53 Dashboard
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Amazon Route 53 is a highly available and scalable cloud Domain Name System (DNS) web service.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase">Hosted zones</span>
            <Globe className="w-4 h-4 text-aws-blue" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{zoneCount}</div>
          <Link
            href="/hosted-zones"
            className="text-xs text-aws-blue hover:underline mt-2 inline-flex items-center gap-1"
          >
            Manage hosted zones <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase">DNS Records</span>
            <ShieldCheck className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalRecords}</div>
          <span className="text-xs text-gray-500 mt-2 block">Active DNS record sets</span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase">Health checks</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">0</div>
          <Link
            href="/health-checks"
            className="text-xs text-aws-blue hover:underline mt-2 inline-flex items-center gap-1"
          >
            Configure health checks <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase">Traffic policies</span>
            <Radio className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">0</div>
          <Link
            href="/traffic-policies"
            className="text-xs text-aws-blue hover:underline mt-2 inline-flex items-center gap-1"
          >
            Create traffic policy <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Quick Start Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded p-6 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
          Get started with DNS routing
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
          Create a public hosted zone to tell Route 53 how you want to route traffic for your domain name on the Internet.
          Or create a private hosted zone to manage DNS records within Amazon Virtual Private Clouds (VPCs).
        </p>
        <div className="pt-2">
          <Link href="/hosted-zones">
            <Button variant="primary">Create hosted zone</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
