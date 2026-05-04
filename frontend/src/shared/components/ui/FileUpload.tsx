'use client';

import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

export function FileUpload({
  accept = '.pdf',
  maxSizeMB = 20,
  value,
  onChange,
  error,
  label = 'Drop your file here, or click to browse',
  hint,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const displayHint = hint ?? `${accept.replace('.', '').toUpperCase()} only · Max ${maxSizeMB}MB`;

  function handleFile(file: File) {
    setSizeError(null);
    if (file.size > maxSizeMB * 1024 * 1024) {
      setSizeError(`File exceeds ${maxSizeMB}MB limit.`);
      return;
    }
    onChange(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  const currentError = error ?? sizeError;

  if (value) {
    return (
      <div className="flex items-center gap-3 p-4 border border-subtle rounded-lg bg-soft-blue">
        <FileText className="w-8 h-8 text-brand-600 shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary truncate">{value.name}</p>
          <p className="text-xs text-muted">{(value.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove file"
            className="p-1 rounded text-muted hover:text-secondary hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload file"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-150',
          disabled
            ? 'opacity-50 cursor-not-allowed border-strong'
            : 'cursor-pointer',
          isDragging && !disabled
            ? 'border-brand-500 bg-soft-blue'
            : !disabled && 'border-strong hover:border-brand-500 hover:bg-soft-blue',
          currentError && 'border-danger'
        )}
      >
        <Upload className="w-10 h-10 text-muted mx-auto mb-3" aria-hidden="true" />
        <p className="text-sm font-medium text-primary mb-1">{label}</p>
        <p className="text-xs text-muted">{displayHint}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
          aria-hidden="true"
        />
      </div>
      {currentError && (
        <p className="mt-1.5 text-xs text-danger" role="alert">{currentError}</p>
      )}
    </div>
  );
}
