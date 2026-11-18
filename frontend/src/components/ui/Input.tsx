"use client";

import React from "react";
import CloudscapeFormField from "@cloudscape-design/components/form-field";
import CloudscapeInput, { InputProps as CloudscapeInputProps } from "@cloudscape-design/components/input";

interface InputProps {
  label?: string;
  helperText?: string;
  error?: string;
  value: string;
  onChange: CloudscapeInputProps["onChange"];
  type?: CloudscapeInputProps["type"];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, helperText, error, required, ...props }) => (
  <CloudscapeFormField label={label} description={helperText} errorText={error}>
    <CloudscapeInput {...props} ariaRequired={required} />
  </CloudscapeFormField>
);
