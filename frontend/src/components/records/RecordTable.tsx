"use client";

import React, { useState } from "react";
import { DNSRecord, RecordType } from "@/types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import Table, { TableProps } from "@cloudscape-design/components/table";
import {
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

  const columns: TableProps.ColumnDefinition<DNSRecord>[] = [
    { id: "name", header: "Record name", cell: (record) => <span>{record.name}{record.is_system && <Lock size={14} className="inline ml-1 text-gray-400" aria-label="System managed" />}</span> },
    { id: "type", header: "Type", cell: (record) => <Badge variant={getTypeBadgeVariant(record.type)}>{record.type}</Badge> },
    { id: "policy", header: "Routing policy", cell: (record) => record.routing_policy || "Simple" },
    { id: "values", header: "Value / Route traffic to", cell: (record) => <div className="font-mono">{record.values.map((value, index) => <div key={index}>{value}</div>)}</div> },
    { id: "ttl", header: "TTL (Seconds)", cell: (record) => record.ttl },
  ];

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
          <div className="flex-1 max-w-lg"><Input value={search} placeholder="Find records by name or value" onChange={({ detail }) => onSearchChange(detail.value)} /></div>

          {/* Type filter */}
          <div className="w-52"><Select value={typeFilter} onChange={({ detail }) => onTypeFilterChange(detail.selectedOption?.value ?? "")} options={[{ label: "All record types", value: "" }, ...["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA", "SOA"].map((type) => ({ label: type, value: type }))]} /></div>
        </div>
      </div>

      <Table
        variant="embedded"
        items={records}
        columnDefinitions={columns}
        loading={loading}
        loadingText="Loading DNS records"
        selectionType="multi"
        selectedItems={selectedRecords}
        onSelectionChange={({ detail }) => setSelectedIds(detail.selectedItems.map((record) => record.id))}
        empty={<div className="p-8 text-center"><p className="font-semibold">No records found</p><p className="text-sm text-gray-500">{search || typeFilter ? "No records match your filter criteria." : "Create your first record set for this domain."}</p>{!search && !typeFilter && <div className="mt-4"><Button variant="primary" onClick={onCreateClick}>Create record</Button></div>}</div>}
      />

      {/* Pagination Footer */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing 1-{records.length} of {total} records
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
  );
};
