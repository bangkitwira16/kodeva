"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { captureUtmParameters, type UtmParameters } from "./utm";

const UtmContext = createContext<UtmParameters>({});

export function UtmProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [utmParameters, setUtmParameters] = useState<UtmParameters>({});

  useEffect(() => {
    setUtmParameters(captureUtmParameters(window.location.search));
  }, []);

  return (
    <UtmContext.Provider value={utmParameters}>{children}</UtmContext.Provider>
  );
}

export function useUtmParameters(): UtmParameters {
  return useContext(UtmContext);
}
