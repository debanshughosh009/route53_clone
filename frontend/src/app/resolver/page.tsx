"use client";

import React, { useState } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, RefreshCw, ShieldAlert, Plus, CheckCircle2, ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface ResolverEndpoint {
  id: string;
  name: string;
  direction: "Inbound" | "Outbound";
  vpcId: string;
  ipAddresses: string[];
  status: "Operational" | "Creating" | "Updating";
  securityGroup: string;
}

const SAMPLE_ENDPOINTS: ResolverEndpoint[] = [
  {
    id: "rslv-in-01",
    name: "inbound-hybrid-corp-dns",
    direction: "Inbound",
    vpcId: "vpc-0abc123def456789 (Production VPC)",
    ipAddresses: ["10.0.1.25", "10.0.2.88"],
    status: "Operational",
    securityGroup: "sg-01a2b3c4d5e6 (DNS-Inbound)",
  },
  {
    id: "rslv-out-02",
    name: "outbound-onprem-forwarder",
    direction: "Outbound",
    vpcId: "vpc-0abc123def456789 (Production VPC)",
    ipAddresses: ["10.0.1.42", "10.0.2.99"],
    status: "Operational",
    securityGroup: "sg-07f8e9d0c1b2 (DNS-Outbound)",
  },
];

export default function ResolverPage() {
  const [endpoints, setEndpoints] = useState<ResolverEndpoint[]>(SAMPLE_ENDPOINTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"endpoints" | "rules">("endpoints");
  const [search, setSearch] = useState("");

  const filtered = endpoints.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.vpcId.toLowerCase().includes(search.toLowerCase()) ||
      e.direction.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <Breadcrumbs items={[{ label: "Resolver" }]} />

      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded shadow-sm">
        {/* Header & Tabs */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                Route 53 Resolver
                <span className="text-sm font-normal text-gray-500">({endpoints.length} endpoints)</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Route 53 Resolver provides recursive DNS lookups for Amazon VPC and enables hybrid DNS routing between AWS and on-premises networks.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEndpoints(SAMPLE_ENDPOINTS)}
                title="Reset / refresh examples"
                className="p-2"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const newEndpoint: ResolverEndpoint = {
                    id: `rslv-${Date.now()}`,
                    name: `endpoint-resolver-${Math.floor(Math.random() * 100)}`,
                    direction: "Inbound",
                    vpcId: "vpc-0abc123def456789",
                    ipAddresses: ["10.0.3.15", "10.0.4.15"],
                    status: "Operational",
                    securityGroup: "sg-default",
                  };
                  setEndpoints([newEndpoint, ...endpoints]);
                }}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Configure endpoints
              </Button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center space-x-6 border-b border-gray-200 dark:border-gray-800 pt-1">
            <button
              onClick={() => setActiveTab("endpoints")}
              className={`pb-2 text-sm font-bold border-b-2 transition-colors ${
                activeTab === "endpoints"
                  ? "border-aws-orange text-aws-orange"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              VPC Endpoints ({endpoints.length})
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              className={`pb-2 text-sm font-bold border-b-2 transition-colors ${
                activeTab === "rules"
                  ? "border-aws-orange text-aws-orange"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Resolver Rules (2)
            </button>
          </div>
        </div>

        {activeTab === "endpoints" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-aws-tableHeader dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider font-bold">
                  <th className="py-3 px-3 w-10 text-center">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="py-3 px-4">Endpoint name</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">VPC</th>
                  <th className="py-3 px-4">IP addresses</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Security group</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filtered.map((ep) => {
                  const isSelected = selectedId === ep.id;
                  return (
                    <tr
                      key={ep.id}
                      onClick={() => setSelectedId(isSelected ? null : ep.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50/70 dark:bg-blue-950/40"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="radio"
                          name="selectedEndpoint"
                          checked={isSelected}
                          onChange={() => setSelectedId(ep.id)}
                          className="w-4 h-4 text-aws-blue focus:ring-aws-blue cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-semibold text-aws-blue hover:underline">
                        {ep.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-medium">
                          {ep.direction === "Inbound" ? (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-purple-600" />
                          )}
                          {ep.direction}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {ep.vpcId}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-800 dark:text-gray-200">
                        {ep.ipAddresses.join(", ")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border border-green-300 dark:border-green-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          {ep.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                        {ep.securityGroup}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-aws-tableHeader dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Rule name</th>
                  <th className="py-3 px-4">Rule type</th>
                  <th className="py-3 px-4">Domain name</th>
                  <th className="py-3 px-4">Target IP addresses (On-Premises DNS)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                <tr>
                  <td className="py-3 px-4 font-semibold text-aws-blue">forward-corp-datacenter</td>
                  <td className="py-3 px-4"><Badge variant="blue" size="sm">Forward</Badge></td>
                  <td className="py-3 px-4 font-mono font-semibold">corp.internal.local.</td>
                  <td className="py-3 px-4 font-mono">10.100.0.10, 10.100.0.11</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      Complete
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-aws-blue">forward-onprem-dc2</td>
                  <td className="py-3 px-4"><Badge variant="blue" size="sm">Forward</Badge></td>
                  <td className="py-3 px-4 font-mono font-semibold">onprem.legacy.net.</td>
                  <td className="py-3 px-4 font-mono">192.168.10.5, 192.168.10.6</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      Complete
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
          <span>Route 53 Resolver is active and managing hybrid DNS routes.</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
