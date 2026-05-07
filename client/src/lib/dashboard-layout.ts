export type WidgetId =
  | "hero"
  | "stats"
  | "quick-launch"
  | "automated-pentest"
  | "operations"
  | "snapshots"
  | "banner"
  | "jobs"
  | "automation";

export type WidgetSize = "compact" | "standard" | "wide";

export type WidgetConfig = {
  id: WidgetId;
  visible: boolean;
  size: WidgetSize;
};

export const DASHBOARD_WIDGETS_STORAGE_PREFIX = "dashboard-widget-config-v2";

export const defaultWidgets: WidgetConfig[] = [
  { id: "hero", visible: true, size: "wide" },
  { id: "stats", visible: true, size: "wide" },
  { id: "quick-launch", visible: true, size: "standard" },
  { id: "automated-pentest", visible: true, size: "wide" },
  { id: "operations", visible: true, size: "wide" },
  { id: "snapshots", visible: true, size: "standard" },
  { id: "banner", visible: true, size: "wide" },
  { id: "jobs", visible: true, size: "standard" },
  { id: "automation", visible: true, size: "wide" },
];

export const widgetMeta: Record<WidgetId, { title: string; description: string }> = {
  hero: {
    title: "Hero Panel",
    description: "Zentrale Positionierung des Frameworks und Einstieg in die operative Lage.",
  },
  stats: {
    title: "Statistiken",
    description: "Kennzahlen und Lageüberblick über aktuelle Operations.",
  },
  "quick-launch": {
    title: "Quick Launch",
    description: "Direkter Zugriff auf häufig genutzte Ziel- und Workflow-Einstiege.",
  },
  "automated-pentest": {
    title: "Automatisierter Pentest",
    description: "Scope, Validierung, Plan, Execution und Roadmap in einem operativen Ablauf.",
  },
  operations: {
    title: "Operations Intelligence",
    description: "Live-Metriken, Trendanalyse, Queue-Sichtbarkeit und globale Suche.",
  },
  snapshots: {
    title: "Investigation Snapshots",
    description: "Reproduzierbare Zwischenstände für Diffs, Re-Runs und Baselines.",
  },
  banner: {
    title: "Guidance Banner",
    description: "Hinweis- und Enablement-Bereich für schnelle Orientierung.",
  },
  jobs: {
    title: "Active Jobs",
    description: "Live-Liste aktuell laufender Jobs und Hintergrundaktivitäten.",
  },
  automation: {
    title: "Workflow Automation",
    description: "Regelwerk für automatische Reaktionen, Exporte und Benachrichtigungen.",
  },
};

export function getDashboardWidgetsStorageKey(userId?: string | null) {
  const scopedUserId = userId && userId.trim().length > 0 ? userId : "anonymous";
  return `${DASHBOARD_WIDGETS_STORAGE_PREFIX}:${scopedUserId}`;
}

export function sanitizeWidgetConfig(input: unknown): WidgetConfig[] {
  const defaultById = new Map(defaultWidgets.map((widget) => [widget.id, widget]));

  if (!Array.isArray(input)) {
    return defaultWidgets;
  }

  const sanitized = input
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const candidate = entry as Partial<WidgetConfig> & { id?: string };
      if (!candidate.id || !defaultById.has(candidate.id as WidgetId)) {
        return null;
      }

      const fallback = defaultById.get(candidate.id as WidgetId)!;
      const size: WidgetSize = candidate.size === "compact" || candidate.size === "standard" || candidate.size === "wide"
        ? candidate.size
        : fallback.size;

      return {
        id: fallback.id,
        visible: typeof candidate.visible === "boolean" ? candidate.visible : fallback.visible,
        size,
      } satisfies WidgetConfig;
    })
    .filter((entry): entry is WidgetConfig => Boolean(entry));

  const completed = defaultWidgets.map((widget) => sanitized.find((entry) => entry.id === widget.id) ?? widget);
  const orderedKnown = sanitized.filter((entry, index, array) => array.findIndex((candidate) => candidate.id === entry.id) === index);
  const missing = completed.filter((widget) => !orderedKnown.some((entry) => entry.id === widget.id));

  return [...orderedKnown, ...missing];
}

export function loadDashboardWidgets(userId?: string | null): WidgetConfig[] {
  if (typeof window === "undefined") {
    return defaultWidgets;
  }

  const saved = window.localStorage.getItem(getDashboardWidgetsStorageKey(userId));
  if (!saved) {
    return defaultWidgets;
  }

  try {
    return sanitizeWidgetConfig(JSON.parse(saved));
  } catch {
    return defaultWidgets;
  }
}

export function saveDashboardWidgets(widgets: WidgetConfig[], userId?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getDashboardWidgetsStorageKey(userId),
    JSON.stringify(sanitizeWidgetConfig(widgets))
  );
}

export function moveWidget(items: WidgetConfig[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const updated = [...items];
  const [item] = updated.splice(index, 1);
  updated.splice(nextIndex, 0, item);
  return updated;
}

export function updateWidgetVisibility(items: WidgetConfig[], id: WidgetId) {
  return items.map((entry) => (entry.id === id ? { ...entry, visible: !entry.visible } : entry));
}

export function updateWidgetSize(items: WidgetConfig[], id: WidgetId, size: WidgetSize) {
  return items.map((entry) => (entry.id === id ? { ...entry, size } : entry));
}

export function getWidgetSpanClass(size: WidgetSize) {
  if (size === "compact") {
    return "xl:col-span-1";
  }

  if (size === "wide") {
    return "xl:col-span-2";
  }

  return "xl:col-span-1";
}

export function getWidgetSizeLabel(size: WidgetSize) {
  if (size === "compact") return "Kompakt";
  if (size === "wide") return "Breit";
  return "Standard";
}
