import React, { useState } from 'react';
import { BookOpen, Edit3, Plus, ScrollText, Trash2, X } from 'lucide-react';
import { useCampaign } from '../state/CampaignContext';
import { MissionLog, MissionOutcome, MissionType } from '../types/campaign';
import { createId } from '../data/sampleCampaign';
import { MarkdownText } from './MarkdownText';

const OUTCOME_BADGES: Record<MissionOutcome, string> = {
  Victory: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  Defeat: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  Fled: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  'In Progress': 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
};

export function MissionsView() {
  const { activeCampaign, dispatch, setActiveTab } = useCampaign();
  const [editing, setEditing] = useState<MissionLog | null>(null);

  if (!activeCampaign) return null;

  const sorted = [...activeCampaign.missions].sort((a, b) => b.turn - a.turn);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
          <ScrollText className="w-4 h-4" /> Mission & Battle Log ({sorted.length})
        </h2>
        <button
          onClick={() =>
            setEditing({
              id: createId('mis'),
              turn: activeCampaign.turn,
              planet: activeCampaign.currentPlanet,
              missionType: 'Opportunity',
              objective: '',
              outcome: 'Victory',
              creditsEarned: 0,
              loot: '',
              casualties: '',
              report: '',
              createdAt: new Date().toISOString(),
            })
          }
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Log Mission
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-500">
          No missions logged yet. Record your first tabletop battle here!
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((m) => {
            const turnNotes = activeCampaign.notes.filter((n) => n.links.turn === m.turn);
            return (
              <article
                key={m.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400">
                        Turn {m.turn}
                      </span>
                      <span className="font-bold text-sm">{m.missionType}</span>
                      <span className="text-xs text-slate-500">on {m.planet}</span>
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                          OUTCOME_BADGES[m.outcome]
                        }`}
                      >
                        {m.outcome}
                      </span>
                    </div>
                    {m.objective && (
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-1">
                        {m.objective}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditing(m)}
                      className="p-1.5 text-slate-400 hover:text-cyan-500 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete Turn ${m.turn} mission log?`)) {
                          dispatch({ type: 'DELETE_MISSION', id: m.id });
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <span>
                    <strong className="text-amber-600 dark:text-amber-400">Credits:</strong>{' '}
                    +{m.creditsEarned} cr
                  </span>
                  {m.loot && (
                    <span>
                      <strong>Loot:</strong> {m.loot}
                    </span>
                  )}
                  {m.casualties && (
                    <span className="text-rose-600 dark:text-rose-400">
                      <strong>Casualties:</strong> {m.casualties}
                    </span>
                  )}
                </div>

                {m.report && (
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3">
                    <MarkdownText content={m.report} />
                  </div>
                )}

                {turnNotes.length > 0 && (
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono uppercase text-slate-500 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Linked Journal:
                    </span>
                    {turnNotes.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => setActiveTab('notes')}
                        className="text-xs px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 hover:underline cursor-pointer"
                      >
                        {n.title}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {editing && (
        <MissionModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(mission) => {
            dispatch({ type: 'UPSERT_MISSION', mission });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function MissionModal({
  initial,
  onClose,
  onSave,
}: {
  initial: MissionLog;
  onClose: () => void;
  onSave: (m: MissionLog) => void;
}) {
  const [form, setForm] = useState(initial);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3 my-8">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">Log Mission</h3>
          <button onClick={onClose} className="text-slate-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-slate-500 mb-1">Turn #</label>
              <input
                type="number"
                min={1}
                value={form.turn}
                onChange={(e) => setForm({ ...form, turn: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Type</label>
              <select
                value={form.missionType}
                onChange={(e) => setForm({ ...form, missionType: e.target.value as MissionType })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1.5"
              >
                <option value="Opportunity">Opportunity</option>
                <option value="Patron">Patron</option>
                <option value="Quest">Quest</option>
                <option value="Rival Attack">Rival Attack</option>
                <option value="Invasion">Invasion</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Outcome</label>
              <select
                value={form.outcome}
                onChange={(e) => setForm({ ...form, outcome: e.target.value as MissionOutcome })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1.5"
              >
                <option value="Victory">Victory</option>
                <option value="Defeat">Defeat</option>
                <option value="Fled">Fled</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Credits</label>
              <input
                type="number"
                value={form.creditsEarned}
                onChange={(e) => setForm({ ...form, creditsEarned: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Planet</label>
            <input
              type="text"
              value={form.planet}
              onChange={(e) => setForm({ ...form, planet: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Objective</label>
            <input
              type="text"
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              placeholder="e.g., Hold the relay tower for 6 rounds"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 mb-1">Loot / Finds</label>
              <input
                type="text"
                value={form.loot}
                onChange={(e) => setForm({ ...form, loot: e.target.value })}
                placeholder="e.g., 1x Frag Grenade, 1 Rumor"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Casualties / Injuries</label>
              <input
                type="text"
                value={form.casualties}
                onChange={(e) => setForm({ ...form, casualties: e.target.value })}
                placeholder="e.g., None / Mira in Sickbay"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Battle Report (Markdown supported)</label>
            <textarea
              rows={5}
              value={form.report}
              onChange={(e) => setForm({ ...form, report: e.target.value })}
              placeholder="What happened on the tabletop?"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-slate-500 cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-600 text-white font-semibold cursor-pointer"
            >
              Save Mission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
