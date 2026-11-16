import { describe, expect, it } from 'vitest';
import { campaignReducer, AppState } from './campaignReducer';
import { createBlankCampaign, createSampleCampaign } from '../data/sampleCampaign';
import { exportCampaignToJson, parseImportedCampaign } from '../utils/storage';
import { exportCampaignToMarkdown } from '../utils/markdownExport';

describe('campaignReducer & utilities', () => {
  it('adds and switches campaigns', () => {
    const c1 = createBlankCampaign('Alpha');
    const state = campaignReducer({ campaigns: [], activeCampaignId: null }, { type: 'ADD_CAMPAIGN', campaign: c1 });
    expect(state.campaigns).toHaveLength(1);
    expect(state.activeCampaignId).toBe(c1.id);
  });

  it('advances turn, resets checklist, and ticks sickbay recovery', () => {
    const sample = createSampleCampaign();
    const initial: AppState = { campaigns: [sample], activeCampaignId: sample.id };
    const next = campaignReducer(initial, { type: 'NEXT_TURN' });
    const updated = next.campaigns[0];

    expect(updated.turn).toBe(sample.turn + 1);
    expect(updated.turnChecklist.travel).toBe(false);
    expect(updated.turnChecklist.worldSteps).toBe(false);
    const mira = updated.crew.find((m) => m.name.includes('Mira'));
    expect(mira?.recoveryTurns).toBe(0);
    expect(mira?.status).toBe('active');
  });

  it('moves stacked item from stash to crew and back', () => {
    const sample = createSampleCampaign();
    const initial: AppState = { campaigns: [sample], activeCampaignId: sample.id };
    const grenade = sample.stash.find((i) => i.name === 'Frag Grenade')!;
    const vance = sample.crew[0];
    expect(grenade.quantity).toBe(2);

    const afterEquip = campaignReducer(initial, {
      type: 'EQUIP_FROM_STASH',
      itemId: grenade.id,
      crewId: vance.id,
    });
    const cAfterEquip = afterEquip.campaigns[0];
    expect(cAfterEquip.stash.find((i) => i.id === grenade.id)?.quantity).toBe(1);
    const equippedItem = cAfterEquip.crew[0].equipment.find((e) => e.name === 'Frag Grenade')!;
    expect(equippedItem).toBeDefined();
    expect(equippedItem.quantity).toBe(1);

    const afterUnequip = campaignReducer(afterEquip, {
      type: 'UNEQUIP_TO_STASH',
      crewId: vance.id,
      itemId: equippedItem.id,
    });
    const cAfterUnequip = afterUnequip.campaigns[0];
    expect(cAfterUnequip.crew[0].equipment.some((e) => e.id === equippedItem.id)).toBe(false);
    expect(cAfterUnequip.stash.filter((i) => i.name === 'Frag Grenade')).toHaveLength(2);
  });

  it('pays ship debt and deducts credits', () => {
    const sample = createSampleCampaign();
    const initial: AppState = { campaigns: [sample], activeCampaignId: sample.id };
    const next = campaignReducer(initial, {
      type: 'PAY_SHIP_DEBT',
      amount: 5,
      deductCredits: true,
    });
    expect(next.campaigns[0].ship.debt).toBe(sample.ship.debt - 5);
    expect(next.campaigns[0].credits).toBe(sample.credits - 5);
  });

  it('exports and imports JSON and exports Markdown journal', () => {
    const sample = createSampleCampaign();
    const json = exportCampaignToJson(sample);
    const parsed = parseImportedCampaign(json);
    expect(parsed.name).toBe(sample.name);
    expect(parsed.notes).toHaveLength(sample.notes.length);

    const md = exportCampaignToMarkdown(sample);
    expect(md).toContain(`# ${sample.name} — Campaign Journal`);
    expect(md).toContain('## Mission Logs');
    expect(md).toContain('## Solo Journal Notes');
  });
});
