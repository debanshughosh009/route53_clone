"use client";

import React from "react";
import CloudscapeFormField from "@cloudscape-design/components/form-field";
import CloudscapeSelect, { SelectProps as CloudscapeSelectProps } from "@cloudscape-design/components/select";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  helperText?: string;
  error?: string;
  value: string;
  onChange: CloudscapeSelectProps["onChange"];
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({ label, options, helperText, error, value, onChange, disabled }) => (
  <CloudscapeFormField label={label} description={helperText} errorText={error}>
    <CloudscapeSelect
      selectedOption={options.find((option) => option.value === value) ?? null}
      options={options.map((option) => ({ label: option.label, value: option.value }))}
      onChange={onChange}
      disabled={disabled}
    />
  </CloudscapeFormField>
);
