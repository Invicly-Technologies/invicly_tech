"use client";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ActiveTimer } from "@/lib/learn/data";

export type LearnSession = {
  loaded: boolean;
  user: { name: string } | null;
  timer: ActiveTimer | null;
  tours: string[];
  refresh: () => void;
};

const Ctx = createContext<LearnSession>({ loaded: false, user: null, timer: null, tours: [], refresh: () => {} });
export const useLearnSession = () => useContext(Ctx);

/**
 * Loads the signed-in state in the browser instead of the layout, so public Learn pages
 * (paths, explainers) are fully static and served from the CDN.
 */
export function LearnSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<LearnSession, "refresh">>({ loaded: false, user: null, timer: null, tours: [] });
  const pathname = usePathname();
  const seq = useRef(0);

  const refresh = useCallback(() => {
    const n = ++seq.current;
    fetch("/learn/api/state/", { cache: "no-store", credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && n === seq.current) setState({ loaded: true, user: d.user, timer: d.timer, tours: d.tours ?? [] });
      })
      .catch(() => setState((s) => ({ ...s, loaded: true })));
  }, []);

  // On first load, on every navigation (login/logout/verify all navigate), and when the tab regains focus.
  useEffect(() => {
    refresh();
  }, [pathname, refresh]);
  useEffect(() => {
    const on = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", on);
    window.addEventListener("il-session-refresh", refresh);
    return () => {
      document.removeEventListener("visibilitychange", on);
      window.removeEventListener("il-session-refresh", refresh);
    };
  }, [refresh]);

  return <Ctx.Provider value={{ ...state, refresh }}>{children}</Ctx.Provider>;
}
