import { useId } from 'react';
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
  const generatedId = useId();
  const fieldId = registration?.name || generatedId;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div>
      <label htmlFor={fieldId} className="label block mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children || (
        <input
          id={fieldId}
          type={type}
          placeholder={placeholder}
          className={`input ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          {...registration}
        />
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
