"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "gamerphile-region";

interface RegionContextValue {
  region: string;
  setRegion: (r: string) => void;
}

const RegionContext = createContext<RegionContextValue | undefined>(undefined);

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState("World");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setRegionState(stored);
  }, []);

  const setRegion = useCallback((r: string) => {
    setRegionState(r);
    localStorage.setItem(STORAGE_KEY, r);
  }, []);

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used within a RegionProvider");
  return ctx;
}
