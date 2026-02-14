import type { AppState } from "./types";

const STORAGE_KEY = "nobocon_scorebook_v1";

let saveTimer: number | undefined;

export const canUseStorage = (): boolean => {
  try {
    const testKey = "__nobo_test";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

export const loadState = (): AppState | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
};

export const saveState = (state: AppState) => {
  if (!canUseStorage()) return;
  if (saveTimer) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, 300);
};

export const clearState = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const STORAGE_KEY_NAME = STORAGE_KEY;
