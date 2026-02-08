import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children?: React.ReactNode;
  registration?: UseFormRegisterReturn;
  type?: string;
  placeholder?: string;
}

export default function FormField({
  label,
  error,
  required,
  children,
  registration,
  type = 'text',
  placeholder,
}: FormFieldProps) {
  return (
    <div>
      <label className="label block mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children || (
        <input
          type={type}
          placeholder={placeholder}
          className={`input ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          {...registration}
        />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
