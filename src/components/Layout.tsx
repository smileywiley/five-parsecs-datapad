import React, { useRef, useState } from 'react';
import {
  BookOpen,
  Compass,
  Download,
  FileText,
  Handshake,
  LayoutDashboard,
  Menu,
  Moon,
  Package,
  Plus,
  Rocket,
  ScrollText,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { useCampaign } from '../state/CampaignContext';
import { NavTab } from '../types/campaign';
import { createBlankCampaign, createSampleCampaign } from '../data/sampleCampaign';
import { exportCampaignToJson, parseImportedCampaign } from '../utils/storage';
import { exportCampaignToMarkdown } from '../utils/markdownExport';

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'crew', label: 'Crew', icon: Users },
  { id: 'ship', label: 'Ship', icon: Rocket },
  { id: 'stash', label: 'Stash', icon: Package },
  { id: 'contacts', label: 'Patrons & Rivals', icon: Handshake },
  { id: 'missions', label: 'Mission Log', icon: ScrollText },
  { id: 'notes', label: 'Solo Journal', icon: BookOpen },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const {
    state,
    activeCampaign,
    dispatch,
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
  } = useCampaign();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newCampaignModal, setNewCampaignModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadJson = () => {
    if (!activeCampaign) return;
    const blob = new Blob([exportCampaignToJson(activeCampaign)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCampaign.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    if (!activeCampaign) return;
    const blob = new Blob([exportCampaignToMarkdown(activeCampaign)], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCampaign.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-journal.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseImportedCampaign(text);
      dispatch({ type: 'IMPORT_CAMPAIGN', campaign: imported });
      setImportError(null);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import JSON.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateBlank = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCampaignName.trim() || 'New Frontier Campaign';
    dispatch({ type: 'ADD_CAMPAIGN', campaign: createBlankCampaign(name) });
    setNewCampaignName('');
    setNewCampaignModal(false);
    setActiveTab('dashboard');
  };

  const handleLoadSample = () => {
    dispatch({ type: 'ADD_CAMPAIGN', campaign: createSampleCampaign() });
    setNewCampaignModal(false);
    setActiveTab('dashboard');
  };

  const adjustResource = (field: 'credits' | 'storyPoints' | 'rumors' | 'turn', delta: number) => {
    if (!activeCampaign) return;
    const min = field === 'turn' ? 1 : 0;
    const next = Math.max(min, activeCampaign[field] + delta);
    dispatch({ type: 'UPDATE_CAMPAIGN', patch: { [field]: next } });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
          <Compass className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            5 Parsecs
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Campaign Datapad
          </div>
        </div>
      </div>

      {/* Campaign Switcher */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Campaign
          </span>
          <button
            onClick={() => setNewCampaignModal(true)}
            className="text-xs flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {state.campaigns.length > 0 ? (
          <div className="flex items-center gap-1.5">
            <select
              value={state.activeCampaignId ?? ''}
              onChange={(e) => dispatch({ type: 'SET_ACTIVE_CAMPAIGN', id: e.target.value })}
              className="w-full text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {state.campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Turn {c.turn})
                </option>
              ))}
            </select>
            {activeCampaign && (
              <button
                title="Delete active campaign"
                onClick={() => {
                  if (confirm(`Delete campaign "${activeCampaign.name}"? This cannot be undone.`)) {
                    dispatch({ type: 'DELETE_CAMPAIGN', id: activeCampaign.id });
                  }
                }}
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-500 dark:text-slate-400 italic">No campaigns yet</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                active
                  ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {item.id === 'notes' && activeCampaign && activeCampaign.notes.length > 0 && (
                <span className="ml-auto text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {activeCampaign.notes.length}
                </span>
              )}
              {item.id === 'crew' && activeCampaign && activeCampaign.crew.length > 0 && (
                <span className="ml-auto text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {activeCampaign.crew.filter((m) => m.status === 'active').length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={handleDownloadJson}
            disabled={!activeCampaign}
            title="Backup campaign as JSON"
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import campaign from JSON"
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" /> Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
        <button
          onClick={handleDownloadMarkdown}
          disabled={!activeCampaign}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" /> Export Journal (.md)
        </button>
        {importError && (
          <div className="text-[11px] text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded px-2 py-1">
            {importError}
          </div>
        )}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium bg-slate-200/70 dark:bg-slate-800/80 hover:bg-slate-300/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Light Mode
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-cyan-600" /> Dark Datapad
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-64 max-w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-10">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-3 right-3 p-1 rounded text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:pl-60 flex flex-col min-w-0">
        {/* Top Resource Bar */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-md border border-slate-300 dark:border-slate-700"
            >
              <Menu className="w-4 h-4" />
            </button>
            {activeCampaign ? (
              <div>
                <h1 className="text-sm sm:text-base font-bold leading-tight truncate max-w-[200px] sm:max-w-xs">
                  {activeCampaign.name}
                </h1>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {activeCampaign.currentPlanet || 'No Planet Set'}
                </p>
              </div>
            ) : (
              <span className="text-sm font-semibold text-slate-500">
                Welcome to Five Parsecs Datapad
              </span>
            )}
          </div>

          {activeCampaign && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <ResourceCounter
                label="Turn"
                value={activeCampaign.turn}
                accent="cyan"
                onDec={() => adjustResource('turn', -1)}
                onInc={() => adjustResource('turn', 1)}
              />
              <ResourceCounter
                label="Credits"
                value={activeCampaign.credits}
                accent="amber"
                onDec={() => adjustResource('credits', -1)}
                onInc={() => adjustResource('credits', 1)}
              />
              <ResourceCounter
                label="Story Pts"
                value={activeCampaign.storyPoints}
                accent="emerald"
                onDec={() => adjustResource('storyPoints', -1)}
                onInc={() => adjustResource('storyPoints', 1)}
              />
              <ResourceCounter
                label="Rumors"
                value={activeCampaign.rumors}
                accent="violet"
                onDec={() => adjustResource('rumors', -1)}
                onInc={() => adjustResource('rumors', 1)}
              />
            </div>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto">
          {!activeCampaign ? (
            <div className="max-w-lg mx-auto mt-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
                <Rocket className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Start Your Campaign</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Track your crew, ship, stash, patrons, rivals, mission logs, and Solo Game Master&apos;s Guide journal notes—saved automatically in your browser.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                <button
                  onClick={handleLoadSample}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Load Sample Campaign
                </button>
                <button
                  onClick={() => setNewCampaignModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> New Blank Campaign
                </button>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* New Campaign Modal */}
      {newCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">New Campaign</h3>
              <button
                onClick={() => setNewCampaignModal(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBlank} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="e.g., Fringe Runners"
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 text-xs font-medium cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Load Sample Instead
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCampaignModal(false)}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium cursor-pointer"
                  >
                    Create Blank
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ResourceCounter({
  label,
  value,
  accent,
  onDec,
  onInc,
}: {
  label: string;
  value: number;
  accent: 'cyan' | 'amber' | 'emerald' | 'violet';
  onDec: () => void;
  onInc: () => void;
}) {
  const accentMap = {
    cyan: 'text-cyan-600 dark:text-cyan-400',
    amber: 'text-amber-600 dark:text-amber-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    violet: 'text-violet-600 dark:text-violet-400',
  };

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-2 py-1">
      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <button
        onClick={onDec}
        className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
      >
        -
      </button>
      <span className={`font-mono text-sm font-bold min-w-[1.5rem] text-center ${accentMap[accent]}`}>
        {value}
      </span>
      <button
        onClick={onInc}
        className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
      >
        +
      </button>
    </div>
  );
}
