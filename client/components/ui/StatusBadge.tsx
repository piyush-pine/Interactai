import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "ready" | "connecting" | "active" | "error" | "inactive";
  children: React.ReactNode;
  className?: string;
}

const StatusBadge = ({ status, children, className }: StatusBadgeProps) => {
  const statusConfig = {
    ready: {
      bg: "bg-blue-500/20",
      text: "text-blue-400",
      border: "border-blue-500/30",
    },
    connecting: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-400",
      border: "border-yellow-500/30",
    },
    active: {
      bg: "bg-green-500/20",
      text: "text-green-400",
      border: "border-green-500/30",
    },
    error: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      border: "border-red-500/30",
    },
    inactive: {
      bg: "bg-gray-500/20",
      text: "text-gray-400",
      border: "border-gray-500/30",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium",
      config.bg,
      config.text,
      config.border,
      className
    )}>
      {children}
    </div>
  );
};

export default StatusBadge;
