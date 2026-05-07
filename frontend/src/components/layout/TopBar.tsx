import { ReactElement } from "react";
import { Search, Moon, Sun, Languages } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocale } from "@/contexts/LocaleContext";

export const TopBar = (): ReactElement => {
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale } = useLocale();

  return (
    <header className="panel flex flex-wrap items-center justify-between gap-3 p-4" data-testid="topbar">
      <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-white/10 px-3 py-2" data-testid="topbar-search">
        <Search size={16} />
        <input
          data-testid="topbar-search-input"
          className="w-full bg-transparent text-sm outline-none"
          placeholder={locale === "de" ? "Suchen..." : "Search..."}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          data-testid="language-toggle-button"
          onClick={toggleLocale}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:border-cyan"
        >
          <Languages size={16} className="mr-1 inline" />
          {locale.toUpperCase()}
        </button>
        <button
          data-testid="theme-toggle-button"
          onClick={toggleTheme}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:border-neon"
        >
          {theme === "dark" ? <Sun size={16} className="inline" /> : <Moon size={16} className="inline" />}
        </button>
      </div>
    </header>
  );
};
