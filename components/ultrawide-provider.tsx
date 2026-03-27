"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "gamerphile-ultrawide";

interface UltrawideContextValue {
  ultrawide: boolean;
  setUltrawide: (v: boolean) => void;
}

const UltrawideContext = createContext<UltrawideContextValue | undefined>(undefined);

export function UltrawideProvider({ children }: { children: React.ReactNode }) {
  const [ultrawide, setUltrawideState] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setUltrawideState(true);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--max-viewport",
      ultrawide ? "1280px" : "1024px"
    );
  }, [ultrawide]);

  const setUltrawide = useCallback((v: boolean) => {
    setUltrawideState(v);
    localStorage.setItem(STORAGE_KEY, String(v));
  }, []);

  return (
    <UltrawideContext.Provider value={{ ultrawide, setUltrawide }}>
      {children}
    </UltrawideContext.Provider>
  );
}

export function useUltrawide() {
  const ctx = useContext(UltrawideContext);
  if (!ctx) throw new Error("useUltrawide must be used within UltrawideProvider");
  return ctx;
}
