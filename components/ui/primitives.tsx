import { clsx } from "@/lib/format";

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dark";
}) {
  const styles = {
    primary: "bg-lime text-ink-950 hover:bg-lime-dim",
    secondary: "bg-white text-ink-900 border border-ink-200 hover:border-ink-400 hover:bg-ink-50",
    ghost: "text-ink-600 hover:bg-ink-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
    dark: "bg-ink-900 text-white hover:bg-ink-800",
  }[variant];

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50",
        styles,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none ring-lime/40 placeholder:text-ink-400 focus:border-ink-900 focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none ring-lime/40 placeholder:text-ink-400 focus:border-ink-900 focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        "w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none ring-lime/40 focus:border-ink-900 focus:ring-2",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</span>
      {children}
    </label>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("rounded-xl border border-ink-100 bg-white p-5 shadow-card", className)}>
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "teal" | "amber" | "red" | "violet" | "blue" | "coral";
}) {
  const map = {
    neutral: "bg-ink-100 text-ink-700",
    teal: "bg-lime-soft text-lime-ink",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-700",
    violet: "bg-violet-100 text-violet-800",
    blue: "bg-sky-100 text-sky-800",
    coral: "bg-coral-soft text-[#9A3A28]",
  }[tone];
  return (
    <span className={clsx("inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold", map)}>
      {children}
    </span>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 p-0 sm:items-center sm:p-4">
      <button className="absolute inset-0" onClick={onClose} aria-label="Cerrar ventana" />
      <div
        className={clsx(
          "relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-lift sm:rounded-2xl sm:p-6",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-sm font-medium text-ink-500 hover:text-ink-900">
            Cerrar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
