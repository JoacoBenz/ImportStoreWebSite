import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-brand-teal/10 text-brand-teal",
  warning: "bg-brand-gold/30 text-brand-navy",
  danger: "bg-brand-coral/10 text-brand-coral",
  info: "bg-brand-ice/50 text-brand-teal",
  default: "bg-brand-pink/30 text-brand-teal",
};

export function Badge({
  variant = "default",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
