"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HostedZone } from "@/types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Search, RefreshCw, Copy, Check } from "lucide-react";
import Table, { TableProps } from "@cloudscape-design/components/table";

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
  const columns: TableProps.ColumnDefinition<HostedZone>[] = [
    { id: "name", header: "Hosted zone name", cell: (zone) => <Link href={`/hosted-zones/${zone.id}`}>{zone.name}</Link> },
    { id: "type", header: "Type", cell: (zone) => <Badge variant={zone.type === "Public" ? "green" : "blue"}>{zone.type}</Badge> },
    { id: "records", header: "Record count", cell: (zone) => zone.record_count },
    { id: "id", header: "Hosted zone ID", cell: (zone) => <span className="font-mono">{zone.id} <Button variant="link" onClick={() => handleCopy(zone.id)} aria-label="Copy hosted zone ID">{copiedId === zone.id ? <Check size={14} /> : <Copy size={14} />}</Button></span> },
    { id: "description", header: "Description", cell: (zone) => zone.comment || "-" },
  ];

  const handleCopy = (id: string) => {
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
        <Table
          variant="embedded"
          items={zones}
          columnDefinitions={columns}
          loading={loading}
          loadingText="Loading hosted zones"
          selectionType="single"
          selectedItems={selectedZone ? [selectedZone] : []}
          onSelectionChange={({ detail }) => setSelectedZoneId(detail.selectedItems[0]?.id ?? null)}
          empty={<div className="p-8 text-center"><p className="font-semibold">No hosted zones found</p><p className="text-sm text-gray-500">{search ? "No results match your search filter." : "Create your first hosted zone to get started."}</p>{!search && <div className="mt-4"><Button variant="primary" onClick={onCreateClick}>Create hosted zone</Button></div>}</div>}
        />

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
