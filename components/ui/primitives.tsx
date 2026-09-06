import { clsx } from "@/lib/format";

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = {
    primary: "bg-ink-900 text-white hover:bg-ink-800",
    secondary: "bg-white text-ink-900 border border-ink-200 hover:border-ink-400",
    ghost: "text-ink-600 hover:bg-ink-100",
    danger: "bg-red-700 text-white hover:bg-red-800",
  }[variant];

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50",
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
        "w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none ring-teal/30 placeholder:text-ink-400 focus:border-teal focus:ring-2",
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
        "w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none ring-teal/30 placeholder:text-ink-400 focus:border-teal focus:ring-2",
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
        "w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none ring-teal/30 focus:border-teal focus:ring-2",
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
      <span className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</span>
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
    <div className={clsx("rounded-2xl border border-ink-100 bg-white p-5 shadow-card", className)}>
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "teal" | "amber" | "red" | "violet" | "blue";
}) {
  const map = {
    neutral: "bg-ink-100 text-ink-700",
    teal: "bg-teal-soft text-teal",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    violet: "bg-violet-100 text-violet-800",
    blue: "bg-blue-100 text-blue-800",
  }[tone];
  return (
    <span className={clsx("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", map)}>
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-0 sm:items-center sm:p-4">
      <button className="absolute inset-0" onClick={onClose} aria-label="Cerrar ventana" />
      <div
        className={clsx(
          "relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-lift sm:rounded-3xl sm:p-6",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-xl">{title}</h2>
          <button onClick={onClose} className="text-sm text-ink-500 hover:text-ink-900">
            Cerrar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
