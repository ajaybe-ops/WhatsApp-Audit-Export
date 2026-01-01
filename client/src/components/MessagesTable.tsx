import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Message } from "@shared/schema";
import { format } from "date-fns";
import { AlertCircle, FileIcon, MessageSquare } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MessagesTableProps {
  messages: Message[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export function MessagesTable({ 
  messages, 
  total, 
  page, 
  pageSize, 
  onPageChange,
  isLoading 
}: MessagesTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const totalPages = Math.ceil(total / pageSize);
  
  // Safe formatting wrapper
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Invalid Date";
    try {
      return format(new Date(dateString), "MMM d, yyyy HH:mm:ss");
    } catch {
      return String(dateString);
    }
  };

  const getConfidenceBadge = (score: number | null) => {
    const val = score ?? 1.0;
    if (val >= 0.9) return <Badge variant="success" className="h-5 text-[10px]">High</Badge>;
    if (val >= 0.7) return <Badge variant="warning" className="h-5 text-[10px]">Med</Badge>;
    return <Badge variant="destructive" className="h-5 text-[10px]">Low</Badge>;
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[180px] font-semibold text-muted-foreground">Timestamp</TableHead>
              <TableHead className="w-[150px] font-semibold text-muted-foreground">Sender</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Content</TableHead>
              <TableHead className="w-[100px] font-semibold text-muted-foreground">Type</TableHead>
              <TableHead className="w-[80px] font-semibold text-muted-foreground text-right">Conf.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono text-sm">
            {isLoading ? (
              Array(10).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="h-12 animate-pulse bg-muted/20" />
                </TableRow>
              ))
            ) : messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No messages found
                </TableCell>
              </TableRow>
            ) : (
              messages.map((msg) => (
                <>
                  <TableRow 
                    key={msg.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/30",
                      (msg.confidenceScore ?? 1) < 0.8 && "bg-amber-50/50 dark:bg-amber-950/10 hover:bg-amber-100/50 dark:hover:bg-amber-950/20",
                      msg.messageType === "deleted" && "text-muted-foreground line-through decoration-destructive/50",
                      expandedId === msg.id && "bg-muted/50"
                    )}
                    onClick={() => toggleExpand(msg.id)}
                  >
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {msg.timestampNormalized ? formatDate(msg.timestampNormalized) : msg.timestampOriginal}
                    </TableCell>
                    <TableCell className="font-medium truncate max-w-[150px]">
                      {msg.senderName || <span className="text-muted-foreground italic">System</span>}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {msg.messageType === 'media' && <FileIcon className="inline w-3 h-3 mr-1" />}
                      {msg.content}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="h-5 text-[10px] capitalize bg-background/50">
                        {msg.messageType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {getConfidenceBadge(msg.confidenceScore)}
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Detail View */}
                  {expandedId === msg.id && (
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={5} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2">
                            <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Raw Line</p>
                            <div className="p-2 bg-background border rounded font-mono break-all">
                              {msg.rawMessage}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Metadata</p>
                            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                              <span>Chat: {msg.chatName}</span>
                              <span>Edited: {msg.isEdited ? "Yes" : "No"}</span>
                              <span>Original TS: {msg.timestampOriginal}</span>
                              <span>Confidence: {msg.confidenceScore}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
            </PaginationItem>
            
            <PaginationItem>
              <span className="text-sm text-muted-foreground px-4">
                Page {page} of {totalPages}
              </span>
            </PaginationItem>

            <PaginationItem>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || isLoading}
              >
                Next
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
