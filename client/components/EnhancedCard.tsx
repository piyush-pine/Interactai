"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface EnhancedCardProps {
  children: ReactNode;
  variant?: "glass" | "gradient" | "themed" | "floating";
  className?: string;
  hover?: boolean;
  shimmer?: boolean;
  float?: boolean;
}

export default function EnhancedCard({
  children,
  variant = "themed",
  className,
  hover = true,
  shimmer = false,
  float = false
}: EnhancedCardProps) {
  const variants = {
    glass: "glass-card",
    gradient: "gradient-card", 
    themed: "box-shadow-themed bg-card text-card-foreground rounded-2xl border",
    floating: "box-shadow-lg bg-card text-card-foreground rounded-2xl border"
  };

  const animations = cn(
    float && "float-animation",
    shimmer && "shimmer"
  );

  return (
    <div
      className={cn(
        variants[variant],
        hover && "transition-all duration-300 hover:scale-105",
        animations,
        className
      )}
    >
      {children}
    </div>
  );
}
