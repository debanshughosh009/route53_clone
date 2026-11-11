"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, RefreshCw, Radio, Plus, Layers, Sliders } from "lucide-react";

interface TrafficPolicy {
  id: string;
  name: string;
  version: number;
  description: string;
  policyType: string;
  recordsCount: number;
  createdAt: string;
}

const SAMPLE_TRAFFIC_POLICIES: TrafficPolicy[] = [
  {
    id: "tp-01",
    name: "Geo-Proximity-Global-Web",
    version: 1,
    description: "Routes users to nearest web cluster (North America, Europe, Asia-Pacific) with automated failover.",
    policyType: "Geolocation & Failover",
    recordsCount: 2,
    createdAt: "2026-10-15",
  },
  {
    id: "tp-02",
    name: "Latency-Based-Routing-API",
    version: 2,
    description: "Evaluates round-trip network latency to route API queries to the fastest AWS region.",
    policyType: "Latency-based",
    recordsCount: 1,
    createdAt: "2026-10-22",
  },
  {
    id: "tp-03",
    name: "DR-Multi-Region-Active-Passive",
    version: 1,
    description: "Active-passive disaster recovery configuration connected to Route 53 health checks.",
    policyType: "Failover with Health Check",
    recordsCount: 1,
    createdAt: "2026-11-02",
  },
];

export default function TrafficPoliciesPage() {
  const [policies, setPolicies] = useState<TrafficPolicy[]>(SAMPLE_TRAFFIC_POLICIES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = policies.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.policyType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <Breadcrumbs items={[{ label: "Traffic policies" }]} />

      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded shadow-sm">
        {/* Header & Actions */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                Traffic policies
                <span className="text-sm font-normal text-gray-500">({filtered.length})</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Traffic policies define complex routing configurations using a visual decision tree editor (geolocation, latency, and failover).
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPolicies(SAMPLE_TRAFFIC_POLICIES)}
                title="Reset / refresh examples"
                className="p-2"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>

              <Link href="/traffic-policy-records">
                <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" />
                  Traffic policy records
                </Button>
              </Link>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const newPolicy: TrafficPolicy = {
                    id: `tp-${Date.now()}`,
                    name: `Custom-Policy-${Math.floor(Math.random() * 100)}`,
                    version: 1,
                    description: "Custom user-defined multi-region routing rule.",
                    policyType: "Weighted & Geolocation",
                    recordsCount: 0,
                    createdAt: "Just now",
                  };
                  setPolicies([newPolicy, ...policies]);
                }}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Create traffic policy
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3 pt-2">
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Find traffic policies by name, type, or description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-aws-blue focus:border-aws-blue"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-aws-tableHeader dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider font-bold">
                <th className="py-3 px-3 w-10 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-3 px-4">Policy name</th>
                <th className="py-3 px-4 text-center">Latest version</th>
                <th className="py-3 px-4">Routing architecture</th>
                <th className="py-3 px-4 text-center">Active records</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Created at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filtered.map((policy) => {
                const isSelected = selectedId === policy.id;
                return (
                  <tr
                    key={policy.id}
                    onClick={() => setSelectedId(isSelected ? null : policy.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/40"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="radio"
                        name="selectedPolicy"
                        checked={isSelected}
                        onChange={() => setSelectedId(policy.id)}
                        className="w-4 h-4 text-aws-blue focus:ring-aws-blue cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-aws-blue hover:underline">
                      {policy.name}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <Badge variant="blue" size="sm">
                        v{policy.version}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="grey" size="sm">
                        {policy.policyType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-gray-800 dark:text-gray-200">
                      {policy.recordsCount}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 max-w-sm truncate">
                      {policy.description}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {policy.createdAt}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
          <span>Showing 1-{filtered.length} of {policies.length} traffic policies</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
