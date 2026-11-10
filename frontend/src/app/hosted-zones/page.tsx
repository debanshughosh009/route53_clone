"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ZoneTable } from "@/components/zones/ZoneTable";
import { CreateZoneModal } from "@/components/zones/CreateZoneModal";
import { EditZoneModal } from "@/components/zones/EditZoneModal";
import { DeleteZoneModal } from "@/components/zones/DeleteZoneModal";
import { Alert } from "@/components/ui/Alert";
import { getHostedZones } from "@/lib/api";
import { HostedZone } from "@/types";

export default function HostedZonesPage() {
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeZone, setActiveZone] = useState<HostedZone | null>(null);

  // Notification Banner
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    title?: string;
    message: string;
  } | null>(null);

  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getHostedZones({ search, limit: 100 });
      setZones(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Failed to load hosted zones",
        message: err.message || "Could not retrieve hosted zones from backend API.",
      });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // Handle Search input
  const handleSearchChange = (val: string) => {
    setSearch(val);
  };

  // Create Success
  const handleCreateSuccess = (newZone: HostedZone) => {
    setNotification({
      type: "success",
      title: "Hosted zone created",
      message: `Hosted zone ${newZone.name} was successfully created with auto-provisioned nameservers and SOA record.`,
    });
    fetchZones();
  };

  // Edit Success
  const handleEditSuccess = (updatedZone: HostedZone) => {
    setNotification({
      type: "success",
      title: "Hosted zone updated",
      message: `Hosted zone ${updatedZone.name} was successfully updated.`,
    });
    fetchZones();
  };

  // Delete Success
  const handleDeleteSuccess = (deletedId: string) => {
    setNotification({
      type: "success",
      title: "Hosted zone deleted",
      message: `Hosted zone (${deletedId}) and all its records were successfully deleted.`,
    });
    fetchZones();
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: "Hosted zones" }]} />

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

      {/* Primary Data Table */}
      <ZoneTable
        zones={zones}
        total={total}
        loading={loading}
        search={search}
        onSearchChange={handleSearchChange}
        onRefresh={fetchZones}
        onCreateClick={() => setCreateModalOpen(true)}
        onEditClick={(zone) => {
          setActiveZone(zone);
          setEditModalOpen(true);
        }}
        onDeleteClick={(zone) => {
          setActiveZone(zone);
          setDeleteModalOpen(true);
        }}
      />

      {/* Create Zone Modal */}
      <CreateZoneModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Zone Modal */}
      <EditZoneModal
        isOpen={editModalOpen}
        zone={activeZone}
        onClose={() => {
          setEditModalOpen(false);
          setActiveZone(null);
        }}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Zone Modal */}
      <DeleteZoneModal
        isOpen={deleteModalOpen}
        zone={activeZone}
        onClose={() => {
          setDeleteModalOpen(false);
          setActiveZone(null);
        }}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
