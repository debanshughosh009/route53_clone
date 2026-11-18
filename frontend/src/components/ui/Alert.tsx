"use client";

import React from "react";
import CloudscapeAlert from "@cloudscape-design/components/alert";

interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type = "info", title, children, onDismiss }) => (
  <CloudscapeAlert
    type={type === "error" ? "error" : type}
    header={title}
    dismissible={Boolean(onDismiss)}
    onDismiss={onDismiss ? () => onDismiss() : undefined}
  >
    {children}
  </CloudscapeAlert>
);
