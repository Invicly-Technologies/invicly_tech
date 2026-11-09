"use client";
import { useEffect, useState } from "react";

function useMedia(query: string, initial = false) {
  const [match, setMatch] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

/** True on devices with a mouse (hover + fine pointer). */
export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");
export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
