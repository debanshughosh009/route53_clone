"use client";

import React from "react";
import CloudscapeModal from "@cloudscape-design/components/modal";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const sizes = { sm: "small", md: "medium", lg: "large", xl: "x-large", "2xl": "xx-large" } as const;

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, maxWidth = "lg" }) => (
  <CloudscapeModal visible={isOpen} onDismiss={onClose} header={title} footer={footer} size={sizes[maxWidth]}>
    {children}
  </CloudscapeModal>
);
