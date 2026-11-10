"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { updateRecord } from "@/lib/api";
import { DNSRecord } from "@/types";

interface EditRecordModalProps {
  isOpen: boolean;
  zoneId: string;
  record: DNSRecord | null;
  onClose: () => void;
  onSuccess: (updated: DNSRecord) => void;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  isOpen,
  zoneId,
  record,
  onClose,
  onSuccess,
}) => {
  const [ttl, setTtl] = useState(300);
  const [valuesText, setValuesText] = useState("");
  const [routingPolicy, setRoutingPolicy] = useState("Simple");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      setTtl(record.ttl);
      setValuesText((record.values || []).join("\n"));
      setRoutingPolicy(record.routing_policy || "Simple");
    }
  }, [record]);

  if (!record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const values = valuesText
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);

    if (values.length === 0) {
      setError("Please provide at least one record value.");
      return;
    }

    try {
      setLoading(true);
      const updated = await updateRecord(zoneId, record.id, {
        ttl: Number(ttl),
        values,
        routing_policy: routingPolicy,
      });
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit record: ${record.name}`}
      maxWidth="lg"
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

        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 text-xs">
          <div>
            <span className="text-gray-500 block">Record name</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{record.name}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Type</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{record.type}</span>
          </div>
        </div>

        {/* Value textarea */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Value / Route traffic to (One per line)
          </label>
          <textarea
            rows={4}
            value={valuesText}
            onChange={(e) => setValuesText(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-aws-blue focus:border-aws-blue"
            required
          />
        </div>

        {/* TTL */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            TTL (Seconds)
          </label>
          <input
            type="number"
            min={0}
            value={ttl}
            onChange={(e) => setTtl(Number(e.target.value))}
            className="w-32 px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-aws-blue focus:border-aws-blue"
          />
        </div>

        {/* Routing Policy */}
        <Select
          label="Routing policy"
          value={routingPolicy}
          onChange={(e) => setRoutingPolicy(e.target.value)}
          options={[
            { label: "Simple", value: "Simple" },
            { label: "Weighted", value: "Weighted" },
            { label: "Latency", value: "Latency" },
            { label: "Failover", value: "Failover" },
          ]}
        />
      </form>
    </Modal>
  );
};
