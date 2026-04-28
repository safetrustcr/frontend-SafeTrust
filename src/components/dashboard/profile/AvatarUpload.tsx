"use client";

import { Camera } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface AvatarUploadProps {
  initials?: string;
  currentAvatar?: string;
  onFileChange: (file: File) => void;
}

export function AvatarUpload({ initials = "RV", currentAvatar, onFileChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentAvatar ?? null);
  const [imgError, setImgError] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setImgError(false);
    onFileChange(file);
  };

  const showFallback = !preview || imgError;

  return (
    <div className="relative w-20 h-20 shrink-0">
      <div className="w-20 h-20 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center">
        {showFallback ? (
          <span className="text-orange-600 font-semibold text-lg select-none">
            {initials}
          </span>
        ) : (
          <Image
            src={preview!}
            alt="Profile avatar"
            width={80}
            height={80}
            className="object-cover w-full h-full"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-colors"
        aria-label="Upload profile photo"
      >
        <Camera className="w-3.5 h-3.5 text-gray-600" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
