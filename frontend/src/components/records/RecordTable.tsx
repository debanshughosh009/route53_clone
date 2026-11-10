"use client";

import React, { useState } from "react";
import { DNSRecord, RecordType } from "@/types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import {
  Search,
  RefreshCw,
  Download,
  Upload,
  Lock,
  Edit2,
  Trash2,
  ChevronDown,
} from "lucide-react";

interface RecordTableProps {
  records: DNSRecord[];
  total: number;
  loading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  typeFilter: string;
  onTypeFilterChange: (val: string) => void;
  onRefresh: () => void;
  onCreateClick: () => void;
  onEditClick: (record: DNSRecord) => void;
  onDeleteClick: (record: DNSRecord) => void;
  onBulkDeleteClick: (selectedIds: string[]) => void;
  onExportClick: () => void;
  onImportClick: () => void;
}

export const RecordTable: React.FC<RecordTableProps> = ({
  records,
  total,
  loading,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onRefresh,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onBulkDeleteClick,
  onExportClick,
  onImportClick,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map((r) => r.id));
    }
  };

  const toggleSelectRecord = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedRecords = records.filter((r) => selectedIds.includes(r.id));
  const canEdit = selectedRecords.length === 1 && !selectedRecords[0].is_system;
  const canDelete = selectedRecords.length > 0;

  const getTypeBadgeVariant = (type: string): "green" | "blue" | "yellow" | "grey" => {
    switch (type) {
      case "A":
      case "AAAA":
        return "blue";
      case "CNAME":
        return "green";
      case "TXT":
        return "yellow";
      default:
        return "grey";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded shadow-sm">
      {/* Top Header & Actions Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              Records
              <span className="text-xs font-normal text-gray-500">({total})</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Each record specifies how you want to route traffic for a specific domain name or subdomain.
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              title="Refresh records"
              className="p-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onExportClick}
              className="flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onImportClick}
              className="flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Import zone file
            </Button>

            <Button
              variant="secondary"
              size="sm"
              disabled={!canEdit}
              onClick={() => canEdit && onEditClick(selectedRecords[0])}
            >
              Edit record
            </Button>

            <Button
              variant="secondary"
              size="sm"
              disabled={!canDelete}
              onClick={() => {
                if (selectedRecords.length === 1) {
                  onDeleteClick(selectedRecords[0]);
                } else if (selectedRecords.length > 1) {
                  onBulkDeleteClick(selectedIds);
                }
              }}
              className="text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Delete {selectedIds.length > 1 ? `(${selectedIds.length})` : ""}
            </Button>

            <Button variant="primary" size="sm" onClick={onCreateClick}>
              Create record
            </Button>
          </div>
        </div>

        {/* Filter Bar: Search + Type Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
          {/* Search by record name or value */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Find records by name or value"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-aws-blue focus:border-aws-blue focus:bg-white"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-2 text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Type filter */}
          <div className="w-44">
            <select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-aws-blue focus:border-aws-blue"
            >
              <option value="">All record types</option>
              {["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA", "SOA"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-aws-tableHeader dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 uppercase tracking-wider font-semibold">
              <th className="py-2.5 px-3 w-8 text-center">
                <input
                  type="checkbox"
                  checked={records.length > 0 && selectedIds.length === records.length}
                  onChange={toggleSelectAll}
                  className="rounded text-aws-blue focus:ring-aws-blue cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-4">Record name</th>
              <th className="py-2.5 px-4">Type</th>
              <th className="py-2.5 px-4">Routing policy</th>
              <th className="py-2.5 px-4">Value / Route traffic to</th>
              <th className="py-2.5 px-4 text-right">TTL (Seconds)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading && records.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Loading DNS records...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    No records found
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {search || typeFilter
                      ? "No records match your filter criteria."
                      : "Create your first record set for this domain."}
                  </p>
                  {!search && !typeFilter && (
                    <Button variant="primary" size="sm" onClick={onCreateClick} className="mt-3">
                      Create record
                    </Button>
                  )}
                </td>
              </tr>
            ) : (
              records.map((record) => {
                const isSelected = selectedIds.includes(record.id);
                return (
                  <tr
                    key={record.id}
                    onClick={() => toggleSelectRecord(record.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/40"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRecord(record.id)}
                        className="rounded text-aws-blue focus:ring-aws-blue cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <span>{record.name}</span>
                      {record.is_system && (
                        <span title="System-managed default record">
                          <Lock className="w-3 h-3 text-gray-400" />
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge variant={getTypeBadgeVariant(record.type)} size="sm">
                        {record.type}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-gray-600 dark:text-gray-400">
                      {record.routing_policy || "Simple"}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-gray-700 dark:text-gray-300 max-w-md">
                      <div className="space-y-0.5">
                        {record.values.map((val, idx) => (
                          <div key={idx} className="truncate">
                            {val}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-gray-700 dark:text-gray-300">
                      {record.ttl}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing 1-{records.length} of {total} records
        </span>
        <div className="flex items-center gap-1">
          <Button variant="secondary" size="sm" disabled>
            Previous
          </Button>
          <Button variant="secondary" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
