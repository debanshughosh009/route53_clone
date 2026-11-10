"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { deleteRecord } from "@/lib/api";
import { DNSRecord } from "@/types";
import { AlertTriangle } from "lucide-react";

interface DeleteRecordModalProps {
  isOpen: boolean;
  zoneId: string;
  record: DNSRecord | null;
  onClose: () => void;
  onSuccess: (deletedRecordId: string) => void;
}

export const DeleteRecordModal: React.FC<DeleteRecordModalProps> = ({
  isOpen,
  zoneId,
  record,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!record) return null;

  const handleDelete = async () => {
    setError(null);
    try {
      setLoading(true);
      await deleteRecord(zoneId, record.id);
      onSuccess(record.id);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete record"
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={loading}>
            Delete
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
            <p className="font-bold">Permanently delete record set?</p>
            <p className="mt-1">
              Are you sure you want to delete the record <strong>{record.name}</strong> ({record.type})?
              DNS queries for this record will no longer be resolved.
            </p>
          </div>
        </div>

        {record.is_system && (
          <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold">
            Warning: This is a system-managed NS or SOA record. Deleting it is restricted by Route 53.
          </p>
        )}
      </div>
    </Modal>
  );
};
