"use client";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ActiveTimer } from "@/lib/learn/data";

export type LearnSession = {
  loaded: boolean;
  user: { name: string } | null;
  timer: ActiveTimer | null;
  tours: string[];
  refresh: () => void;
};

const CACHE = "il-session";
/** Last known signed-in state, so headers render instantly on the next page; the server refresh follows. */
const readCache = () => {
  try {
    const v = localStorage.getItem(CACHE);
    return v ? (JSON.parse(v) as Omit<LearnSession, "refresh" | "loaded">) : null;
  } catch {
    return null;
  }
};
const writeCache = (v: Omit<LearnSession, "refresh" | "loaded">) => {
  try {
    if (v.user) localStorage.setItem(CACHE, JSON.stringify(v));
    else localStorage.removeItem(CACHE);
  } catch {}
};
export const clearSessionCache = () => {
  try {
    localStorage.removeItem(CACHE);
  } catch {}
};
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

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
        if (d && n === seq.current) {
          const next = { user: d.user, timer: d.timer, tours: d.tours ?? [] };
          writeCache(next);
          setState({ loaded: true, ...next });
        }
      })
      .catch(() => setState((s) => ({ ...s, loaded: true })));
  }, []);

  // Before first paint: show the cached state immediately (no "loading" header flash).
  useIsoLayoutEffect(() => {
    const c = readCache();
    // No cache almost always means "not signed in": show that right away; the fetch corrects it if needed.
    setState(c ? { loaded: true, user: c.user, timer: c.timer, tours: c.tours ?? [] } : { loaded: true, user: null, timer: null, tours: [] });
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
