"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { importBindFile } from "@/lib/api";
import { Upload, FileUp, CheckCircle, AlertCircle } from "lucide-react";

interface ImportModalProps {
  isOpen: boolean;
  zoneId: string;
  zoneName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  zoneId,
  zoneName,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setError(null);
    try {
      setLoading(true);
      const res = await importBindFile(zoneId, file);
      setResult(res);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to import zone file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import DNS records from BIND zone file"
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button
              variant="primary"
              onClick={handleImport}
              isLoading={loading}
              disabled={!file}
              className="flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              Import records
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Upload a RFC 1035 standard BIND zone file to import DNS records into <strong>{zoneName}</strong>.
        </p>

        {error && (
          <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-500 rounded text-red-700 dark:text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* File Dropzone */}
        {!result && (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-aws-blue transition-colors bg-gray-50 dark:bg-gray-800/40">
            <FileUp className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {file ? file.name : "Select a .txt or .zone file to import"}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">Maximum file size: 5MB</p>
            <label className="mt-3 inline-block">
              <span className="cursor-pointer px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 hover:bg-gray-100 shadow-sm inline-block">
                Choose file
              </span>
              <input
                type="file"
                accept=".txt,.zone,.bind"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Results Report */}
        {result && (
          <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-500 rounded text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-green-900 dark:text-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Import completed successfully!
            </div>
            <div className="text-gray-700 dark:text-gray-300 space-y-1 pl-6">
              <p>Records imported: <strong>{result.imported}</strong></p>
              <p>Duplicate / skipped: <strong>{result.skipped}</strong></p>
              {result.errors.length > 0 && (
                <div className="mt-2 text-amber-700 dark:text-amber-300">
                  <p className="font-semibold">Notices / unparsed lines:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 font-mono text-[11px]">
                    {result.errors.slice(0, 5).map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
