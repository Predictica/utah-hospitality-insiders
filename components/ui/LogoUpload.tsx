"use client";

import { useState, useRef } from "react";

interface LogoUploadProps {
  currentLogoUrl: string | null;
  onUploadComplete: (url: string) => void;
}

export default function LogoUpload({ currentLogoUrl, onUploadComplete }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // Validate type
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB.");
      return;
    }

    // Show local preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/employer/logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.logo_url) {
        setPreview(data.logo_url);
        onUploadComplete(data.logo_url);
      } else {
        setError(data.error || "Upload failed");
        setPreview(currentLogoUrl);
      }
    } catch {
      setError("Network error. Please try again.");
      setPreview(currentLogoUrl);
    }
    setUploading(false);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
        {preview ? (
          <img src={preview} alt="Company logo" className="w-full h-full object-cover" />
        ) : (
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-sm font-medium text-[#1F4E79] hover:underline disabled:opacity-50"
        >
          {uploading ? "Uploading..." : preview ? "Change Logo" : "Upload Logo"}
        </button>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, or WebP. Max 2MB.</p>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    </div>
  );
}
