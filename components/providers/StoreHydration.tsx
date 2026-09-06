"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function StoreHydration({ children }: { children: React.ReactNode }) {
  const setHydrated = useAppStore((state) => state.setHydrated);
  const loadDemo = useAppStore((state) => state.loadDemo);

  useEffect(() => {
    useAppStore.persist.rehydrate();
    const unsub = useAppStore.persist.onFinishHydration(() => {
      const current = useAppStore.getState();
      if (!current.seeded && current.projects.length === 0) {
        loadDemo();
      } else {
        setHydrated();
      }
    });
    if (useAppStore.persist.hasHydrated()) {
      const current = useAppStore.getState();
      if (!current.seeded && current.projects.length === 0) {
        loadDemo();
      } else {
        setHydrated();
      }
    }
    return () => {
      unsub();
    };
  }, [loadDemo, setHydrated]);

  return <>{children}</>;
}
