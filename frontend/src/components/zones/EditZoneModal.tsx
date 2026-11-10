"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { updateHostedZone } from "@/lib/api";
import { HostedZone } from "@/types";

interface EditZoneModalProps {
  isOpen: boolean;
  zone: HostedZone | null;
  onClose: () => void;
  onSuccess: (updated: HostedZone) => void;
}

export const EditZoneModal: React.FC<EditZoneModalProps> = ({
  isOpen,
  zone,
  onClose,
  onSuccess,
}) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (zone) {
      setComment(zone.comment || "");
    }
  }, [zone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zone) return;
    setError(null);

    try {
      setLoading(true);
      const updated = await updateHostedZone(zone.id, { comment: comment.trim() });
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update hosted zone");
    } finally {
      setLoading(false);
    }
  };

  if (!zone) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit details: ${zone.name}`}
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={loading}>
            Save changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-500 rounded text-red-700 dark:text-red-300 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Hosted Zone ID
          </label>
          <p className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
            {zone.id}
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Domain name
          </label>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {zone.name}
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-aws-blue focus:border-aws-blue"
            rows={3}
            placeholder="Description or comment"
          />
        </div>
      </form>
    </Modal>
  );
};
