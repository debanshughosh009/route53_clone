"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { createHostedZone } from "@/lib/api";
import { HostedZone } from "@/types";

interface CreateZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (zone: HostedZone) => void;
}

export const CreateZoneModal: React.FC<CreateZoneModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [type, setType] = useState<"Public" | "Private">("Public");
  const [vpcId, setVpcId] = useState("");
  const [vpcRegion, setVpcRegion] = useState("us-east-1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Domain name is required.");
      return;
    }

    try {
      setLoading(true);
      const zone = await createHostedZone({
        name: name.trim(),
        comment: comment.trim(),
        type,
        vpc_id: type === "Private" ? vpcId.trim() : undefined,
        vpc_region: type === "Private" ? vpcRegion : undefined,
      });
      onSuccess(zone);
      onClose();
      // Reset form
      setName("");
      setComment("");
      setType("Public");
      setVpcId("");
    } catch (err: any) {
      setError(err.message || "Failed to create hosted zone");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create hosted zone"
      maxWidth="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={loading}>
            Create hosted zone
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

        {/* Domain name */}
        <Input
          label="Domain name"
          placeholder="example.com"
          value={name}
          onChange={(e) => setName(e.target.value)}
          helperText="Enter a fully qualified domain name, such as example.com."
          required
        />

        {/* Description / Comment */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Description - optional
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter an optional comment or description"
            className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-aws-blue focus:border-aws-blue transition-colors"
            rows={2}
          />
        </div>

        {/* Type: Public vs Private */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <div className="space-y-2">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="radio"
                name="zoneType"
                checked={type === "Public"}
                onChange={() => setType("Public")}
                className="mt-0.5 text-aws-blue focus:ring-aws-blue"
              />
              <div>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 block">
                  Public hosted zone
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Routes traffic on the internet.
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="radio"
                name="zoneType"
                checked={type === "Private"}
                onChange={() => setType("Private")}
                className="mt-0.5 text-aws-blue focus:ring-aws-blue"
              />
              <div>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 block">
                  Private hosted zone for Amazon VPC
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Routes traffic within one or more VPCs.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* VPC options if private */}
        {type === "Private" && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 space-y-3">
            <Input
              label="VPC ID"
              placeholder="vpc-0a1b2c3d4e5f6g7h8"
              value={vpcId}
              onChange={(e) => setVpcId(e.target.value)}
              helperText="The VPC to associate with this private hosted zone."
              required
            />
            <Input
              label="VPC Region"
              placeholder="us-east-1"
              value={vpcRegion}
              onChange={(e) => setVpcRegion(e.target.value)}
            />
          </div>
        )}
      </form>
    </Modal>
  );
};
