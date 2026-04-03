"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "gamerphile-cursor-trail";

interface CursorTrailContextValue {
  cursorTrail: boolean;
  setCursorTrail: (v: boolean) => void;
}

const CursorTrailContext = createContext<CursorTrailContextValue | undefined>(undefined);

export function CursorTrailProvider({ children }: { children: React.ReactNode }) {
  const [cursorTrail, setCursorTrailState] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setCursorTrailState(true);
  }, []);

  const setCursorTrail = useCallback((v: boolean) => {
    setCursorTrailState(v);
    localStorage.setItem(STORAGE_KEY, String(v));
  }, []);

  return (
    <CursorTrailContext.Provider value={{ cursorTrail, setCursorTrail }}>
      {children}
    </CursorTrailContext.Provider>
  );
}

export function useCursorTrail() {
  const ctx = useContext(CursorTrailContext);
  if (!ctx) throw new Error("useCursorTrail must be used within CursorTrailProvider");
  return ctx;
}
