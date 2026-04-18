"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "text" | "circle" | "button";
  className?: string;
  count?: number;
}

export default function LoadingSkeleton({
  variant = "card",
  className,
  count = 1
}: LoadingSkeletonProps) {
  const variants = {
    card: "h-32 rounded-xl",
    text: "h-4 rounded",
    circle: "h-12 w-12 rounded-full",
    button: "h-10 w-32 rounded-full"
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-muted animate-pulse",
            variants[variant],
            className
          )}
        />
      ))}
    </>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card p-6 space-y-4", className)}>
      <div className="flex items-center gap-4">
        <LoadingSkeleton variant="circle" />
        <div className="space-y-2 flex-1">
          <LoadingSkeleton variant="text" className="w-3/4" />
          <LoadingSkeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <LoadingSkeleton variant="text" className="w-full" />
      <LoadingSkeleton variant="text" className="w-2/3" />
      <div className="flex gap-2 pt-2">
        <LoadingSkeleton variant="button" />
        <LoadingSkeleton variant="button" className="w-24" />
      </div>
    </div>
  );
}
