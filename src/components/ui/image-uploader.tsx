// src/components/ui/image-uploader.tsx
"use client";

import { useRef, useState } from "react";
import { useToast } from "./toast";

interface Props {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
  className?: string;
}

export function ImageUploader({
  value, onChange, folder = "products", placeholder = "Subir imagen", className,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { add: toast } = useToast();

  const handleFile = async (file: File) => {
    // Local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!data.success) {
        toast(data.error ?? "Error al subir", "error");
        setPreview(value ?? null);
        return;
      }

      onChange(data.data.url);
      toast("Imagen subida", "success");
    } catch {
      toast("Error de conexión", "error");
      setPreview(value ?? null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`relative border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-green transition-colors ${className}`}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {preview ? (
        <div className="relative group">
          <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm font-medium">Cambiar imagen</span>
          </div>
        </div>
      ) : (
        <div className="h-40 flex flex-col items-center justify-center gap-2 text-ink-muted">
          <span className="text-3xl">📸</span>
          <span className="text-sm">{placeholder}</span>
          <span className="text-xs opacity-60">JPG, PNG o WebP · máx. 5MB</span>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 text-green" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}
    </div>
  );
}
