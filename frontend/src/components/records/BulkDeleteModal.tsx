"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { bulkDeleteRecords } from "@/lib/api";
import { AlertTriangle } from "lucide-react";

interface BulkDeleteModalProps {
  isOpen: boolean;
  zoneId: string;
  selectedIds: string[];
  onClose: () => void;
  onSuccess: (deletedCount: number) => void;
}

export const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({
  isOpen,
  zoneId,
  selectedIds,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBulkDelete = async () => {
    setError(null);
    try {
      setLoading(true);
      const res = await bulkDeleteRecords(zoneId, selectedIds);
      onSuccess(res.deleted);
      onClose();
    } catch (err: any) {
      setError(err.message || "Bulk deletion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete multiple records"
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleBulkDelete} isLoading={loading}>
            Delete {selectedIds.length} records
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {error && (
          <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-500 rounded text-red-700 dark:text-red-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-950/30 border-l-4 border-red-600 rounded-r text-red-900 dark:text-red-200 text-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Permanently delete {selectedIds.length} records?</p>
            <p className="mt-1">
              You are about to delete {selectedIds.length} selected record sets. System-managed NS and SOA records will be automatically protected and kept.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
