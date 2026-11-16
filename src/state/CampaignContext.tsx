import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { Campaign, NavTab } from '../types/campaign';
import { AppState, CampaignAction, campaignReducer } from './campaignReducer';
import { loadStoredState, loadTheme, saveStoredState, saveTheme } from '../utils/storage';

interface CampaignContextValue {
  state: AppState;
  activeCampaign: Campaign | null;
  dispatch: React.Dispatch<CampaignAction>;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const CampaignContext = createContext<CampaignContextValue | null>(null);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(campaignReducer, undefined, () => loadStoredState());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadTheme());

  useEffect(() => {
    saveStoredState(state.campaigns, state.activeCampaignId);
  }, [state.campaigns, state.activeCampaignId]);

  useEffect(() => {
    saveTheme(theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const activeCampaign =
    state.campaigns.find((c) => c.id === state.activeCampaignId) ?? null;

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <CampaignContext.Provider
      value={{
        state,
        activeCampaign,
        dispatch,
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign(): CampaignContextValue {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error('useCampaign must be used inside CampaignProvider');
  return ctx;
}
