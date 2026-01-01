import { UploadZone } from "@/components/UploadZone";
import { useUploads } from "@/hooks/use-uploads";
import { Link, useLocation } from "wouter";
import { FileText, Clock, ChevronRight, CheckCircle2, ShieldCheck, Activity } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Home() {
  const { data: uploads, isLoading } = useUploads();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navbar */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-foreground">Chat Ledger</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#security" className="hover:text-primary transition-colors">Security</a>
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <CheckCircle2 className="w-4 h-4" />
            <span>Audit-Ready WhatsApp Exports</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight max-w-4xl mx-auto">
            Turn messy chat logs into <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">trusted audit reports</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional parsing, confidence scoring, and excel reports for legal, finance, and compliance teams.
          </p>
        </div>

        {/* Upload Component */}
        <div className="mb-24">
          <UploadZone onUploadSuccess={() => {
            // Optional: immediately redirect to latest, or just refetch list
          }} />
        </div>

        {/* Recent Audits List */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-display">Recent Audits</h2>
            <div className="h-px bg-border flex-1 ml-6"></div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
              ))
            ) : uploads && uploads.length > 0 ? (
              uploads.map((upload) => (
                <Link key={upload.id} href={`/dashboard/${upload.id}`} className="group block">
                  <div className="bg-card border border-border/50 rounded-xl p-5 hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {upload.filename}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(upload.createdAt || new Date()), "MMM d, yyyy • h:mm a")}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                            upload.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                            upload.status === "processing" ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                          )}>
                            {upload.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all">
                      <span className="text-sm font-medium">View Report</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">No audits yet</h3>
                <p className="text-muted-foreground">Upload your first file above to get started.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
