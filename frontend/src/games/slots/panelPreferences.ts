export interface PanelPreferences {
  showStatPanel: boolean
}

const STORAGE_KEY = 'minigames:slots:panels'

const DEFAULT_PREFERENCES: PanelPreferences = {
  showStatPanel: false,
}

export function readPanelPreferences(): PanelPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFERENCES

    const parsed = JSON.parse(raw) as Partial<PanelPreferences>
    return {
      showStatPanel: Boolean(parsed.showStatPanel),
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function writePanelPreferences(preferences: PanelPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
}
