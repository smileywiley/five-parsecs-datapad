import React, { useState } from 'react';
import {
  ArrowRightToLine,
  Edit3,
  Plus,
  ShieldAlert,
  Star,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { useCampaign } from '../state/CampaignContext';
import { CrewMember, CrewStatus } from '../types/campaign';
import { createId } from '../data/sampleCampaign';

const STATUS_BADGES: Record<CrewStatus, string> = {
  active: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  sickbay: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  deceased: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  retired: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
};

function emptyCrewMember(): CrewMember {
  return {
    id: createId('crew'),
    name: '',
    species: 'Human',
    background: '',
    status: 'active',
    recoveryTurns: 0,
    isLeader: false,
    isBot: false,
    isSoulless: false,
    stats: { reactions: 1, speed: 4, combat: 0, toughness: 3, savvy: 0, luck: 0 },
    xp: 0,
    equipment: [],
    injuries: [],
    tags: [],
    notes: '',
  };
}

export function CrewView() {
  const { activeCampaign, dispatch } = useCampaign();
  const [editing, setEditing] = useState<CrewMember | null>(null);
  const [statusFilter, setStatusFilter] = useState<CrewStatus | 'all'>('all');

  if (!activeCampaign) return null;

  const filteredCrew =
    statusFilter === 'all'
      ? activeCampaign.crew
      : activeCampaign.crew.filter((m) => m.status === statusFilter);

  const adjustXp = (member: CrewMember, delta: number) => {
    dispatch({
      type: 'UPSERT_CREW',
      member: { ...member, xp: Math.max(0, member.xp + delta) },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'active', 'sickbay', 'deceased', 'retired'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize cursor-pointer ${
                statusFilter === st
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={() => setEditing(emptyCrewMember())}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Add Crew Member
        </button>
      </div>

      {filteredCrew.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No crew members match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCrew.map((member) => (
            <div
              key={member.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold">{member.name || 'Unnamed Crew'}</h3>
                    {member.isLeader && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        <Star className="w-3 h-3" /> Leader
                      </span>
                    )}
                    {member.isBot && (
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                        Bot
                      </span>
                    )}
                    {member.isSoulless && (
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30">
                        Soulless
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                        STATUS_BADGES[member.status]
                      }`}
                    >
                      {member.status}
                      {member.status === 'sickbay' && ` (${member.recoveryTurns}t)`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {member.species}
                    {member.background ? ` · ${member.background}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditing(member)}
                    title="Edit crew member"
                    className="p-1.5 rounded-md text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${member.name}?`)) {
                        dispatch({ type: 'DELETE_CREW', id: member.id });
                      }
                    }}
                    title="Delete crew member"
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {(
                  [
                    ['React', member.stats.reactions],
                    ['Spd', `${member.stats.speed}"`],
                    ['Cmbt', `+${member.stats.combat}`],
                    ['Tough', member.stats.toughness],
                    ['Savvy', `+${member.stats.savvy}`],
                    ['Luck', member.stats.luck],
                  ] as const
                ).map(([label, val]) => (
                  <div
                    key={label}
                    className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-1.5"
                  >
                    <div className="text-[10px] font-mono uppercase text-slate-500">{label}</div>
                    <div className="text-sm font-bold font-mono">{val}</div>
                  </div>
                ))}

                {/* XP Box */}
                <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 py-1 px-1 flex flex-col justify-between">
                  <div className="text-[10px] font-mono uppercase text-cyan-600 dark:text-cyan-400">
                    XP
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => adjustXp(member, -1)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold font-mono">{member.xp}</span>
                    <button
                      onClick={() => adjustXp(member, 1)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Equipment */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">
                  Loadout ({member.equipment.length})
                </div>
                {member.equipment.length === 0 ? (
                  <div className="text-xs text-slate-400 italic">
                    No gear equipped. Equip items from the Stash tab or edit this character.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {member.equipment.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 rounded-md bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-slate-500 dark:text-slate-400 ml-2">
                            {[item.range, item.shots && `${item.shots}sh`, item.damage && `Dmg ${item.damage}`, item.traits]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            dispatch({
                              type: 'UNEQUIP_TO_STASH',
                              crewId: member.id,
                              itemId: item.id,
                            })
                          }
                          title="Move to Stash"
                          className="shrink-0 inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          <ArrowRightToLine className="w-3 h-3" /> Stash
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Injuries & Tags & Notes */}
              {member.injuries.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {member.injuries.map((inj, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/30"
                    >
                      <ShieldAlert className="w-3 h-3" /> {inj}
                    </span>
                  ))}
                </div>
              )}

              {member.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {member.tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {member.notes && (
                <p className="text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                  {member.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <CrewEditModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(member) => {
            dispatch({ type: 'UPSERT_CREW', member });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function CrewEditModal({
  initial,
  onClose,
  onSave,
}: {
  initial: CrewMember;
  onClose: () => void;
  onSave: (member: CrewMember) => void;
}) {
  const [form, setForm] = useState<CrewMember>(initial);
  const [injuriesText, setInjuriesText] = useState(initial.injuries.join(', '));
  const [tagsText, setTagsText] = useState(initial.tags.join(', '));
  const [newGearName, setNewGearName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      name: form.name.trim() || 'Unnamed Crew',
      injuries: injuriesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      tags: tagsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  const addQuickGear = () => {
    if (!newGearName.trim()) return;
    setForm((f) => ({
      ...f,
      equipment: [
        ...f.equipment,
        { id: createId('eq'), name: newGearName.trim(), category: 'gear', quantity: 1 },
      ],
    }));
    setNewGearName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4 my-8">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">
            {initial.name ? `Edit ${initial.name}` : 'New Crew Member'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs text-slate-500 mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Species / Origin</label>
              <input
                type="text"
                value={form.species}
                onChange={(e) => setForm({ ...form, species: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Background / Class</label>
              <input
                type="text"
                value={form.background}
                onChange={(e) => setForm({ ...form, background: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as CrewStatus })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
              >
                <option value="active">Active</option>
                <option value="sickbay">Sickbay</option>
                <option value="deceased">Deceased</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            {form.status === 'sickbay' && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">Recovery Turns</label>
                <input
                  type="number"
                  min={0}
                  value={form.recoveryTurns}
                  onChange={(e) => setForm({ ...form, recoveryTurns: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
                />
              </div>
            )}
            <label className="flex items-center gap-2 text-xs pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isLeader}
                onChange={(e) => setForm({ ...form, isLeader: e.target.checked })}
              />
              Leader
            </label>
            <div className="flex gap-3 pb-2">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isBot}
                  onChange={(e) => setForm({ ...form, isBot: e.target.checked })}
                />
                Bot
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isSoulless}
                  onChange={(e) => setForm({ ...form, isSoulless: e.target.checked })}
                />
                Soulless
              </label>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {(
              [
                ['reactions', 'Reactions'],
                ['speed', 'Speed'],
                ['combat', 'Combat'],
                ['toughness', 'Toughness'],
                ['savvy', 'Savvy'],
                ['luck', 'Luck'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="block text-[11px] text-slate-500 mb-1">{label}</label>
                <input
                  type="number"
                  value={form.stats[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stats: { ...form.stats, [key]: Number(e.target.value) },
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-center font-mono"
                />
              </div>
            ))}
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">XP</label>
              <input
                type="number"
                min={0}
                value={form.xp}
                onChange={(e) => setForm({ ...form, xp: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-center font-mono"
              />
            </div>
          </div>

          {/* Quick Gear Add */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Quick-Add Equipment (or assign detailed items from Stash)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newGearName}
                onChange={(e) => setNewGearName(e.target.value)}
                placeholder="e.g., Colony Rifle"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={addQuickGear}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Injuries (comma-separated)</label>
              <input
                type="text"
                value={injuriesText}
                onChange={(e) => setInjuriesText(e.target.value)}
                placeholder="e.g., Scarred, Limp"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Custom Tags (Psionics, Expansion, etc.)
              </label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="e.g., Psionic, Medic"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Character Notes / Backstory</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
            >
              Save Crew Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
