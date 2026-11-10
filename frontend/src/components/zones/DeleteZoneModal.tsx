"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { deleteHostedZone } from "@/lib/api";
import { HostedZone } from "@/types";
import { AlertTriangle } from "lucide-react";

interface DeleteZoneModalProps {
  isOpen: boolean;
  zone: HostedZone | null;
  onClose: () => void;
  onSuccess: (deletedZoneId: string) => void;
}

export const DeleteZoneModal: React.FC<DeleteZoneModalProps> = ({
  isOpen,
  zone,
  onClose,
  onSuccess,
}) => {
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!zone) return null;

  const handleDelete = async () => {
    setError(null);
    try {
      setLoading(true);
      await deleteHostedZone(zone.id);
      onSuccess(zone.id);
      onClose();
      setConfirmInput("");
    } catch (err: any) {
      setError(err.message || "Failed to delete hosted zone");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete hosted zone"
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={loading}
            disabled={confirmInput.trim().toLowerCase() !== "delete"}
          >
            Delete
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-500 rounded text-red-700 dark:text-red-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-950/30 border-l-4 border-red-600 rounded-r text-red-900 dark:text-red-200 text-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Permanently delete hosted zone?</p>
            <p className="mt-1">
              Are you sure you want to delete the hosted zone <strong>{zone.name}</strong> ({zone.id})?
              All {zone.record_count} associated DNS records will be permanently removed. This action cannot be undone.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            To confirm deletion, type <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-red-600 font-mono">delete</code> in the field below:
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="delete"
            className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>
    </Modal>
  );
};
