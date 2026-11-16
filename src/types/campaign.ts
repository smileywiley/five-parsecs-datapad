export type CrewStatus = 'active' | 'sickbay' | 'deceased' | 'retired';

export type ItemCategory = 'weapon' | 'armor' | 'gear' | 'consumable' | 'ship_part' | 'trade_good';

export interface GearItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  range?: string;
  shots?: string;
  damage?: string;
  traits?: string;
  notes?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  species: string;
  background: string;
  status: CrewStatus;
  recoveryTurns: number;
  isLeader: boolean;
  isBot: boolean;
  isSoulless: boolean;
  stats: {
    reactions: number;
    speed: number;
    combat: number;
    toughness: number;
    savvy: number;
    luck: number;
  };
  xp: number;
  equipment: GearItem[];
  injuries: string[];
  tags: string[];
  notes: string;
}

export interface ShipUpgrade {
  id: string;
  name: string;
  notes: string;
}

export interface Ship {
  name: string;
  hullType: string;
  hullCurrent: number;
  hullMax: number;
  debt: number;
  traits: string[];
  upgrades: ShipUpgrade[];
  notes: string;
}

export type PatronStatus = 'active' | 'exhausted' | 'lost';

export interface Patron {
  id: string;
  name: string;
  faction: string;
  planet: string;
  persistent: boolean;
  status: PatronStatus;
  benefits: string;
  notes: string;
}

export type RivalStatus = 'active' | 'tracking' | 'defeated';

export interface Rival {
  id: string;
  name: string;
  threatType: string;
  planet: string;
  status: RivalStatus;
  notes: string;
}

export type MissionType =
  | 'Opportunity'
  | 'Patron'
  | 'Quest'
  | 'Rival Attack'
  | 'Invasion'
  | 'Other';

export type MissionOutcome = 'Victory' | 'Defeat' | 'Fled' | 'In Progress';

export interface MissionLog {
  id: string;
  turn: number;
  planet: string;
  missionType: MissionType;
  objective: string;
  outcome: MissionOutcome;
  creditsEarned: number;
  loot: string;
  casualties: string;
  report: string;
  createdAt: string;
}

export type NoteCategory =
  | 'Threads'
  | 'Locations'
  | 'NPCs'
  | 'Lore'
  | 'Session Notes';

export interface NoteLinks {
  turn?: number;
  planet?: string;
  patronId?: string;
  rivalId?: string;
}

export interface CampaignNote {
  id: string;
  title: string;
  category: NoteCategory;
  content: string;
  pinned: boolean;
  tags: string[];
  links: NoteLinks;
  updatedAt: string;
}

export interface TurnChecklist {
  travel: boolean;
  worldSteps: boolean;
  battle: boolean;
  postBattle: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  turn: number;
  credits: number;
  storyPoints: number;
  rumors: number;
  currentPlanet: string;
  planetTraits: string;
  invasionThreat: boolean;
  activeQuest: string;
  turnChecklist: TurnChecklist;
  ship: Ship;
  crew: CrewMember[];
  stash: GearItem[];
  patrons: Patron[];
  rivals: Rival[];
  missions: MissionLog[];
  notes: CampaignNote[];
  updatedAt: string;
}

export type NavTab =
  | 'dashboard'
  | 'crew'
  | 'ship'
  | 'stash'
  | 'contacts'
  | 'missions'
  | 'notes';
