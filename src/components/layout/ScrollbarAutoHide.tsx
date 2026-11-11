"use client";
import { useEffect } from "react";

/** Shows the page scrollbar while scrolling (or with the pointer at the right edge) and hides it again after a pause. */
export function ScrollbarAutoHide() {
  useEffect(() => {
    const root = document.documentElement;
    let t = 0;
    const show = () => {
      root.classList.add("is-scrolling");
      window.clearTimeout(t);
      t = window.setTimeout(() => root.classList.remove("is-scrolling"), 900);
    };
    const nearEdge = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && window.innerWidth - e.clientX < 16) show();
    };
    window.addEventListener("scroll", show, { passive: true });
    window.addEventListener("pointermove", nearEdge, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", show);
      window.removeEventListener("pointermove", nearEdge);
    };
  }, []);
  return null;
}
