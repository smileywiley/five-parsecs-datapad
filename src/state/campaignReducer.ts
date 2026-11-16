import {
  Campaign,
  CampaignNote,
  CrewMember,
  GearItem,
  MissionLog,
  Patron,
  Rival,
  Ship,
} from '../types/campaign';
import { createId } from '../data/sampleCampaign';

export interface AppState {
  campaigns: Campaign[];
  activeCampaignId: string | null;
}

export type CampaignAction =
  | { type: 'SET_ACTIVE_CAMPAIGN'; id: string }
  | { type: 'ADD_CAMPAIGN'; campaign: Campaign }
  | { type: 'DELETE_CAMPAIGN'; id: string }
  | { type: 'IMPORT_CAMPAIGN'; campaign: Campaign }
  | { type: 'UPDATE_CAMPAIGN'; patch: Partial<Campaign> }
  | { type: 'NEXT_TURN' }
  | { type: 'UPDATE_SHIP'; patch: Partial<Ship> }
  | { type: 'PAY_SHIP_DEBT'; amount: number; deductCredits: boolean }
  | { type: 'UPSERT_CREW'; member: CrewMember }
  | { type: 'DELETE_CREW'; id: string }
  | { type: 'UNEQUIP_TO_STASH'; crewId: string; itemId: string }
  | { type: 'UPSERT_STASH_ITEM'; item: GearItem }
  | { type: 'DELETE_STASH_ITEM'; id: string }
  | { type: 'EQUIP_FROM_STASH'; itemId: string; crewId: string }
  | { type: 'UPSERT_PATRON'; patron: Patron }
  | { type: 'DELETE_PATRON'; id: string }
  | { type: 'UPSERT_RIVAL'; rival: Rival }
  | { type: 'DELETE_RIVAL'; id: string }
  | { type: 'UPSERT_MISSION'; mission: MissionLog }
  | { type: 'DELETE_MISSION'; id: string }
  | { type: 'UPSERT_NOTE'; note: CampaignNote }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'TOGGLE_PIN_NOTE'; id: string };

function updateActive(
  state: AppState,
  updater: (campaign: Campaign) => Campaign
): AppState {
  if (!state.activeCampaignId) return state;
  const now = new Date().toISOString();
  return {
    ...state,
    campaigns: state.campaigns.map((c) =>
      c.id === state.activeCampaignId ? { ...updater(c), updatedAt: now } : c
    ),
  };
}

function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const exists = list.some((x) => x.id === item.id);
  return exists ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];
}

export function campaignReducer(state: AppState, action: CampaignAction): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_CAMPAIGN':
      return { ...state, activeCampaignId: action.id };

    case 'ADD_CAMPAIGN':
      return {
        campaigns: [action.campaign, ...state.campaigns],
        activeCampaignId: action.campaign.id,
      };

    case 'DELETE_CAMPAIGN': {
      const remaining = state.campaigns.filter((c) => c.id !== action.id);
      const nextActive =
        state.activeCampaignId === action.id ? remaining[0]?.id ?? null : state.activeCampaignId;
      return { campaigns: remaining, activeCampaignId: nextActive };
    }

    case 'IMPORT_CAMPAIGN': {
      const newCampaign = { ...action.campaign, id: createId('camp') };
      return {
        campaigns: [newCampaign, ...state.campaigns],
        activeCampaignId: newCampaign.id,
      };
    }

    case 'UPDATE_CAMPAIGN':
      return updateActive(state, (c) => ({ ...c, ...action.patch }));

    case 'NEXT_TURN':
      return updateActive(state, (c) => ({
        ...c,
        turn: c.turn + 1,
        turnChecklist: {
          travel: false,
          worldSteps: false,
          battle: false,
          postBattle: false,
        },
        crew: c.crew.map((member) => {
          if (member.status !== 'sickbay') return member;
          const nextTurns = Math.max(0, member.recoveryTurns - 1);
          return {
            ...member,
            recoveryTurns: nextTurns,
            status: nextTurns === 0 ? 'active' : 'sickbay',
          };
        }),
      }));

    case 'UPDATE_SHIP':
      return updateActive(state, (c) => ({
        ...c,
        ship: { ...c.ship, ...action.patch },
      }));

    case 'PAY_SHIP_DEBT':
      return updateActive(state, (c) => {
        const pay = Math.max(0, Math.min(action.amount, c.ship.debt));
        if (action.deductCredits && pay > c.credits) return c;
        return {
          ...c,
          credits: action.deductCredits ? c.credits - pay : c.credits,
          ship: { ...c.ship, debt: c.ship.debt - pay },
        };
      });

    case 'UPSERT_CREW':
      return updateActive(state, (c) => ({
        ...c,
        crew: upsertById(c.crew, action.member),
      }));

    case 'DELETE_CREW':
      return updateActive(state, (c) => ({
        ...c,
        crew: c.crew.filter((m) => m.id !== action.id),
      }));

    case 'UNEQUIP_TO_STASH':
      return updateActive(state, (c) => {
        const member = c.crew.find((m) => m.id === action.crewId);
        const item = member?.equipment.find((e) => e.id === action.itemId);
        if (!member || !item) return c;
        return {
          ...c,
          crew: c.crew.map((m) =>
            m.id === action.crewId
              ? { ...m, equipment: m.equipment.filter((e) => e.id !== action.itemId) }
              : m
          ),
          stash: [{ ...item, id: createId('item') }, ...c.stash],
        };
      });

    case 'UPSERT_STASH_ITEM':
      return updateActive(state, (c) => ({
        ...c,
        stash: upsertById(c.stash, action.item),
      }));

    case 'DELETE_STASH_ITEM':
      return updateActive(state, (c) => ({
        ...c,
        stash: c.stash.filter((i) => i.id !== action.id),
      }));

    case 'EQUIP_FROM_STASH':
      return updateActive(state, (c) => {
        const item = c.stash.find((i) => i.id === action.itemId);
        const member = c.crew.find((m) => m.id === action.crewId);
        if (!item || !member) return c;

        const nextStash =
          item.quantity > 1
            ? c.stash.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
            : c.stash.filter((i) => i.id !== item.id);

        const equippedCopy: GearItem = { ...item, id: createId('eq'), quantity: 1 };

        return {
          ...c,
          stash: nextStash,
          crew: c.crew.map((m) =>
            m.id === action.crewId ? { ...m, equipment: [...m.equipment, equippedCopy] } : m
          ),
        };
      });

    case 'UPSERT_PATRON':
      return updateActive(state, (c) => ({
        ...c,
        patrons: upsertById(c.patrons, action.patron),
      }));

    case 'DELETE_PATRON':
      return updateActive(state, (c) => ({
        ...c,
        patrons: c.patrons.filter((p) => p.id !== action.id),
      }));

    case 'UPSERT_RIVAL':
      return updateActive(state, (c) => ({
        ...c,
        rivals: upsertById(c.rivals, action.rival),
      }));

    case 'DELETE_RIVAL':
      return updateActive(state, (c) => ({
        ...c,
        rivals: c.rivals.filter((r) => r.id !== action.id),
      }));

    case 'UPSERT_MISSION':
      return updateActive(state, (c) => ({
        ...c,
        missions: upsertById(c.missions, action.mission),
      }));

    case 'DELETE_MISSION':
      return updateActive(state, (c) => ({
        ...c,
        missions: c.missions.filter((m) => m.id !== action.id),
      }));

    case 'UPSERT_NOTE':
      return updateActive(state, (c) => ({
        ...c,
        notes: upsertById(c.notes, action.note),
      }));

    case 'DELETE_NOTE':
      return updateActive(state, (c) => ({
        ...c,
        notes: c.notes.filter((n) => n.id !== action.id),
      }));

    case 'TOGGLE_PIN_NOTE':
      return updateActive(state, (c) => ({
        ...c,
        notes: c.notes.map((n) => (n.id === action.id ? { ...n, pinned: !n.pinned } : n)),
      }));

    default:
      return state;
  }
}
