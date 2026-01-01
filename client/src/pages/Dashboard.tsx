import { useUpload, useMessages, useIssues, getExportUrl } from "@/hooks/use-uploads";
import { useRoute } from "wouter";
import { MetricCard } from "@/components/MetricCard";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { IssueBadge } from "@/components/IssueBadge";
import { Loader2, Download, AlertTriangle, FileText, BarChart2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const [, params] = useRoute("/dashboard/:id");
  const id = parseInt(params?.id || "0");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data: upload, isLoading: isUploadLoading } = useUpload(id);
  const { data: messagesData, isLoading: isMessagesLoading } = useMessages(id, page, pageSize);
  const { data: issues, isLoading: isIssuesLoading } = useIssues(id);

  if (isUploadLoading || !upload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Loading audit data...</p>
        </div>
      </div>
    );
  }

  // Derived Stats
  const criticalIssues = issues?.filter(i => i.severity === 'critical').length || 0;
  const warningIssues = issues?.filter(i => i.severity === 'warning').length || 0;
  const trustScore = Math.max(0, 100 - (criticalIssues * 5) - (warningIssues * 1));
  
  // Analytics Data Preparation
  const messagesBySender = messagesData?.items.reduce((acc, msg) => {
    if (msg.senderName) {
      acc[msg.senderName] = (acc[msg.senderName] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(messagesBySender || {}).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold font-display text-foreground">{upload.filename}</h1>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold uppercase",
                  upload.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                )}>
                  {upload.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Audit ID: #{upload.id} • {format(new Date(upload.createdAt!), "MMM d, yyyy HH:mm")}</p>
            </div>
          </div>

          <Button 
            asChild
            className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold gap-2"
          >
            <a href={getExportUrl(id)} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4" />
              Download Audit File
            </a>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Messages" 
            value={upload.messageCount || 0}
            icon={<FileText className="w-5 h-5" />}
          />
          <MetricCard 
            title="Trust Score" 
            value={`${trustScore}%`}
            icon={<ShieldCheck className="w-5 h-5" />}
            trend={trustScore > 90 ? "Excellent" : trustScore > 70 ? "Good" : "Needs Review"}
            trendUp={trustScore > 70}
          />
          <MetricCard 
            title="Critical Issues" 
            value={criticalIssues}
            icon={<AlertTriangle className="w-5 h-5" />}
            className={criticalIssues > 0 ? "border-red-200 bg-red-50/50" : ""}
            trend={criticalIssues > 0 ? "Action Required" : "Clean"}
            trendUp={criticalIssues === 0}
          />
          <MetricCard 
            title="Warnings" 
            value={warningIssues}
            icon={<AlertTriangle className="w-5 h-5" />}
            className={warningIssues > 5 ? "border-amber-200 bg-amber-50/50" : ""}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent gap-6 mb-6">
            <TabsTrigger 
              value="messages" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 font-medium text-muted-foreground data-[state=active]:text-primary transition-all"
            >
              Messages
            </TabsTrigger>
            <TabsTrigger 
              value="issues" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 font-medium text-muted-foreground data-[state=active]:text-primary transition-all"
            >
              Issues <span className="ml-2 bg-muted px-2 py-0.5 rounded-full text-xs">{issues?.length || 0}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 font-medium text-muted-foreground data-[state=active]:text-primary transition-all"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Messages Tab */}
          <TabsContent value="messages" className="mt-0">
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-[180px] font-semibold text-foreground">Timestamp</TableHead>
                      <TableHead className="w-[150px] font-semibold text-foreground">Sender</TableHead>
                      <TableHead className="font-semibold text-foreground">Message</TableHead>
                      <TableHead className="w-[120px] font-semibold text-foreground">Type</TableHead>
                      <TableHead className="w-[140px] font-semibold text-foreground">Reliability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isMessagesLoading ? (
                      Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                          <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                          <TableCell><div className="h-4 w-full bg-muted animate-pulse rounded" /></TableCell>
                          <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                          <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      messagesData?.items.map((msg) => (
                        <TableRow 
                          key={msg.id} 
                          className={cn(
                            "group hover:bg-muted/30 transition-colors",
                            (msg.confidenceScore || 1) < 0.8 && "bg-amber-50/50 hover:bg-amber-50/80"
                          )}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                            {msg.timestampNormalized 
                              ? format(new Date(msg.timestampNormalized), "yyyy-MM-dd HH:mm:ss")
                              : <span className="text-amber-600 font-medium">Invalid Date</span>}
                          </TableCell>
                          <TableCell className="font-medium text-sm text-foreground truncate max-w-[150px]">
                            {msg.senderName}
                          </TableCell>
                          <TableCell className="text-sm text-foreground/90 max-w-xl">
                            <div className="line-clamp-2 group-hover:line-clamp-none transition-all">
                              {msg.content}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-md font-medium capitalize",
                              msg.messageType === "deleted" ? "bg-red-100 text-red-700" :
                              msg.messageType === "media" ? "bg-blue-50 text-blue-700" :
                              msg.messageType === "system" ? "bg-gray-100 text-gray-700" :
                              "bg-slate-100 text-slate-700"
                            )}>
                              {msg.messageType}
                            </span>
                          </TableCell>
                          <TableCell>
                            <ConfidenceBadge score={msg.confidenceScore || 1} reason={msg.confidenceReason} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="border-t border-border p-4 flex items-center justify-between bg-muted/20">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {Math.ceil((messagesData?.total || 0) / pageSize)}
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || isMessagesLoading}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil((messagesData?.total || 0) / pageSize) || isMessagesLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="mt-0">
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[100px]">Severity</TableHead>
                    <TableHead className="w-[150px]">Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[300px]">Raw Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isIssuesLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8">Loading issues...</TableCell></TableRow>
                  ) : issues && issues.length > 0 ? (
                    issues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell>
                          <IssueBadge severity={issue.severity} />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{issue.issueType}</TableCell>
                        <TableCell className="text-sm">{issue.description}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[300px]" title={issue.rawMessage || ""}>
                          {issue.rawMessage}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-50" />
                        No parsing issues detected. Great job!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold font-display mb-6">Top Senders</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.1})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center justify-center text-center">
                <div className="max-w-xs">
                  <BarChart2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-bold font-display mb-2">More Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">Detailed timeline analysis, keyword density, and interaction maps are in development.</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

      </main>
    </div>
  );
}
