import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Upload, type Message, type ParsingIssue } from "@shared/schema";

// Uploads
export function useUploads() {
  return useQuery({
    queryKey: [api.uploads.list.path],
    queryFn: async () => {
      const res = await fetch(api.uploads.list.path);
      if (!res.ok) throw new Error("Failed to fetch uploads");
      return api.uploads.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpload(id: number) {
  return useQuery({
    queryKey: [api.uploads.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.uploads.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch upload");
      return api.uploads.get.responses[200].parse(await res.json());
    },
    // Poll while processing
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? 1000 : false;
    },
  });
}

export function useCreateUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch(api.uploads.create.path, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to upload file");
      }
      return api.uploads.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.uploads.list.path] });
    },
  });
}

// Messages
export function useMessages(uploadId: number, page: number = 1, pageSize: number = 50) {
  return useQuery({
    queryKey: [api.uploads.getMessages.path, uploadId, page, pageSize],
    queryFn: async () => {
      const url = buildUrl(api.uploads.getMessages.path, { id: uploadId });
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      const res = await fetch(`${url}?${params}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.uploads.getMessages.responses[200].parse(await res.json());
    },
    enabled: !!uploadId,
  });
}

// Issues
export function useIssues(uploadId: number) {
  return useQuery({
    queryKey: [api.uploads.getIssues.path, uploadId],
    queryFn: async () => {
      const url = buildUrl(api.uploads.getIssues.path, { id: uploadId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch issues");
      return api.uploads.getIssues.responses[200].parse(await res.json());
    },
    enabled: !!uploadId,
  });
}

// Export Helper
export function getExportUrl(uploadId: number) {
  return buildUrl(api.uploads.export.path, { id: uploadId });
}
