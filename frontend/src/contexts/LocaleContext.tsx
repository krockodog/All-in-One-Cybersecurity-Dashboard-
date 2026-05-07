import { ReactNode, createContext, useContext, useState } from "react";

type Locale = "en" | "de";

interface LocaleContextValue {
  locale: Locale;
  toggleLocale: () => void;
  t: (en: string, de: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>("en");
  const toggleLocale = (): void => {
    setLocale((current) => (current === "en" ? "de" : "en"));
  };

  const translate = (en: string, de: string): string => (locale === "de" ? de : en);

  const value: LocaleContextValue = { locale, toggleLocale, t: translate };
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }
  return context;
};
