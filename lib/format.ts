import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "d MMM yyyy", { locale: es });
  } catch {
    return "—";
  }
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "d MMM yyyy · HH:mm", { locale: es });
  } catch {
    return "—";
  }
}

export function fromNow(iso?: string): string {
  if (!iso) return "";
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: es });
  } catch {
    return "";
  }
}

export function percent(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export function clsx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
