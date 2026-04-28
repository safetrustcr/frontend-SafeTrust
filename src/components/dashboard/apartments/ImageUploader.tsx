'use client';

import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface ImageUploaderProps {
  files: Array<File | null>;
  onChange: (files: Array<File | null>) => void;
}

const SLOT_LABELS = [
  'Main apartment image',
  'Apartment image 2',
  'Apartment image 3',
  'Apartment image 4',
] as const;

function ImageSlot({
  label,
  previewUrl,
  onSelect,
  inputRef,
  large = false,
}: {
  label: string;
  previewUrl?: string;
  onSelect: (file: File | null) => void;
  inputRef: (node: HTMLInputElement | null) => void;
  large?: boolean;
}) {
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onSelect(event.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={(event) => {
          const input = event.currentTarget.previousElementSibling as HTMLInputElement | null;
          input?.click();
        }}
        aria-label={label}
        className={cn(
          'relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-gray-200 text-gray-500 transition hover:bg-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300',
          large ? 'min-h-[240px]' : 'min-h-[74px]'
        )}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={label}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Plus className={cn(large ? 'h-8 w-8' : 'h-6 w-6')} aria-hidden="true" />
        )}
      </button>
    </>
  );
}

export function ImageUploader({ files, onChange }: ImageUploaderProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const nextPreviewUrls = files.map((file) =>
      file ? URL.createObjectURL(file) : ''
    );

    setPreviewUrls(nextPreviewUrls);

    return () => {
      nextPreviewUrls.forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [files]);

  const normalizedFiles = useMemo(() => {
    return Array.from({ length: 4 }, (_, index) => files[index] ?? null);
  }, [files]);

  const handleFileSelect = (index: number, file: File | null) => {
    if (!file) {
      return;
    }

    const nextFiles = [...normalizedFiles];
    nextFiles[index] = file;
    onChange(nextFiles);

    const input = inputRefs.current[index];
    if (input) {
      input.value = '';
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_96px]">
      <ImageSlot
        label={SLOT_LABELS[0]}
        previewUrl={previewUrls[0]}
        onSelect={(file) => handleFileSelect(0, file)}
        inputRef={(node) => {
          inputRefs.current[0] = node;
        }}
        large
      />

      <div className="flex flex-col gap-4">
        {SLOT_LABELS.slice(1).map((label, index) => (
          <ImageSlot
            key={label}
            label={label}
            previewUrl={previewUrls[index + 1]}
            onSelect={(file) => handleFileSelect(index + 1, file)}
            inputRef={(node) => {
              inputRefs.current[index + 1] = node;
            }}
          />
        ))}
      </div>
    </div>
  );
}
