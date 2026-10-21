import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { toApiError, type ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";

export type ToastTone = "danger" | "warning" | "success" | "info";

export interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

const DEDUPE_MS = 4000;
const LIFETIME_MS = 6000;

let nextId = 1;
let items: ToastItem[] = [];
const listeners = new Set<() => void>();
const lastShown = new Map<string, number>();

function commit(next: ToastItem[]) {
  items = next;
  listeners.forEach((listener) => listener());
}

function push(
  tone: ToastTone,
  title: string,
  description?: string,
  key?: string,
) {
  const dedupeKey = key ?? `${title}|${description ?? ""}`;
  const now = Date.now();
  const previous = lastShown.get(dedupeKey);
  if (previous !== undefined && now - previous < DEDUPE_MS) return;
  lastShown.set(dedupeKey, now);
  if (lastShown.size > 50) {
    for (const [k, shownAt] of lastShown) {
      if (now - shownAt > DEDUPE_MS) lastShown.delete(k);
    }
  }

  const id = nextId++;
  commit([...items, { id, tone, title, description }]);
  setTimeout(() => commit(items.filter((item) => item.id !== id)), LIFETIME_MS);
}

export const toast = {
  success: (title: string, description?: string) =>
    push("success", title, description),
  info: (title: string, description?: string) =>
    push("info", title, description),
  warning: (title: string, description?: string, key?: string) =>
    push("warning", title, description, key),
  error: (title: string, description?: string, key?: string) =>
    push("danger", title, description, key),

  api(scope: string, error: unknown): ApiError {
    const apiError = toApiError(error);
    push(
      "danger",
      `${scope} — API request failed`,
      apiError.message,
      `api:${scope}`,
    );
    return apiError;
  },
};

const TONE_STYLES: Record<
  ToastTone,
  { icon: typeof AlertTriangle; iconBg: string; accent: string }
> = {
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-danger-tint text-danger",
    accent: "bg-danger",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-warning-tint text-warning",
    accent: "bg-warning",
  },
  success: {
    icon: CheckCircle2,
    iconBg: "bg-success-tint text-success",
    accent: "bg-success",
  },
  info: { icon: Info, iconBg: "bg-info-tint text-info", accent: "bg-info" },
};

export function Toaster() {
  const [, bump] = useState(0);

  useEffect(() => {
    const listener = () => bump((count) => count + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-10 z-[100] flex w-[340px] flex-col gap-2"
    >
      {items.map((item) => {
        const style = TONE_STYLES[item.tone];
        const Icon = style.icon;
        return (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto overflow-hidden rounded-xl border border-line bg-white shadow-[0_12px_32px_rgba(17,24,39,0.18)]",
              "animate-[toast-in_180ms_ease-out]",
            )}
          >
            <div className="flex items-start gap-3 p-3">
              <span
                className={cn(
                  "mt-0.5 grid size-6 shrink-0 place-items-center rounded-md",
                  style.iconBg,
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-ink-900">
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                aria-label="Dismiss"
                onClick={() =>
                  commit(items.filter((row) => row.id !== item.id))
                }
                className="grid size-5 shrink-0 place-items-center rounded text-ink-muted hover:bg-[#f3f4f6] hover:text-ink-500"
              >
                <X className="size-3" />
              </button>
            </div>
            <div className={cn("h-0.5 w-full", style.accent)} />
          </div>
        );
      })}
    </div>
  );
}
