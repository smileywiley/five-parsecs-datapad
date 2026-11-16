import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckSquare,
  Globe,
  Pin,
  Rocket,
  ScrollText,
  Square,
  Users,
} from 'lucide-react';
import { useCampaign } from '../state/CampaignContext';
import { TurnChecklist } from '../types/campaign';

const CHECKLIST_STEPS: { key: keyof TurnChecklist; label: string; hint: string }[] = [
  { key: 'travel', label: '1. Travel', hint: 'Flee invasion, pay upkeep, travel to new world or stay' },
  { key: 'worldSteps', label: '2. World Steps', hint: 'Upkeep, crew tasks, patron jobs, trade, rumors' },
  { key: 'battle', label: '3. Battle', hint: 'Deploy crew, resolve tabletop encounter' },
  { key: 'postBattle', label: '4. Post-Battle', hint: 'Injuries, loot, XP, rivals, galactic war, log turn' },
];

export function DashboardView() {
  const { activeCampaign, dispatch, setActiveTab } = useCampaign();
  if (!activeCampaign) return null;

  const activeCrew = activeCampaign.crew.filter((m) => m.status === 'active').length;
  const sickbayCrew = activeCampaign.crew.filter((m) => m.status === 'sickbay').length;
  const activeRivals = activeCampaign.rivals.filter((r) => r.status !== 'defeated').length;
  const activePatrons = activeCampaign.patrons.filter((p) => p.status === 'active').length;
  const pinnedNotes = activeCampaign.notes.filter((n) => n.pinned);
  const latestMission = [...activeCampaign.missions].sort((a, b) => b.turn - a.turn)[0];

  const toggleStep = (key: keyof TurnChecklist) => {
    dispatch({
      type: 'UPDATE_CAMPAIGN',
      patch: {
        turnChecklist: {
          ...activeCampaign.turnChecklist,
          [key]: !activeCampaign.turnChecklist[key],
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Grid: Planet + Turn Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current World & Quest */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Current Sector & World
            </h2>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={activeCampaign.invasionThreat}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_CAMPAIGN',
                    patch: { invasionThreat: e.target.checked },
                  })
                }
                className="rounded border-slate-400 text-rose-600 focus:ring-rose-500"
              />
              <span
                className={
                  activeCampaign.invasionThreat
                    ? 'text-rose-500 font-semibold flex items-center gap-1'
                    : 'text-slate-500 dark:text-slate-400'
                }
              >
                {activeCampaign.invasionThreat && <AlertTriangle className="w-3.5 h-3.5" />}
                Invasion Threat
              </span>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Planet Name
              </label>
              <input
                type="text"
                value={activeCampaign.currentPlanet}
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_CAMPAIGN', patch: { currentPlanet: e.target.value } })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Planet Traits / Licensing
              </label>
              <input
                type="text"
                value={activeCampaign.planetTraits}
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_CAMPAIGN', patch: { planetTraits: e.target.value } })
                }
                placeholder="e.g., High-Tech, Freelancer Licensing..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Active Quest
              </label>
              <textarea
                rows={2}
                value={activeCampaign.activeQuest}
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_CAMPAIGN', patch: { activeQuest: e.target.value } })
                }
                placeholder="Describe your current quest objective..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>
        </section>

        {/* Turn Phase Checklist */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Campaign Turn {activeCampaign.turn} Checklist
              </h2>
              <button
                onClick={() => dispatch({ type: 'NEXT_TURN' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
              >
                Advance to Turn {activeCampaign.turn + 1} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Advancing the turn resets this checklist and ticks down Sickbay recovery turns.
            </p>
            <div className="space-y-2 pt-1">
              {CHECKLIST_STEPS.map((step) => {
                const checked = activeCampaign.turnChecklist[step.key];
                return (
                  <button
                    key={step.key}
                    onClick={() => toggleStep(step.key)}
                    className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors cursor-pointer ${
                      checked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-900 dark:text-slate-100'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div className={`text-sm font-medium ${checked ? 'line-through opacity-75' : ''}`}>
                        {step.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{step.hint}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('crew')}
          className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-cyan-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono uppercase">
            Crew <Users className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-2 text-2xl font-bold">{activeCrew} Active</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {sickbayCrew > 0 ? `${sickbayCrew} in Sickbay` : 'All fit for duty'}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('ship')}
          className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-cyan-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono uppercase">
            Ship Hull <Rocket className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold">
            {activeCampaign.ship.hullCurrent}/{activeCampaign.ship.hullMax}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Debt: {activeCampaign.ship.debt} cr
          </div>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-cyan-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono uppercase">
            Contacts
          </div>
          <div className="mt-2 text-2xl font-bold">{activePatrons} Patrons</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {activeRivals} active {activeRivals === 1 ? 'rival' : 'rivals'}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-cyan-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono uppercase">
            Missions <ScrollText className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold">{activeCampaign.missions.length} Logged</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {latestMission ? `Last: Turn ${latestMission.turn} (${latestMission.outcome})` : 'No battles yet'}
          </div>
        </button>
      </div>

      {/* Pinned Solo Journal Threads */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-2">
            <Pin className="w-4 h-4" /> Pinned Solo Journal Notes
          </h2>
          <button
            onClick={() => setActiveTab('notes')}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" /> Open Solo Journal
          </button>
        </div>

        {pinnedNotes.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pin important Story Threads, NPCs, or Locations in your Solo Journal to keep them visible here.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pinnedNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setActiveTab('notes')}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 hover:border-cyan-500/40 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono uppercase text-cyan-600 dark:text-cyan-400">
                    {note.category}
                  </span>
                  {note.links.turn !== undefined && (
                    <span className="text-[11px] font-mono text-slate-500">Turn {note.links.turn}</span>
                  )}
                </div>
                <div className="font-semibold text-sm mt-1">{note.title}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {note.content.replace(/[#>*_`]/g, '')}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
