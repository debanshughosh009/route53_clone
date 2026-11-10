"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { createRecord } from "@/lib/api";
import { DNSRecord, RecordType } from "@/types";

interface CreateRecordModalProps {
  isOpen: boolean;
  zoneId: string;
  zoneName: string;
  onClose: () => void;
  onSuccess: (record: DNSRecord) => void;
}

const RECORD_TYPES: { label: string; value: RecordType; placeholder: string }[] = [
  { label: "A - Routes traffic to an IPv4 address and some AWS resources", value: "A", placeholder: "192.0.2.235\n198.51.100.1" },
  { label: "AAAA - Routes traffic to an IPv6 address and some AWS resources", value: "AAAA", placeholder: "2001:0db8:85a3:0000:0000:8a2e:0370:7334" },
  { label: "CNAME - Routes traffic to another domain name", value: "CNAME", placeholder: "example.com" },
  { label: "TXT - Used to verify domain ownership and for email security", value: "TXT", placeholder: "\"v=spf1 include:_spf.google.com ~all\"" },
  { label: "MX - Specifies mail servers", value: "MX", placeholder: "10 mail.example.com\n20 backupmail.example.com" },
  { label: "NS - Name servers for a hosted zone or delegation set", value: "NS", placeholder: "ns-1.example.com\nns-2.example.com" },
  { label: "PTR - Maps an IP address to a domain name", value: "PTR", placeholder: "hostname.example.com" },
  { label: "SRV - Identifies services such as SIP or XMPP", value: "SRV", placeholder: "10 60 5060 bigbox.example.com" },
  { label: "CAA - Specifies which certificate authorities are allowed to issue certificates", value: "CAA", placeholder: "0 issue \"letsencrypt.org\"" },
];

export const CreateRecordModal: React.FC<CreateRecordModalProps> = ({
  isOpen,
  zoneId,
  zoneName,
  onClose,
  onSuccess,
}) => {
  const [subdomain, setSubdomain] = useState("");
  const [type, setType] = useState<RecordType>("A");
  const [ttl, setTtl] = useState(300);
  const [valuesText, setValuesText] = useState("");
  const [routingPolicy, setRoutingPolicy] = useState("Simple");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentTypeConfig = RECORD_TYPES.find((t) => t.value === type) || RECORD_TYPES[0];

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

    // Construct full record name
    const normalizedZone = zoneName.endsWith(".") ? zoneName : `${zoneName}.`;
    const recordName = subdomain.trim()
      ? `${subdomain.trim()}.${normalizedZone}`
      : normalizedZone;

    try {
      setLoading(true);
      const newRec = await createRecord(zoneId, {
        name: recordName,
        type,
        ttl: Number(ttl),
        values,
        routing_policy: routingPolicy,
      });
      onSuccess(newRec);
      onClose();
      // Reset
      setSubdomain("");
      setType("A");
      setTtl(300);
      setValuesText("");
    } catch (err: any) {
      setError(err.message || "Failed to create record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create record"
      maxWidth="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={loading}>
            Create records
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

        {/* Record name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Record name
          </label>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="e.g. www, api, or leave blank for apex"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-r-0 border-gray-400 dark:border-gray-600 rounded-l text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-aws-blue focus:border-aws-blue"
            />
            <span className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-400 dark:border-gray-600 rounded-r text-gray-600 dark:text-gray-300 font-mono">
              .{zoneName}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Leave blank to create a record for the root domain (<code>{zoneName}</code>).
          </p>
        </div>

        {/* Record type */}
        <Select
          label="Record type"
          value={type}
          onChange={(e) => setType(e.target.value as RecordType)}
          options={RECORD_TYPES.map((t) => ({ label: t.label, value: t.value }))}
        />

        {/* Value textarea */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Value / Route traffic to
            </label>
            <span className="text-[11px] text-gray-400">One per line</span>
          </div>
          <textarea
            rows={4}
            value={valuesText}
            onChange={(e) => setValuesText(e.target.value)}
            placeholder={currentTypeConfig.placeholder}
            className="w-full px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-aws-blue focus:border-aws-blue"
            required
          />
        </div>

        {/* TTL (Seconds) */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            TTL (Seconds)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={2147483647}
              value={ttl}
              onChange={(e) => setTtl(Number(e.target.value))}
              className="w-32 px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-aws-blue focus:border-aws-blue"
            />
            {/* Presets */}
            <div className="flex items-center gap-1">
              {[
                { label: "60s (1m)", val: 60 },
                { label: "300s (5m)", val: 300 },
                { label: "3600s (1h)", val: 3600 },
                { label: "86400s (1d)", val: 86400 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setTtl(preset.val)}
                  className={`px-2 py-1 text-[11px] rounded border ${
                    ttl === preset.val
                      ? "bg-blue-50 dark:bg-blue-950 border-aws-blue text-aws-blue font-bold"
                      : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Routing policy */}
        <Select
          label="Routing policy"
          value={routingPolicy}
          onChange={(e) => setRoutingPolicy(e.target.value)}
          options={[
            { label: "Simple routing - routes traffic to a single resource", value: "Simple" },
            { label: "Weighted routing - routes traffic based on proportions", value: "Weighted" },
            { label: "Latency routing - routes traffic to region with lowest latency", value: "Latency" },
            { label: "Failover routing - routes traffic to active/passive resources", value: "Failover" },
          ]}
        />
      </form>
    </Modal>
  );
};
