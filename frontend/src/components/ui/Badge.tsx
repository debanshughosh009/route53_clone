import React from "react";
import CloudscapeBadge from "@cloudscape-design/components/badge";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "blue" | "grey" | "yellow" | "red";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "grey" }) => (
  <CloudscapeBadge color={variant === "yellow" ? "severity-medium" : variant}>{children}</CloudscapeBadge>
);
