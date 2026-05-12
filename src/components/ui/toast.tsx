// src/components/ui/toast.tsx
"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  add: (message: string, type?: ToastType) => void;
  remove: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  add: (message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const icons: Record<ToastType, string> = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
};

const colors: Record<ToastType, string> = {
  success: "border-green bg-green-pale text-green-dark",
  error: "border-red-400 bg-red-50 text-red-700",
  info: "border-border bg-white text-ink",
};

export function Toaster() {
  const { toasts, remove } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => remove(toast.id)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-float text-sm font-medium",
            "pointer-events-auto cursor-pointer",
            "animate-in slide-in-from-right-4 fade-in duration-200",
            colors[toast.type]
          )}
        >
          <span>{icons[toast.type]}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
