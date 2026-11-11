import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneMap: Record<Tone, string> = {
  success: "border border-success/25 bg-success-tint text-success",
  warning: "border border-warning/25 bg-warning-tint text-warning",
  danger: "border border-danger/25 bg-danger-tint text-danger",
  info: "border border-info/25 bg-info-tint text-info",
  neutral: "border border-line-strong/60 bg-surface-3 text-ink-500",
};

const dotMap: Record<Tone, string> = {
  success: "bg-success shadow-[0_0_8px_rgb(61_220_151/80%)]",
  warning: "bg-warning shadow-[0_0_8px_rgb(251_191_77/80%)]",
  danger: "bg-danger shadow-[0_0_8px_rgb(255_107_129/80%)]",
  info: "bg-info shadow-[0_0_8px_rgb(76_201_240/80%)]",
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11.5px] font-semibold whitespace-nowrap",
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
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold",
        toneMap[tone],
      )}
    >
      {direction === "up" ? "↑" : "↓"} {children}
    </span>
  );
}

/** Neutral context chip for facts that are not movement deltas. */
export function InfoPill({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11.5px] font-medium",
        toneMap[tone],
      )}
    >
      {children}
    </span>
  );
}

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const btnVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white border border-primary/40 shadow-[0_8px_24px_-12px_rgb(124_108_255/85%)] hover:bg-primary-dark",
  secondary:
    "bg-surface-2 text-ink-900 border border-line-strong/80 hover:border-primary/60 hover:bg-surface-3",
  danger:
    "bg-danger text-[#2a0a11] border border-danger/40 hover:brightness-110",
  ghost:
    "bg-transparent text-brand-soft border border-transparent hover:bg-brand-tint",
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
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13.5px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50",
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
        "overflow-hidden rounded-xl border border-line bg-surface/95 shadow-[0_1px_0_rgb(255_255_255/3%)_inset,0_24px_50px_-38px_rgb(0_0_0/90%)]",
        className,
      )}
    >
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-line/80 bg-gradient-to-r from-surface-2/80 to-surface/40 px-4 py-3.5">
          <h3 className="flex items-center gap-2.5 text-[13.5px] font-bold tracking-tight text-ink-900">
            {icon && (
              <span className="grid size-6 place-items-center rounded-md bg-brand-tint text-brand-soft">
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
    <div className="group relative overflow-hidden rounded-xl border border-line bg-surface/95 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_38px_-24px_rgb(124_108_255/55%)]">
      <div className="pointer-events-none absolute -top-12 -right-10 size-28 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:bg-primary/20" />
      <div className="relative flex items-start justify-between gap-2">
        <span className="text-[12px] font-medium tracking-wide text-ink-500">
          {label}
        </span>
        {icon && (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-primary/20 bg-brand-tint text-brand-soft transition-transform duration-300 group-hover:scale-105">
            {icon}
          </span>
        )}
      </div>
      <div className="relative mt-3 flex items-baseline gap-1.5">
        <span className="text-[27px] leading-none font-bold tracking-tight text-ink-900">
          {value}
        </span>
        {unit && <span className="text-[11.5px] text-ink-muted">{unit}</span>}
      </div>
      {delta && <div className="relative mt-3">{delta}</div>}
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
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-lg border border-line bg-surface-2/70 p-1",
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onChange?.(item)}
          className={cn(
            "rounded-md px-3 py-1.5 text-[12px] font-semibold transition-all",
            item === active
              ? "bg-primary-tint text-brand-soft shadow-[0_1px_0_rgb(255_255_255/6%)_inset]"
              : "text-ink-500 hover:bg-surface-3 hover:text-ink-900",
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
            <tr key={rowKey(row, i)}>
              {columns.map((c, ci) => (
                <td
                  key={c.key}
                  className={cn(
                    c.mono && "font-mono text-[12px] text-ink-500",
                    ci === 0 && "font-semibold text-ink-900",
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
    <p className="pt-3 text-[11.5px] text-ink-muted">
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
                "grid size-7 place-items-center rounded-full text-[12px] font-bold",
                done && "bg-success text-[#04110c]",
                activeStep &&
                  "bg-primary text-white shadow-[0_0_0_4px_rgb(124_108_255/16%)]",
                !done && !activeStep && "bg-surface-3 text-ink-muted",
              )}
            >
              {done ? "✓" : i + 1}
            </span>
            <span
              className={cn(
                "text-[12.5px]",
                activeStep ? "font-bold text-ink-900" : "text-ink-500",
              )}
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className="mx-1 h-px w-6 bg-line-strong" />
            )}
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
    info: "bg-brand-tint text-brand-soft",
    danger: "bg-danger-tint text-danger",
    warning: "bg-warning-tint text-warning",
    success: "bg-success-tint text-success",
  } as const;
  return (
    <div className="grid place-items-center gap-2.5 rounded-xl border border-dashed border-line-strong/70 bg-surface-2/40 px-6 py-12 text-center">
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
        <p className="max-w-sm text-[12.5px] leading-relaxed text-ink-500">
          {description}
        </p>
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
  return <div className={cn("skeleton rounded-lg", className)} />;
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
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "w-full rounded-2xl border border-line-strong bg-surface p-5 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] animate-scale-in",
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
      className={cn("block text-[11.5px] font-semibold text-ink-700", className)}
    >
      {label}
      {children}
    </label>
  );
}

export const inputClass =
  "mt-1.5 h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-muted focus:border-primary";
