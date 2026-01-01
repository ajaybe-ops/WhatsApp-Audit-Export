import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConfidenceBadgeProps {
  score: number;
  reason?: string | null;
}

export function ConfidenceBadge({ score, reason }: ConfidenceBadgeProps) {
  let status: "high" | "medium" | "low" = "high";
  if (score < 0.6) status = "low";
  else if (score < 0.9) status = "medium";

  const config = {
    high: {
      label: "Trusted",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    medium: {
      label: "Review",
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    low: {
      label: "Flagged",
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
  };

  const { label, icon: Icon, color } = config[status];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold cursor-help transition-all",
            color
          )}>
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-popover text-popover-foreground border border-border shadow-xl max-w-xs p-3">
          <div className="space-y-1">
            <p className="font-semibold text-sm">Confidence Score: {Math.round(score * 100)}%</p>
            <p className="text-xs text-muted-foreground">
              {reason || (status === "high" 
                ? "This message matches standard formatting patterns." 
                : "This message has anomalies and should be verified.")}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
