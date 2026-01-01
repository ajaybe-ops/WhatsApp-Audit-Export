import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function MetricCard({ title, value, icon, trend, trendUp, className }: MetricCardProps) {
  return (
    <div className={cn(
      "bg-card border border-border/50 rounded-xl p-6 shadow-sm",
      "hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        {icon && <div className="text-primary/80">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-foreground font-display tracking-tight">{value}</h3>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
