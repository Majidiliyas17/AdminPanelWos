import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneMap: Record<Tone, string> = {
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  danger: "bg-danger-tint text-danger",
  info: "bg-info-tint text-info",
  neutral: "bg-[#f3f4f6] text-ink-500",
};

const dotMap: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-ink-muted",
};

export function StatusChip({
  tone = "neutral",
  label,
  className,
}: {
  tone?: Tone;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
        toneMap[tone],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotMap[tone])} />
      {label}
    </span>
  );
}

export function DeltaPill({
  direction,
  tone = "success",
  children,
}: {
  direction: "up" | "down";
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        toneMap[tone],
      )}
    >
      {direction === "up" ? "↑" : "↓"} {children}
    </span>
  );
}

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const btnVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark border border-transparent",
  secondary: "bg-white text-ink-900 border border-line hover:bg-[#f9fafb]",
  danger: "bg-danger text-white hover:bg-[#b91c1c] border border-transparent",
  ghost:
    "bg-transparent text-primary hover:bg-primary-tint border border-transparent",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-colors disabled:opacity-50",
        btnVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function PanelCard({
  title,
  icon,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        className,
      )}
    >
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-[#f3f4f6] px-4 py-3">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink-900">
            {icon && (
              <span className="grid size-5 place-items-center rounded-md bg-violet-tint text-brand-violet">
                {icon}
              </span>
            )}
            {title}
          </h3>
          {action}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  unit,
  delta,
  icon,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  delta?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#ececef] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12px] font-medium text-ink-500">{label}</span>
        {icon && (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-tint text-brand-violet">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-[26px] leading-none font-bold text-ink-900">
          {value}
        </span>
        {unit && <span className="text-[11px] text-ink-500">{unit}</span>}
      </div>
      {delta && <div className="mt-2">{delta}</div>}
    </div>
  );
}

export function Tabs({
  items,
  active,
  onChange,
  className,
}: {
  items: string[];
  active: string;
  onChange?: (item: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onChange?.(item)}
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
            item === active
              ? "bg-primary-tint text-primary"
              : "text-ink-500 hover:text-ink-900",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  mono?: boolean;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends object>({
  columns,
  rows,
  rowKey,
  empty = "No records found",
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  empty?: string;
}) {
  if (rows.length === 0) return <EmptyState title={empty} />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full wos-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.className}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)} className="hover:bg-[#fafafa]">
              {columns.map((c, ci) => (
                <td
                  key={c.key}
                  className={cn(
                    c.mono && "font-mono text-[11px] text-ink-500",
                    ci === 0 && "font-semibold",
                  )}
                >
                  {c.render
                    ? c.render(row)
                    : ((row as Record<string, ReactNode>)[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PaginationLine({
  total,
  page,
  pageSize = 10,
}: {
  total: number;
  page?: number;
  pageSize?: number;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <p className="pt-3 text-[11px] text-ink-500">
      Showing 1 to {Math.min(pageSize, total)} of {total.toLocaleString()}{" "}
      entries · Page {page ?? 1} of {pages}
    </p>
  );
}

export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-2">
      {steps.map((step, i) => {
        const done = i < current;
        const activeStep = i === current;
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full text-[11px] font-bold",
                done && "bg-success text-white",
                activeStep && "bg-primary text-white",
                !done && !activeStep && "bg-[#f3f4f6] text-ink-500",
              )}
            >
              {done ? "✓" : i + 1}
            </span>
            <span
              className={cn(
                "text-[12px]",
                activeStep ? "font-bold text-ink-900" : "text-ink-500",
              )}
            >
              {step}
            </span>
            {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-line" />}
          </li>
        );
      })}
    </ol>
  );
}

export function EmptyState({
  title,
  description,
  action,
  tone = "info",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "info" | "danger" | "warning" | "success";
}) {
  const tones = {
    info: "bg-primary-tint text-primary",
    danger: "bg-danger-tint text-danger",
    warning: "bg-warning-tint text-warning",
    success: "bg-success-tint text-success",
  } as const;
  return (
    <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-line bg-white px-6 py-10 text-center">
      <span
        className={cn(
          "grid size-10 place-items-center rounded-xl",
          tones[tone],
        )}
      >
        ◇
      </span>
      <p className="text-[14px] font-bold text-ink-900">{title}</p>
      {description && (
        <p className="max-w-sm text-[12px] text-ink-500">{description}</p>
      )}
      {action}
    </div>
  );
}

export function ErrorState({
  onRetry,
  description,
  title,
}: {
  onRetry?: () => void;
  description?: string;
  title?: string;
}) {
  return (
    <EmptyState
      tone="danger"
      title={title ?? "Couldn't load this page"}
      description={description ?? "Something went wrong on our end. Try again."}
      action={
        onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        )
      }
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-[#f3f4f6]", className)} />
  );
}

export function SkeletonTable({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="space-y-2 p-1">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  children,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "w-full rounded-xl bg-white p-5 shadow-[0_20px_50px_rgba(16,24,40,0.2)]",
          width,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "block text-[11px] font-semibold text-[#374151]",
        className,
      )}
    >
      {label}
      {children}
    </label>
  );
}

export const inputClass =
  "mt-1 h-9 w-full rounded-lg border border-line bg-white px-3 text-[12px] text-ink-900 outline-none focus:border-primary";
