import { createContext } from "react";

export const LanguageContext = createContext<{
  selectedLanguage: string | null;
  setLanguage: (code: string | null) => void;
}>({
  selectedLanguage: null,
  setLanguage: () => {},
});

