"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HostedZone } from "@/types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Search, RefreshCw, Copy, Check, ExternalLink, SlidersHorizontal, Info } from "lucide-react";

interface ZoneTableProps {
  zones: HostedZone[];
  total: number;
  loading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  onRefresh: () => void;
  onCreateClick: () => void;
  onEditClick: (zone: HostedZone) => void;
  onDeleteClick: (zone: HostedZone) => void;
}

export const ZoneTable: React.FC<ZoneTableProps> = ({
  zones,
  total,
  loading,
  search,
  onSearchChange,
  onRefresh,
  onCreateClick,
  onEditClick,
  onDeleteClick,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "tags">("details");

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || null;

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Table Container Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded shadow-sm">
        {/* Table Top Header & Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                Hosted zones
                <span className="text-xs font-normal text-gray-500">({total})</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                A hosted zone is a container for records that define how you want to route traffic for a domain.
              </p>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex items-center flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onRefresh}
                title="Refresh table"
                className="p-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={!selectedZone}
                onClick={() => selectedZone && onEditClick(selectedZone)}
              >
                Edit details
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={!selectedZone}
                onClick={() => selectedZone && onDeleteClick(selectedZone)}
                className="text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Delete
              </Button>

              {selectedZone ? (
                <Link href={`/hosted-zones/${selectedZone.id}`}>
                  <Button variant="secondary" size="sm" className="text-aws-blue">
                    View records
                  </Button>
                </Link>
              ) : null}

              <Button variant="primary" size="sm" onClick={onCreateClick}>
                Create hosted zone
              </Button>
            </div>
          </div>

          {/* Search Filter Bar */}
          <div className="flex items-center gap-3 pt-2">
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Find hosted zones by name, ID, or description"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-aws-blue focus:border-aws-blue focus:bg-white"
              />
              {search && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-aws-tableHeader dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider font-bold">
                <th className="py-3 px-3 w-10 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-3 px-4">Hosted zone name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Record count</th>
                <th className="py-3 px-4">Hosted zone ID</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading && zones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500 text-sm">
                    Loading hosted zones...
                  </td>
                </tr>
              ) : zones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                      No hosted zones found
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {search ? "No results match your search filter." : "Create your first hosted zone to get started."}
                    </p>
                    {!search && (
                      <Button variant="primary" size="md" onClick={onCreateClick} className="mt-4">
                        Create hosted zone
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                zones.map((zone) => {
                  const isSelected = selectedZoneId === zone.id;
                  return (
                    <tr
                      key={zone.id}
                      onClick={() => setSelectedZoneId(isSelected ? null : zone.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50/70 dark:bg-blue-950/40"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="radio"
                          name="selectedZone"
                          checked={isSelected}
                          onChange={() => setSelectedZoneId(zone.id)}
                          className="w-4 h-4 text-aws-blue focus:ring-aws-blue cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-semibold text-aws-blue hover:underline">
                        <Link
                          href={`/hosted-zones/${zone.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5"
                        >
                          {zone.name}
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-70 hover:opacity-100" />
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={zone.type === "Public" ? "green" : "blue"} size="md">
                          {zone.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-gray-800 dark:text-gray-200">
                        {zone.record_count}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <span>{zone.id}</span>
                          <button
                            onClick={(e) => handleCopy(zone.id, e)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
                            title="Copy Zone ID"
                          >
                            {copiedId === zone.id ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 truncate max-w-xs">
                        {zone.comment || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing 1-{zones.length} of {total} hosted zones
          </span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Selected Zone Details Drawer (AWS CloudScape style) */}
      {selectedZone && (
        <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded p-4 shadow-sm animate-in fade-in duration-150">
          {/* Header tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2 mb-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab("details")}
                className={`text-xs font-bold pb-2 border-b-2 transition-colors ${
                  activeTab === "details"
                    ? "border-aws-orange text-aws-orange"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Hosted zone details
              </button>
              <button
                onClick={() => setActiveTab("tags")}
                className={`text-xs font-bold pb-2 border-b-2 transition-colors ${
                  activeTab === "tags"
                    ? "border-aws-orange text-aws-orange"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Tags (0)
              </button>
            </div>
            <Link href={`/hosted-zones/${selectedZone.id}`}>
              <Button variant="secondary" size="sm" className="text-aws-blue">
                Go to records &rarr;
              </Button>
            </Link>
          </div>

          {/* Details Content */}
          {activeTab === "details" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-500 block mb-0.5">Hosted zone name</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedZone.name}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">Hosted zone ID</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {selectedZone.id}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">Type</span>
                <Badge variant={selectedZone.type === "Public" ? "green" : "blue"} size="sm">
                  {selectedZone.type}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">Record count</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedZone.record_count}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">Description</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {selectedZone.comment || "None"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">Created at</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {new Date(selectedZone.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-gray-500">
              No tags applied to this hosted zone.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
