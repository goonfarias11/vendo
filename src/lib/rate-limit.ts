// src/lib/rate-limit.ts
// Rate limiter simple basado en IP para proteger APIs públicas

const store = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  limit: number;       // máximo de requests
  windowMs: number;    // ventana de tiempo en ms
}

export function rateLimit(key: string, options: RateLimitOptions): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { success: true, remaining: options.limit - 1 };
  }

  if (record.count >= options.limit) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: options.limit - record.count };
}

// Limpiar store cada 10 minutos para evitar memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (now > value.resetAt) store.delete(key);
    }
  }, 10 * 60 * 1000);
}

// Helper para extraer IP del request
export function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
