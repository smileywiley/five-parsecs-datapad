import React, { useState } from 'react';
import { Package, Plus, Search, Trash2, UserCheck, X } from 'lucide-react';
import { useCampaign } from '../state/CampaignContext';
import { GearItem, ItemCategory } from '../types/campaign';
import { createId } from '../data/sampleCampaign';

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  weapon: 'Weapon',
  armor: 'Armor / Screen',
  gear: 'Gear',
  consumable: 'Consumable',
  ship_part: 'Ship Part',
  trade_good: 'Trade Good',
};

function emptyItem(): GearItem {
  return {
    id: createId('item'),
    name: '',
    category: 'weapon',
    quantity: 1,
    range: '',
    shots: '',
    damage: '',
    traits: '',
    notes: '',
  };
}

export function StashView() {
  const { activeCampaign, dispatch } = useCampaign();
  const [filterCat, setFilterCat] = useState<ItemCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [modalItem, setModalItem] = useState<GearItem | null>(null);
  const [equipTarget, setEquipTarget] = useState<Record<string, string>>({});

  if (!activeCampaign) return null;

  const activeCrew = activeCampaign.crew.filter(
    (m) => m.status === 'active' || m.status === 'sickbay'
  );

  const filtered = activeCampaign.stash.filter((item) => {
    if (filterCat !== 'all' && item.category !== filterCat) return false;
    if (
      search.trim() &&
      !item.name.toLowerCase().includes(search.toLowerCase()) &&
      !(item.traits ?? '').toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleEquip = (itemId: string) => {
    const crewId = equipTarget[itemId] || activeCrew[0]?.id;
    if (!crewId) return;
    dispatch({ type: 'EQUIP_FROM_STASH', itemId, crewId });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterCat('all')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
              filterCat === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All ({activeCampaign.stash.length})
          </button>
          {(Object.keys(CATEGORY_LABELS) as ItemCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                filterCat === cat
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter stash..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
          </div>
          <button
            onClick={() => setModalItem(emptyItem())}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <Package className="w-6 h-6 mx-auto mb-2 opacity-50" />
          No items in stash matching your filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
                          ×{item.quantity}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono uppercase text-cyan-600 dark:text-cyan-400">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setModalItem(item)}
                      className="text-xs text-slate-500 hover:text-cyan-500 px-2 py-1 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'DELETE_STASH_ITEM', id: item.id })}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 space-y-0.5">
                  {(item.range || item.shots || item.damage || item.traits) && (
                    <div>
                      {[
                        item.range && `Range ${item.range}`,
                        item.shots && `Shots ${item.shots}`,
                        item.damage && `Dmg ${item.damage}`,
                        item.traits,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  )}
                  {item.notes && <div className="italic">{item.notes}</div>}
                </div>
              </div>

              {activeCrew.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <select
                    value={equipTarget[item.id] ?? activeCrew[0].id}
                    onChange={(e) =>
                      setEquipTarget({ ...equipTarget, [item.id]: e.target.value })
                    }
                    className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-xs"
                  >
                    {activeCrew.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleEquip(item.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Equip
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalItem && (
        <ItemModal
          initial={modalItem}
          onClose={() => setModalItem(null)}
          onSave={(item) => {
            dispatch({ type: 'UPSERT_STASH_ITEM', item });
            setModalItem(null);
          }}
        />
      )}
    </div>
  );
}

function ItemModal({
  initial,
  onClose,
  onSave,
}: {
  initial: GearItem;
  onClose: () => void;
  onSave: (item: GearItem) => void;
}) {
  const [form, setForm] = useState<GearItem>(initial);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, name: form.name.trim() || 'Unnamed Item' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">
            {initial.name ? `Edit ${initial.name}` : 'Add Stash Item'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-slate-500 mb-1">Item Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Qty</label>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ItemCategory })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-sm"
            >
              {(Object.keys(CATEGORY_LABELS) as ItemCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-500 mb-1">Range</label>
              <input
                type="text"
                value={form.range ?? ''}
                onChange={(e) => setForm({ ...form, range: e.target.value })}
                placeholder='e.g. 24"'
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1.5"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Shots</label>
              <input
                type="text"
                value={form.shots ?? ''}
                onChange={(e) => setForm({ ...form, shots: e.target.value })}
                placeholder="e.g. 1"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1.5"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Damage</label>
              <input
                type="text"
                value={form.damage ?? ''}
                onChange={(e) => setForm({ ...form, damage: e.target.value })}
                placeholder="e.g. +1"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Traits</label>
            <input
              type="text"
              value={form.traits ?? ''}
              onChange={(e) => setForm({ ...form, traits: e.target.value })}
              placeholder="e.g., Heavy, Area, 5+ Save"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Notes</label>
            <textarea
              rows={2}
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold cursor-pointer"
            >
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
