import { cn } from "@/lib/utils";

interface IssueBadgeProps {
  severity: string;
  count?: number;
}

export function IssueBadge({ severity, count }: IssueBadgeProps) {
  const styles = {
    critical: "bg-red-100 text-red-700 border-red-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const labels = {
    critical: "Critical",
    warning: "Warning",
    info: "Info",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
      styles[severity as keyof typeof styles] || styles.info
    )}>
      {labels[severity as keyof typeof labels] || severity}
      {count !== undefined && (
        <span className="ml-1 opacity-75">({count})</span>
      )}
    </span>
  );
}
