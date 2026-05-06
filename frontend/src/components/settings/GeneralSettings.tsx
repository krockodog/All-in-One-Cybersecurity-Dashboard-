import { ChangeEvent, ReactElement } from "react";
import { useLocale } from "@/contexts/LocaleContext";

export const GeneralSettings = (): ReactElement => {
  const { locale } = useLocale();

  const handleReadOnlySelect = (_event: ChangeEvent<HTMLSelectElement>): void => {
    return;
  };

  return (
    <section className="space-y-3 rounded-xl border border-white/10 p-4" data-testid="general-settings">
      <h3 className="text-lg font-semibold">General Settings</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1" data-testid="general-theme-select">
          <span className="text-sm">Theme</span>
          <select className="w-full rounded-lg border border-white/10 bg-black/20 p-2">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </label>
        <label className="space-y-1" data-testid="general-language-select">
          <span className="text-sm">Language</span>
          <select value={locale} className="w-full rounded-lg border border-white/10 bg-black/20 p-2" onChange={handleReadOnlySelect}>
            <option value="en">EN</option>
            <option value="de">DE</option>
          </select>
        </label>
      </div>
    </section>
  );
};
