"use client";

import React, { useState } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, RefreshCw, Activity, Plus, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface HealthCheck {
  id: string;
  name: string;
  status: "Healthy" | "Degraded" | "Initializing";
  endpoint: string;
  protocol: string;
  interval: string;
  failureThreshold: number;
  alarmStatus: "OK" | "ALARM" | "INSUFFICIENT_DATA";
}

const SAMPLE_HEALTH_CHECKS: HealthCheck[] = [
  {
    id: "hc-01-web",
    name: "us-east-1-primary-web",
    status: "Healthy",
    endpoint: "93.184.216.34:443 /healthz",
    protocol: "HTTPS",
    interval: "Standard (30s)",
    failureThreshold: 3,
    alarmStatus: "OK",
  },
  {
    id: "hc-02-api",
    name: "eu-west-1-secondary-api",
    status: "Healthy",
    endpoint: "api.example.com:443 /api/health",
    protocol: "HTTPS",
    interval: "Fast (10s)",
    failureThreshold: 2,
    alarmStatus: "OK",
  },
  {
    id: "hc-03-rds",
    name: "rds-db-cluster-monitor",
    status: "Healthy",
    endpoint: "db.internal.service.local:5432",
    protocol: "TCP",
    interval: "Standard (30s)",
    failureThreshold: 3,
    alarmStatus: "OK",
  },
  {
    id: "hc-04-legacy",
    name: "legacy-payment-webhook",
    status: "Degraded",
    endpoint: "pay.staging.io:443 /ping",
    protocol: "HTTPS",
    interval: "Standard (30s)",
    failureThreshold: 3,
    alarmStatus: "ALARM",
  },
];

export default function HealthChecksPage() {
  const [checks, setChecks] = useState<HealthCheck[]>(SAMPLE_HEALTH_CHECKS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = checks.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.endpoint.toLowerCase().includes(search.toLowerCase()) ||
      c.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <Breadcrumbs items={[{ label: "Health checks" }]} />

      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded shadow-sm">
        {/* Header & Actions */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                Health checks
                <span className="text-sm font-normal text-gray-500">({filtered.length})</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Route 53 health checks monitor web servers and resources worldwide. Configure DNS failover to healthy endpoints when alarms fire.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setChecks(SAMPLE_HEALTH_CHECKS)}
                title="Reset / refresh examples"
                className="p-2"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={!selectedId}
                onClick={() => {
                  setChecks(checks.filter((c) => c.id !== selectedId));
                  setSelectedId(null);
                }}
                className="text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Delete
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const newCheck: HealthCheck = {
                    id: `hc-${Date.now()}`,
                    name: `endpoint-monitor-${Math.floor(Math.random() * 100)}`,
                    status: "Healthy",
                    endpoint: "example.com:443 /status",
                    protocol: "HTTPS",
                    interval: "Standard (30s)",
                    failureThreshold: 3,
                    alarmStatus: "OK",
                  };
                  setChecks([newCheck, ...checks]);
                }}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Create health check
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3 pt-2">
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Find health checks by name, endpoint, or status"
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
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Endpoint target</th>
                <th className="py-3 px-4 text-center">Protocol</th>
                <th className="py-3 px-4">Request interval</th>
                <th className="py-3 px-4 text-center">CloudWatch Alarm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filtered.map((check) => {
                const isSelected = selectedId === check.id;
                return (
                  <tr
                    key={check.id}
                    onClick={() => setSelectedId(isSelected ? null : check.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/40"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="radio"
                        name="selectedHealthCheck"
                        checked={isSelected}
                        onChange={() => setSelectedId(check.id)}
                        className="w-4 h-4 text-aws-blue focus:ring-aws-blue cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-aws-blue hover:underline">
                      {check.name}
                    </td>
                    <td className="py-3 px-4">
                      {check.status === "Healthy" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border border-green-300 dark:border-green-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          Healthy
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />
                          Degraded
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-800 dark:text-gray-200">
                      {check.endpoint}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="blue" size="sm">
                        {check.protocol}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {check.interval}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={check.alarmStatus === "OK" ? "green" : "red"} size="sm">
                        {check.alarmStatus}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
          <span>Showing 1-{filtered.length} of {checks.length} health checks</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
