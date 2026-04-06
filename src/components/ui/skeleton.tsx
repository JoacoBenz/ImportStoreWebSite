import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({ className, rounded = "lg" }: SkeletonProps) {
  const roundedStyles = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-xl",
    full: "rounded-full",
  };

  return (
    <div
      className={cn(
        "animate-shimmer",
        roundedStyles[rounded],
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-surface-primary rounded-2xl border border-brand-ice overflow-hidden">
      <Skeleton className="w-full aspect-square" rounded="sm" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-16" rounded="full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
