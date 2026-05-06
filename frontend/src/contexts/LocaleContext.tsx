import { ReactNode, createContext, useContext, useMemo, useState } from "react";

type Locale = "en" | "de";

interface LocaleContextValue {
  locale: Locale;
  toggleLocale: () => void;
  t: (en: string, de: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>("en");
  const value = useMemo(
    () => ({
      locale,
      toggleLocale: () => setLocale((current) => (current === "en" ? "de" : "en")),
      t: (en: string, de: string) => (locale === "de" ? de : en)
    }),
    [locale]
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }
  return context;
};
