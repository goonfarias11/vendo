// src/components/ui/input.tsx
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefix, suffix, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs text-ink-muted font-medium">{label}</label>
        )}
        <div className="flex items-center">
          {prefix && (
            <span className="text-sm text-ink-muted bg-surface px-3 py-2 border border-r-0 border-border rounded-l-[8px] whitespace-nowrap">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full px-3 py-2 text-sm border border-border rounded-[8px] bg-white font-sans",
              "placeholder:text-ink-muted/50",
              "focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green",
              "disabled:bg-surface disabled:cursor-not-allowed",
              error && "border-red-400 focus:ring-red-200",
              prefix && "rounded-l-none",
              suffix && "rounded-r-none",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="text-sm text-ink-muted bg-surface px-3 py-2 border border-l-0 border-border rounded-r-[8px]">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-xs text-ink-muted font-medium">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            "w-full px-3 py-2 text-sm border border-border rounded-[8px] bg-white font-sans resize-y",
            "placeholder:text-ink-muted/50",
            "focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green",
            error && "border-red-400",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
