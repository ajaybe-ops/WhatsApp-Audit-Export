import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Message } from "@shared/schema";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";

interface AnalyticsChartsProps {
  messages: Message[];
}

export function AnalyticsCharts({ messages }: AnalyticsChartsProps) {
  
  const stats = useMemo(() => {
    const senders: Record<string, number> = {};
    const timeline: Record<string, number> = {};

    messages.forEach(msg => {
      // Sender stats
      const sender = msg.senderName || "System";
      senders[sender] = (senders[sender] || 0) + 1;

      // Timeline stats
      if (msg.timestampNormalized) {
        const dateKey = format(new Date(msg.timestampNormalized), "yyyy-MM-dd");
        timeline[dateKey] = (timeline[dateKey] || 0) + 1;
      }
    });

    const senderData = Object.entries(senders)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10

    const timelineData = Object.entries(timeline)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { senderData, timelineData };
  }, [messages]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="col-span-1 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Messages by Sender</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.senderData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                tick={{ fontSize: 11 }} 
                interval={0}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))" 
                radius={[0, 4, 4, 0]} 
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.timelineData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => format(parseISO(val), "MM/dd")}
                tick={{ fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelFormatter={(label) => format(parseISO(label), "MMM d, yyyy")}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
