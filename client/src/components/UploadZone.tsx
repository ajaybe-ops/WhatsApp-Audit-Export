import { useState, useRef } from "react";
import { UploadCloud, FileText, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateUpload } from "@/hooks/use-uploads";
import { useToast } from "@/hooks/use-toast";

interface UploadZoneProps {
  onUploadSuccess?: () => void;
}

export function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const createUpload = useCreateUpload();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".txt") && !file.name.endsWith(".zip")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a .txt or .zip file exported from WhatsApp.",
      });
      return;
    }

    createUpload.mutate(file, {
      onSuccess: () => {
        toast({
          title: "Upload started",
          description: "Your file is being processed.",
        });
        if (onUploadSuccess) onUploadSuccess();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: error.message,
        });
      },
    });
  };

  return (
    <div
      className={cn(
        "relative group cursor-pointer w-full max-w-2xl mx-auto",
        "bg-background border-2 border-dashed rounded-3xl p-12 text-center",
        "transition-all duration-300 ease-in-out",
        isDragging 
          ? "border-primary bg-primary/5 scale-[1.01]" 
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        createUpload.isPending && "opacity-80 pointer-events-none"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".txt,.zip"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center transition-colors",
          isDragging ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        )}>
          {createUpload.isPending ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
            <UploadCloud className="w-10 h-10" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold font-display text-foreground">
            {createUpload.isPending ? "Processing Audit File..." : "Upload WhatsApp Export"}
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {createUpload.isPending 
              ? "Parsing timestamps, detecting senders, and validating integrity."
              : "Drag and drop your .txt or .zip export here, or click to browse."}
          </p>
        </div>
        
        {!createUpload.isPending && (
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            <FileText className="w-3.5 h-3.5" />
            <span>Accepts standard WhatsApp .txt exports</span>
          </div>
        )}
      </div>

      {createUpload.isError && (
        <div className="absolute inset-x-0 bottom-4 mx-auto w-fit flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle className="w-4 h-4" />
          <span>Upload failed. Please try again.</span>
        </div>
      )}
    </div>
  );
}
