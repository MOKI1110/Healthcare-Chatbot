import { useState } from "react";
import type { ReactNode } from "react";
import { LanguageContext } from "./LanguageContext";

export { LanguageContext };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [selectedLanguage, setLanguage] = useState<string | null>(null);
  return (
    <LanguageContext.Provider value={{ selectedLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
