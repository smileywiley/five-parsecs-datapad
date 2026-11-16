import { Campaign } from '../types/campaign';

const STORAGE_KEY = 'fpfh_campaigns_v1';
const ACTIVE_ID_KEY = 'fpfh_active_campaign_v1';
const THEME_KEY = 'fpfh_theme_v1';

export interface StoredState {
  campaigns: Campaign[];
  activeCampaignId: string | null;
}

export function loadStoredState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const activeId = localStorage.getItem(ACTIVE_ID_KEY);
    if (!raw) {
      return { campaigns: [], activeCampaignId: null };
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { campaigns: [], activeCampaignId: null };
    }
    return {
      campaigns: parsed,
      activeCampaignId: activeId && parsed.some((c) => c.id === activeId) ? activeId : parsed[0]?.id ?? null,
    };
  } catch {
    return { campaigns: [], activeCampaignId: null };
  }
}

export function saveStoredState(campaigns: Campaign[], activeCampaignId: string | null): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    if (activeCampaignId) {
      localStorage.setItem(ACTIVE_ID_KEY, activeCampaignId);
    } else {
      localStorage.removeItem(ACTIVE_ID_KEY);
    }
  } catch {
    // Ignore storage quota errors silently
  }
}

export function loadTheme(): 'dark' | 'light' {
  try {
    const val = localStorage.getItem(THEME_KEY);
    return val === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore
  }
}

export function isValidCampaign(obj: unknown): obj is Campaign {
  if (!obj || typeof obj !== 'object') return false;
  const c = obj as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.turn === 'number' &&
    typeof c.credits === 'number' &&
    Array.isArray(c.crew) &&
    Array.isArray(c.stash) &&
    Array.isArray(c.notes) &&
    Array.isArray(c.missions) &&
    typeof c.ship === 'object' &&
    c.ship !== null
  );
}

export function exportCampaignToJson(campaign: Campaign): string {
  return JSON.stringify(campaign, null, 2);
}

export function parseImportedCampaign(jsonText: string): Campaign {
  const parsed: unknown = JSON.parse(jsonText);
  if (!isValidCampaign(parsed)) {
    throw new Error('Invalid campaign JSON format.');
  }
  return parsed;
}
