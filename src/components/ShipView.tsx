import { useState } from 'react';
import { CreditCard, Plus, Rocket, Trash2, Wrench } from 'lucide-react';
import { useCampaign } from '../state/CampaignContext';
import { createId } from '../data/sampleCampaign';

export function ShipView() {
  const { activeCampaign, dispatch } = useCampaign();
  const [newTrait, setNewTrait] = useState('');
  const [upgName, setUpgName] = useState('');
  const [upgNotes, setUpgNotes] = useState('');
  const [payAmount, setPayAmount] = useState(1);
  const [deductCredits, setDeductCredits] = useState(true);

  if (!activeCampaign) return null;
  const { ship } = activeCampaign;
  const hullPct = ship.hullMax > 0 ? Math.min(100, Math.round((ship.hullCurrent / ship.hullMax) * 100)) : 0;

  const addTrait = () => {
    if (!newTrait.trim()) return;
    dispatch({ type: 'UPDATE_SHIP', patch: { traits: [...ship.traits, newTrait.trim()] } });
    setNewTrait('');
  };

  const removeTrait = (idx: number) => {
    dispatch({
      type: 'UPDATE_SHIP',
      patch: { traits: ship.traits.filter((_, i) => i !== idx) },
    });
  };

  const addUpgrade = () => {
    if (!upgName.trim()) return;
    dispatch({
      type: 'UPDATE_SHIP',
      patch: {
        upgrades: [
          ...ship.upgrades,
          { id: createId('upg'), name: upgName.trim(), notes: upgNotes.trim() },
        ],
      },
    });
    setUpgName('');
    setUpgNotes('');
  };

  const removeUpgrade = (id: string) => {
    dispatch({
      type: 'UPDATE_SHIP',
      patch: { upgrades: ship.upgrades.filter((u) => u.id !== id) },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ship Profile & Hull */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
            <Rocket className="w-4 h-4" /> Ship Registry
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Ship Name</label>
              <input
                type="text"
                value={ship.name}
                onChange={(e) => dispatch({ type: 'UPDATE_SHIP', patch: { name: e.target.value } })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Hull Type</label>
              <input
                type="text"
                value={ship.hullType}
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_SHIP', patch: { hullType: e.target.value } })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          {/* Hull Integrity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300">Hull Points</span>
              <span className="font-mono font-bold">
                {ship.hullCurrent} / {ship.hullMax} ({hullPct}%)
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  hullPct > 50 ? 'bg-emerald-500' : hullPct > 25 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${hullPct}%` }}
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Current:</span>
                <input
                  type="number"
                  min={0}
                  max={ship.hullMax}
                  value={ship.hullCurrent}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_SHIP',
                      patch: { hullCurrent: Math.max(0, Number(e.target.value)) },
                    })
                  }
                  className="w-16 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-xs font-mono text-center"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Max:</span>
                <input
                  type="number"
                  min={1}
                  value={ship.hullMax}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_SHIP',
                      patch: { hullMax: Math.max(1, Number(e.target.value)) },
                    })
                  }
                  className="w-16 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-xs font-mono text-center"
                />
              </div>
            </div>
          </div>

          {/* Ship Traits */}
          <div className="space-y-2">
            <label className="block text-xs text-slate-500">Ship Traits</label>
            <div className="flex flex-wrap gap-1.5">
              {ship.traits.map((trait, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  {trait}
                  <button
                    onClick={() => removeTrait(i)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTrait())}
                placeholder="Add ship trait..."
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-xs"
              />
              <button
                onClick={addTrait}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </section>

        {/* Ship Debt & Notes */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Ship Debt & Maintenance
          </h2>

          <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500">Remaining Debt</div>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {ship.debt} cr
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={ship.debt}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_SHIP',
                    patch: { debt: Math.max(0, Number(e.target.value)) },
                  })
                }
                className="w-20 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-mono"
              />
              <span className="text-xs text-slate-400">Direct edit</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                min={1}
                value={payAmount}
                onChange={(e) => setPayAmount(Math.max(1, Number(e.target.value)))}
                className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-xs font-mono"
              />
              <button
                onClick={() =>
                  dispatch({ type: 'PAY_SHIP_DEBT', amount: payAmount, deductCredits })
                }
                disabled={ship.debt === 0 || (deductCredits && activeCampaign.credits < payAmount)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
              >
                Make Payment
              </button>
              <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deductCredits}
                  onChange={(e) => setDeductCredits(e.target.checked)}
                />
                Deduct from Credits ({activeCampaign.credits} cr)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Ship Log / Quirks</label>
            <textarea
              rows={4}
              value={ship.notes}
              onChange={(e) => dispatch({ type: 'UPDATE_SHIP', patch: { notes: e.target.value } })}
              placeholder="Mechanical quirks, cargo manifest notes, transponder IDs..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs"
            />
          </div>
        </section>
      </div>

      {/* Ship Upgrades */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <h2 className="text-sm font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <Wrench className="w-4 h-4" /> Ship Upgrades & Components
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            value={upgName}
            onChange={(e) => setUpgName(e.target.value)}
            placeholder="Upgrade name (e.g., Med-bay)"
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs"
          />
          <input
            type="text"
            value={upgNotes}
            onChange={(e) => setUpgNotes(e.target.value)}
            placeholder="Effect or notes..."
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs"
          />
          <button
            onClick={addUpgrade}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Install Upgrade
          </button>
        </div>

        {ship.upgrades.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No ship upgrades installed yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {ship.upgrades.map((u) => (
              <div
                key={u.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3"
              >
                <div>
                  <div className="text-sm font-semibold">{u.name}</div>
                  {u.notes && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{u.notes}</div>}
                </div>
                <button
                  onClick={() => removeUpgrade(u.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
