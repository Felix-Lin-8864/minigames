import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  readPanelPreferences,
  writePanelPreferences,
} from './panelPreferences'

function createLocalStorageMock() {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  }
}

describe('panelPreferences', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
  })

  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('defaults both panels to hidden', () => {
    expect(readPanelPreferences()).toEqual({
      showStatPanel: false,
      showHiLoPanel: false,
    })
  })

  it('persists and restores panel toggles', () => {
    writePanelPreferences({ showStatPanel: true, showHiLoPanel: false })
    expect(readPanelPreferences()).toEqual({
      showStatPanel: true,
      showHiLoPanel: false,
    })

    writePanelPreferences({ showStatPanel: true, showHiLoPanel: true })
    expect(readPanelPreferences()).toEqual({
      showStatPanel: true,
      showHiLoPanel: true,
    })
  })
})
