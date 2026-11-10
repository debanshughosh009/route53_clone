"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  children,
  onDismiss,
  className = "",
}) => {
  const typeConfig = {
    success: {
      bg: "bg-green-50 dark:bg-green-950/40 border-green-600 text-green-900 dark:text-green-200",
      icon: <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />,
    },
    error: {
      bg: "bg-red-50 dark:bg-red-950/40 border-red-600 text-red-900 dark:text-red-200",
      icon: <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-950/40 border-yellow-600 text-yellow-900 dark:text-yellow-200",
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />,
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-900 dark:text-blue-200",
      icon: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`border-l-4 p-3 rounded-r shadow-sm transition-all ${config.bg} ${className}`}
      role="alert"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2.5">
          {config.icon}
          <div>
            {title && <h4 className="text-sm font-bold mb-0.5">{title}</h4>}
            <div className="text-sm font-normal leading-relaxed">{children}</div>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-4 p-0.5"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
