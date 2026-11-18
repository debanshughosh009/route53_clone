"use client";

import React from "react";
import CloudscapeButton from "@cloudscape-design/components/button";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size" | "formAction" | "onClick" | "style"> {
  variant?: "primary" | "secondary" | "danger" | "link";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  onClick?: (event: any) => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "secondary",
  size = "md",
  isLoading = false,
  disabled,
  onClick,
  ...props
}) => (
  <CloudscapeButton
    variant={variant === "primary" || variant === "danger" ? "primary" : variant === "link" ? "link" : "normal"}
    loading={isLoading}
    disabled={disabled}
    onClick={onClick ? (event) => onClick(event) : undefined}
    {...props}
  >
    {children}
  </CloudscapeButton>
);
