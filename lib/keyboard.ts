"use client";
import { useEffect } from "react";

export function useTimelineKeyboard(
  onAction: (key: string) => void
) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (["j", "k", "o", "p", "/"].includes(e.key)) {
        onAction(e.key);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onAction]);
}
