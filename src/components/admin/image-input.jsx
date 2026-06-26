"use client";

import { useState, useRef, useCallback } from "react";
import { Loader2, UploadCloud, X, ImageOff } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

/**
 * Single-image input with two modes: upload a file (to /api/upload, e.g.
 * Cloudinary) or paste a direct URL. Shows a preview either way.
 *
 * value: current image URL (string) or "" / null
 * onChange: (url: string) => void
 */
export function ImageInput({ value, onChange, label, helperText }) {
  const [mode, setMode] = useState("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [urlDraft, setUrlDraft] = useState(value || "");
  const inputRef = useRef(null);

  const uploadFile = useCallback(
    async (file) => {
      if (!file) return;
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("Only PNG, JPG, WEBP, or GIF images are allowed.");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        toast.error("Image must be smaller than 8MB.");
        return;
      }

      setIsUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!data.success) {
          toast.error(data.error || "Upload failed");
          return;
        }
        onChange(data.url);
        setUrlDraft(data.url);
      } catch {
        toast.error("Upload failed. Please try again or paste a URL instead.");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  function handleFileSelect(e) {
    uploadFile(e.target.files?.[0]);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    uploadFile(file);
  }

  function handleUrlSubmit(e) {
    e.preventDefault();
    if (!urlDraft.trim()) return;
    onChange(urlDraft.trim());
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-gf-cream">{label}</p>}

      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="h-9">
          <TabsTrigger value="upload" className="text-xs">Upload file</TabsTrigger>
          <TabsTrigger value="url" className="text-xs">Paste URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-2">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors",
              isDragging
                ? "border-gf-gold bg-gf-gold/5"
                : "border-gf-border hover:border-gf-gold-dim"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="size-5 animate-spin text-gf-gold" />
                <p className="text-xs text-gf-muted">Uploading...</p>
              </>
            ) : (
              <>
                <UploadCloud className="size-5 text-gf-muted" />
                <p className="text-xs text-gf-muted">
                  Click or drop an image
                  <br />
                  PNG, JPG, WEBP — up to 8MB
                </p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-2">
          <form onSubmit={handleUrlSubmit} className="flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
            />
            <button
              type="submit"
              className="shrink-0 rounded-md border border-gf-border px-3 text-xs text-gf-muted hover:border-gf-gold-dim hover:text-gf-gold"
            >
              Use URL
            </button>
          </form>
        </TabsContent>
      </Tabs>

      {helperText && <p className="text-xs text-gf-muted-2">{helperText}</p>}

      {value && (
        <div className="relative mt-2 inline-block">
          <img src={value} alt="" className="h-20 w-20 rounded-md border border-gf-border object-cover" />
          <button
            type="button"
            onClick={() => {
              onChange("");
              setUrlDraft("");
            }}
            className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-gf-bg-elevated border border-gf-border text-gf-muted hover:text-gf-danger"
            aria-label="Remove image"
          >
            <X className="size-3" />
          </button>
        </div>
      )}
      {!value && (
        <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-gf-border text-gf-muted-2">
          <ImageOff className="size-5" />
        </div>
      )}
    </div>
  );
}