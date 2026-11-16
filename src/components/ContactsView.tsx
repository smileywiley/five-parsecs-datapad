import React, { useState } from 'react';
import { BookOpen, Edit3, Handshake, Plus, Skull, Trash2, X } from 'lucide-react';
import { useCampaign } from '../state/CampaignContext';
import { Patron, PatronStatus, Rival, RivalStatus } from '../types/campaign';
import { createId } from '../data/sampleCampaign';

export function ContactsView() {
  const { activeCampaign, dispatch, setActiveTab } = useCampaign();
  const [editingPatron, setEditingPatron] = useState<Patron | null>(null);
  const [editingRival, setEditingRival] = useState<Rival | null>(null);

  if (!activeCampaign) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Patrons */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <Handshake className="w-4 h-4" /> Patrons ({activeCampaign.patrons.length})
          </h2>
          <button
            onClick={() =>
              setEditingPatron({
                id: createId('pat'),
                name: '',
                faction: '',
                planet: activeCampaign.currentPlanet,
                persistent: false,
                status: 'active',
                benefits: '',
                notes: '',
              })
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Patron
          </button>
        </div>

        {activeCampaign.patrons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-xs text-slate-500">
            No patrons recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {activeCampaign.patrons.map((p) => {
              const linkedNotes = activeCampaign.notes.filter((n) => n.links.patronId === p.id);
              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm">{p.name}</h3>
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                            p.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                              : p.status === 'exhausted'
                                ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                                : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                          }`}
                        >
                          {p.status}
                        </span>
                        {p.persistent && (
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">
                            Persistent
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {[p.faction, p.planet].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingPatron(p)}
                        className="p-1 text-slate-400 hover:text-cyan-500 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'DELETE_PATRON', id: p.id })}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {p.benefits && (
                    <div className="text-xs bg-emerald-500/10 border border-emerald-500/20 rounded px-2.5 py-1.5 text-emerald-700 dark:text-emerald-300">
                      <span className="font-semibold">Benefits/Terms:</span> {p.benefits}
                    </div>
                  )}
                  {p.notes && <p className="text-xs text-slate-600 dark:text-slate-400">{p.notes}</p>}

                  {linkedNotes.length > 0 && (
                    <button
                      onClick={() => setActiveTab('notes')}
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" /> {linkedNotes.length} linked journal{' '}
                      {linkedNotes.length === 1 ? 'note' : 'notes'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Rivals */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Skull className="w-4 h-4" /> Rivals ({activeCampaign.rivals.length})
          </h2>
          <button
            onClick={() =>
              setEditingRival({
                id: createId('riv'),
                name: '',
                threatType: '',
                planet: activeCampaign.currentPlanet,
                status: 'active',
                notes: '',
              })
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Rival
          </button>
        </div>

        {activeCampaign.rivals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-xs text-slate-500">
            No rivals hunting your crew... yet.
          </div>
        ) : (
          <div className="space-y-3">
            {activeCampaign.rivals.map((r) => {
              const linkedNotes = activeCampaign.notes.filter((n) => n.links.rivalId === r.id);
              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm">{r.name}</h3>
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                            r.status === 'tracking'
                              ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                              : r.status === 'active'
                                ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                                : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {[r.threatType, r.planet].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingRival(r)}
                        className="p-1 text-slate-400 hover:text-cyan-500 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'DELETE_RIVAL', id: r.id })}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {r.notes && <p className="text-xs text-slate-600 dark:text-slate-400">{r.notes}</p>}

                  {linkedNotes.length > 0 && (
                    <button
                      onClick={() => setActiveTab('notes')}
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" /> {linkedNotes.length} linked journal{' '}
                      {linkedNotes.length === 1 ? 'note' : 'notes'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {editingPatron && (
        <PatronModal
          initial={editingPatron}
          onClose={() => setEditingPatron(null)}
          onSave={(patron) => {
            dispatch({ type: 'UPSERT_PATRON', patron });
            setEditingPatron(null);
          }}
        />
      )}

      {editingRival && (
        <RivalModal
          initial={editingRival}
          onClose={() => setEditingRival(null)}
          onSave={(rival) => {
            dispatch({ type: 'UPSERT_RIVAL', rival });
            setEditingRival(null);
          }}
        />
      )}
    </div>
  );
}

function PatronModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Patron;
  onClose: () => void;
  onSave: (p: Patron) => void;
}) {
  const [form, setForm] = useState(initial);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, name: form.name.trim() || 'Unnamed Patron' });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">{initial.name ? 'Edit Patron' : 'New Patron'}</h3>
          <button onClick={onClose} className="text-slate-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-1">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 mb-1">Faction / Type</label>
              <input
                type="text"
                value={form.faction}
                onChange={(e) => setForm({ ...form, faction: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
              />
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
          </div>
          <div className="grid grid-cols-2 gap-2 items-center">
            <div>
              <label className="block text-slate-500 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as PatronStatus })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
              >
                <option value="active">Active</option>
                <option value="exhausted">Exhausted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <label className="flex items-center gap-2 pt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={form.persistent}
                onChange={(e) => setForm({ ...form, persistent: e.target.checked })}
              />
              Persistent Patron
            </label>
          </div>
          <div>
            <label className="block text-slate-500 mb-1">Benefits / Conditions</label>
            <input
              type="text"
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1">Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-slate-500 cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold cursor-pointer"
            >
              Save Patron
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RivalModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Rival;
  onClose: () => void;
  onSave: (r: Rival) => void;
}) {
  const [form, setForm] = useState(initial);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, name: form.name.trim() || 'Unnamed Rival' });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">{initial.name ? 'Edit Rival' : 'New Rival'}</h3>
          <button onClick={onClose} className="text-slate-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-1">Name / Gang</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 mb-1">Threat Type</label>
              <input
                type="text"
                value={form.threatType}
                onChange={(e) => setForm({ ...form, threatType: e.target.value })}
                placeholder="e.g., Syndicate, Raiders"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
              />
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
          </div>
          <div>
            <label className="block text-slate-500 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as RivalStatus })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
            >
              <option value="active">Active</option>
              <option value="tracking">Tracking Crew</option>
              <option value="defeated">Defeated</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-500 mb-1">Notes / History</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-slate-500 cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-semibold cursor-pointer"
            >
              Save Rival
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
