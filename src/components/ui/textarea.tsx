"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full px-3 py-2 rounded-xl border border-brand-ice bg-surface-primary text-text-primary placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal resize-y min-h-[120px]",
            error && "border-brand-coral focus:ring-brand-coral/30",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-brand-coral">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
