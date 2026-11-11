"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, RefreshCw, ExternalLink, Sliders, Plus, Trash2 } from "lucide-react";

interface PolicyRecord {
  id: string;
  name: string;
  policyName: string;
  policyVersion: number;
  hostedZone: string;
  hostedZoneId: string;
  ttl: number;
  createdAt: string;
}

const SAMPLE_POLICY_RECORDS: PolicyRecord[] = [
  {
    id: "tpr-01",
    name: "www.example.com.",
    policyName: "Geo-Proximity-Global-Web",
    policyVersion: 1,
    hostedZone: "example.com.",
    hostedZoneId: "Z0A1B2C3D4EXAMPL",
    ttl: 60,
    createdAt: "2026-11-01 10:24 UTC",
  },
  {
    id: "tpr-02",
    name: "api.example.com.",
    policyName: "Latency-Based-Routing-API",
    policyVersion: 2,
    hostedZone: "example.com.",
    hostedZoneId: "Z0A1B2C3D4EXAMPL",
    ttl: 60,
    createdAt: "2026-11-04 14:12 UTC",
  },
  {
    id: "tpr-03",
    name: "checkout.staging.io.",
    policyName: "DR-Multi-Region-Active-Passive",
    policyVersion: 1,
    hostedZone: "staging.io.",
    hostedZoneId: "Z0STAGING00IO001",
    ttl: 120,
    createdAt: "2026-11-08 09:30 UTC",
  },
];

export default function TrafficPolicyRecordsPage() {
  const [records, setRecords] = useState<PolicyRecord[]>(SAMPLE_POLICY_RECORDS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = records.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.policyName.toLowerCase().includes(search.toLowerCase()) ||
      r.hostedZone.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (selectedId) {
      setRecords(records.filter((r) => r.id !== selectedId));
      setSelectedId(null);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <Breadcrumbs items={[{ label: "Traffic policy records" }]} />

      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded shadow-sm">
        {/* Header & Actions */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                Traffic policy records
                <span className="text-sm font-normal text-gray-500">({filtered.length})</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                A traffic policy record uses a Route 53 traffic policy to route internet traffic for a specific DNS domain.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRecords(SAMPLE_POLICY_RECORDS)}
                title="Reset / refresh examples"
                className="p-2"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={!selectedId}
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Delete
              </Button>

              <Link href="/traffic-policies">
                <Button variant="secondary" size="sm">
                  View traffic policies
                </Button>
              </Link>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const newRec: PolicyRecord = {
                    id: `tpr-${Date.now()}`,
                    name: `app-${Math.floor(Math.random() * 100)}.example.com.`,
                    policyName: "Geo-Proximity-Global-Web",
                    policyVersion: 1,
                    hostedZone: "example.com.",
                    hostedZoneId: "Z0A1B2C3D4EXAMPL",
                    ttl: 60,
                    createdAt: "Just now",
                  };
                  setRecords([newRec, ...records]);
                }}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Create traffic policy record
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3 pt-2">
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Find traffic policy records by record name, policy, or zone"
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
                <th className="py-3 px-4">Record name</th>
                <th className="py-3 px-4">Traffic policy</th>
                <th className="py-3 px-4 text-center">Version</th>
                <th className="py-3 px-4">Hosted zone</th>
                <th className="py-3 px-4 text-right">TTL (Seconds)</th>
                <th className="py-3 px-4">Created at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filtered.map((record) => {
                const isSelected = selectedId === record.id;
                return (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedId(isSelected ? null : record.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/40"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="radio"
                        name="selectedPolicyRecord"
                        checked={isSelected}
                        onChange={() => setSelectedId(record.id)}
                        className="w-4 h-4 text-aws-blue focus:ring-aws-blue cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                      {record.name}
                    </td>
                    <td className="py-3 px-4 font-medium text-aws-blue hover:underline">
                      <Link href="/traffic-policies" onClick={(e) => e.stopPropagation()}>
                        {record.policyName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <Badge variant="blue" size="sm">
                        v{record.policyVersion}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium text-aws-blue hover:underline">
                      <Link
                        href={`/hosted-zones/${record.hostedZoneId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1"
                      >
                        {record.hostedZone}
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800 dark:text-gray-200">
                      {record.ttl}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {record.createdAt}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
          <span>Showing 1-{filtered.length} of {records.length} records</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
