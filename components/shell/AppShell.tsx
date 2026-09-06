"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  PhoneCall,
  Megaphone,
  FolderKanban,
  Menu,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { clsx } from "@/lib/format";
import { useAppStore } from "@/lib/store";

const NAV = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/proyectos", label: "Proyectos", icon: FolderKanban },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const projects = useAppStore((state) => state.projects);
  const hydrated = useAppStore((state) => state.hydrated);

  const projectMatch = pathname.match(/^\/proyectos\/([^/]+)/);
  const currentProject = projects.find((project) => project.id === projectMatch?.[1]);

  const projectNav = useMemo(() => {
    if (!currentProject) return [];
    const base = `/proyectos/${currentProject.id}`;
    return [
      { href: base, label: "Ficha", icon: FolderKanban },
      { href: `${base}/tablero`, label: "Producto", icon: KanbanSquare },
      { href: `${base}/lanzamiento`, label: "Lanzamiento", icon: PhoneCall },
      { href: `${base}/marketing`, label: "Marketing", icon: Megaphone },
    ];
  }, [currentProject]);

  const isPublic = pathname.startsWith("/p/");
  if (isPublic) return <>{children}</>;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-[260px] bg-ink-950 text-ink-50 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col px-5 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-display text-xl tracking-tight" onClick={() => setOpen(false)}>
              Mega<span className="text-teal-bright">me</span>
            </Link>
            <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú">
              <X size={20} />
            </button>
          </div>
          <p className="mt-1 text-xs text-ink-400">Proyectos tecnológicos, de la idea al lanzamiento.</p>

          <nav className="mt-8 space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={pathname === item.href}
                onClick={() => setOpen(false)}
              />
            ))}
          </nav>

          {currentProject ? (
            <div className="mt-8">
              <p className="mb-2 px-3 text-[11px] uppercase tracking-[0.16em] text-ink-400">
                {currentProject.name}
              </p>
              <div className="space-y-1">
                {projectNav.map((item) => (
                  <NavLink
                    key={item.href}
                    {...item}
                    active={pathname === item.href}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-auto rounded-2xl bg-ink-900 p-4">
            <p className="text-sm font-medium">Datos locales</p>
            <p className="mt-1 text-xs leading-5 text-ink-400">
              Todo se guarda en este navegador. Importa Excel, registra llamadas y activa píxeles sin servidor.
            </p>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Cerrar overlay"
        />
      ) : null}

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-100 bg-sand/90 px-4 py-3 backdrop-blur md:px-8">
          <button
            className="rounded-xl border border-ink-200 bg-white p-2 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={18} />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm text-ink-500">
              {hydrated ? `${projects.length} proyecto${projects.length === 1 ? "" : "s"}` : "Cargando…"}
            </p>
          </div>
          <Link
            href="/proyectos/nuevo"
            className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-800"
          >
            Nuevo proyecto
          </Link>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-10">{children}</main>

        {currentProject ? (
          <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-ink-100 bg-white/95 backdrop-blur lg:hidden">
            {projectNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex flex-col items-center gap-1 py-3 text-[11px]",
                    active ? "text-teal" : "text-ink-400",
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
        active ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white",
      )}
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}
