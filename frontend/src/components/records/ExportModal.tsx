"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { getExportUrl } from "@/lib/api";
import { Download, FileJson, FileText } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  zoneId: string;
  zoneName: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  zoneId,
  zoneName,
  onClose,
}) => {
  const [format, setFormat] = useState<"json" | "bind">("bind");

  const handleDownload = () => {
    const url = getExportUrl(zoneId, format);
    window.open(url, "_blank");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export DNS records"
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDownload} className="flex items-center gap-1.5">
            <Download className="w-4 h-4" />
            Download export
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Export all DNS records from hosted zone <strong>{zoneName}</strong> ({zoneId}).
        </p>

        <div className="space-y-2">
          {/* BIND Format */}
          <label className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded border border-gray-300 dark:border-gray-700 cursor-pointer">
            <input
              type="radio"
              name="exportFormat"
              checked={format === "bind"}
              onChange={() => setFormat("bind")}
              className="mt-1 text-aws-blue"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100 text-xs">
                <FileText className="w-4 h-4 text-gray-500" />
                BIND Zone File (.zone / RFC 1035)
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Standard zone file format compatible with BIND, PowerDNS, Unbound, and other Route 53 accounts.
              </p>
            </div>
          </label>

          {/* JSON Format */}
          <label className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded border border-gray-300 dark:border-gray-700 cursor-pointer">
            <input
              type="radio"
              name="exportFormat"
              checked={format === "json"}
              onChange={() => setFormat("json")}
              className="mt-1 text-aws-blue"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100 text-xs">
                <FileJson className="w-4 h-4 text-gray-500" />
                JSON Format
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Structured JSON object containing hosted zone metadata and all record arrays.
              </p>
            </div>
          </label>
        </div>
      </div>
    </Modal>
  );
};
