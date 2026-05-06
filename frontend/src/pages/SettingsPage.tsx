import { ReactElement } from "react";
import { LLMSettings } from "@/components/settings/LLMSettings";
import { APISettings } from "@/components/settings/APISettings";
import { GeneralSettings } from "@/components/settings/GeneralSettings";

export default function SettingsPage(): ReactElement {
  return (
    <div className="space-y-4" data-testid="settings-page">
      <LLMSettings />
      <APISettings />
      <GeneralSettings />
    </div>
  );
}
