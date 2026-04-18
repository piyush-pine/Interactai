"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "glass" | "gradient" | "themed" | "animated";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export default function EnhancedButton({
  variant = "themed",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: EnhancedButtonProps) {
  const baseClasses = "relative inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    glass: "btn-glass",
    gradient: "btn-gradient",
    themed: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full",
    animated: "border-animated"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        loading && "cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      
      {variant === "gradient" && (
        <span className="relative z-10">{children}</span>
      )}
      
      {variant === "animated" && (
        <div className="rounded-2xl bg-background px-6 py-3">
          {children}
        </div>
      )}
      
      {variant !== "gradient" && variant !== "animated" && (
        children
      )}
    </button>
  );
}
