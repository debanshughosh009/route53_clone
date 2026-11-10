"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { RecordTable } from "@/components/records/RecordTable";
import { CreateRecordModal } from "@/components/records/CreateRecordModal";
import { EditRecordModal } from "@/components/records/EditRecordModal";
import { DeleteRecordModal } from "@/components/records/DeleteRecordModal";
import { BulkDeleteModal } from "@/components/records/BulkDeleteModal";
import { ExportModal } from "@/components/records/ExportModal";
import { ImportModal } from "@/components/records/ImportModal";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getHostedZone, getRecords } from "@/lib/api";
import { HostedZone, DNSRecord } from "@/types";
import { ArrowLeft, Server, Copy, Check } from "lucide-react";

export default function HostedZoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = params.id as string;

  const [zone, setZone] = useState<HostedZone | null>(null);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [activeRecord, setActiveRecord] = useState<DNSRecord | null>(null);
  const [selectedIdsForBulk, setSelectedIdsForBulk] = useState<string[]>([]);
  const [copiedNs, setCopiedNs] = useState(false);

  // Notification Banner
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    title?: string;
    message: string;
  } | null>(null);

  // Fetch Zone Metadata
  const fetchZone = useCallback(async () => {
    try {
      const res = await getHostedZone(zoneId);
      setZone(res);
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Failed to load hosted zone",
        message: err.message || "Could not load zone details.",
      });
    }
  }, [zoneId]);

  // Fetch Records
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRecords(zoneId, {
        search,
        type: typeFilter,
        limit: 100,
      });
      setRecords(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Failed to load records",
        message: err.message || "Could not retrieve records for this hosted zone.",
      });
    } finally {
      setLoading(false);
    }
  }, [zoneId, search, typeFilter]);

  useEffect(() => {
    fetchZone();
    fetchRecords();
  }, [fetchZone, fetchRecords]);

  // Extract NS records to show in summary
  const nsRecord = records.find((r) => r.type === "NS" && r.is_system);

  const copyNameservers = () => {
    if (nsRecord) {
      navigator.clipboard.writeText(nsRecord.values.join("\n"));
      setCopiedNs(true);
      setTimeout(() => setCopiedNs(false), 2000);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: "Hosted zones", href: "/hosted-zones" },
          { label: zone?.name || zoneId },
        ]}
      />

      {/* Notification Banner */}
      {notification && (
        <Alert
          type={notification.type}
          title={notification.title}
          onDismiss={() => setNotification(null)}
        >
          {notification.message}
        </Alert>
      )}

      {/* Hosted Zone Summary Header Card */}
      {zone && (
        <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800 gap-3">
            <div className="flex items-center gap-2">
              <Link
                href="/hosted-zones"
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Back to hosted zones"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {zone.name}
                  <Badge variant={zone.type === "Public" ? "green" : "blue"} size="sm">
                    {zone.type}
                  </Badge>
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Hosted zone ID: <span className="font-mono text-gray-700 dark:text-gray-300">{zone.id}</span>
                  {zone.comment && <span> &bull; {zone.comment}</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setExportModalOpen(true)}
              >
                Export records
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setImportModalOpen(true)}
              >
                Import zone file
              </Button>
            </div>
          </div>

          {/* Nameservers banner */}
          {nsRecord && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between text-xs gap-2">
              <div className="flex items-start gap-2">
                <Server className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-gray-800 dark:text-gray-200 block mb-0.5">
                    Route 53 Name Servers (Set these at your domain registrar):
                  </span>
                  <div className="font-mono text-gray-600 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                    {nsRecord.values.map((ns, idx) => (
                      <span key={idx}>{ns}</span>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={copyNameservers}
                className="self-start md:self-center flex items-center gap-1.5"
              >
                {copiedNs ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedNs ? "Copied" : "Copy Name Servers"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Primary Records Table */}
      <RecordTable
        records={records}
        total={total}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        onRefresh={() => {
          fetchZone();
          fetchRecords();
        }}
        onCreateClick={() => setCreateModalOpen(true)}
        onEditClick={(rec) => {
          setActiveRecord(rec);
          setEditModalOpen(true);
        }}
        onDeleteClick={(rec) => {
          setActiveRecord(rec);
          setDeleteModalOpen(true);
        }}
        onBulkDeleteClick={(ids) => {
          setSelectedIdsForBulk(ids);
          setBulkDeleteModalOpen(true);
        }}
        onExportClick={() => setExportModalOpen(true)}
        onImportClick={() => setImportModalOpen(true)}
      />

      {/* Modals */}
      {zone && (
        <>
          <CreateRecordModal
            isOpen={createModalOpen}
            zoneId={zone.id}
            zoneName={zone.name}
            onClose={() => setCreateModalOpen(false)}
            onSuccess={(rec) => {
              setNotification({
                type: "success",
                title: "Record created",
                message: `Successfully created ${rec.type} record for ${rec.name}.`,
              });
              fetchZone();
              fetchRecords();
            }}
          />

          <EditRecordModal
            isOpen={editModalOpen}
            zoneId={zone.id}
            record={activeRecord}
            onClose={() => {
              setEditModalOpen(false);
              setActiveRecord(null);
            }}
            onSuccess={(rec) => {
              setNotification({
                type: "success",
                title: "Record updated",
                message: `Successfully updated ${rec.type} record for ${rec.name}.`,
              });
              fetchRecords();
            }}
          />

          <DeleteRecordModal
            isOpen={deleteModalOpen}
            zoneId={zone.id}
            record={activeRecord}
            onClose={() => {
              setDeleteModalOpen(false);
              setActiveRecord(null);
            }}
            onSuccess={(delId) => {
              setNotification({
                type: "success",
                title: "Record deleted",
                message: `Record ${activeRecord?.name} was deleted successfully.`,
              });
              fetchZone();
              fetchRecords();
            }}
          />

          <BulkDeleteModal
            isOpen={bulkDeleteModalOpen}
            zoneId={zone.id}
            selectedIds={selectedIdsForBulk}
            onClose={() => setBulkDeleteModalOpen(false)}
            onSuccess={(deletedCount) => {
              setNotification({
                type: "success",
                title: "Records deleted",
                message: `Successfully deleted ${deletedCount} records.`,
              });
              fetchZone();
              fetchRecords();
            }}
          />

          <ExportModal
            isOpen={exportModalOpen}
            zoneId={zone.id}
            zoneName={zone.name}
            onClose={() => setExportModalOpen(false)}
          />

          <ImportModal
            isOpen={importModalOpen}
            zoneId={zone.id}
            zoneName={zone.name}
            onClose={() => setImportModalOpen(false)}
            onSuccess={() => {
              setNotification({
                type: "success",
                title: "Zone imported",
                message: "DNS records were imported from zone file.",
              });
              fetchZone();
              fetchRecords();
            }}
          />
        </>
      )}
    </div>
  );
}
