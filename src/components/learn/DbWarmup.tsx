"use client";
import { useEffect } from "react";

/** Fire-and-forget request that wakes the sleeping database while the person fills in the form. */
export function DbWarmup() {
  useEffect(() => {
    fetch("/learn/api/warm/", { method: "POST", keepalive: true }).catch(() => {});
  }, []);
  return null;
}
