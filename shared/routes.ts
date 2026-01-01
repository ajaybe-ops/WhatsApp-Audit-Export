import { z } from 'zod';
import { insertUploadSchema, messages, parsingIssues, uploads } from './schema';

// Shared error schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  uploads: {
    list: {
      method: 'GET' as const,
      path: '/api/uploads',
      responses: {
        200: z.array(z.custom<typeof uploads.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/uploads/:id',
      responses: {
        200: z.custom<typeof uploads.$inferSelect & { messageCount: number; issueCount: number }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/uploads',
      // Input is FormData, handled specially in implementation
      responses: {
        201: z.custom<typeof uploads.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    getMessages: {
      method: 'GET' as const,
      path: '/api/uploads/:id/messages',
      input: z.object({
        page: z.coerce.number().default(1),
        pageSize: z.coerce.number().default(50),
        status: z.string().optional(),
      }),
      responses: {
        200: z.object({
          items: z.array(z.custom<typeof messages.$inferSelect>()),
          total: z.number(),
          page: z.number(),
          pageSize: z.number(),
        }),
      },
    },
    getIssues: {
      method: 'GET' as const,
      path: '/api/uploads/:id/issues',
      responses: {
        200: z.array(z.custom<typeof parsingIssues.$inferSelect>()),
      },
    },
    export: {
      method: 'GET' as const,
      path: '/api/uploads/:id/export',
      responses: {
        200: z.any(), // Binary stream
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
