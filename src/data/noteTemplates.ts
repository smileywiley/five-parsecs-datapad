import { NoteCategory } from '../types/campaign';

export interface NoteTemplate {
  id: string;
  label: string;
  category: NoteCategory;
  defaultTitle: string;
  content: string;
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'scene-prompt',
    label: 'Scene Prompt',
    category: 'Session Notes',
    defaultTitle: 'Scene: ',
    content: `### Scene Setup
- **Goal:** What is the crew trying to accomplish right now?
- **Expectation:** What is the most likely outcome if nothing goes wrong?
- **Twist / Complication:** What changed, or what did the dice/world throw at them?

### What Happened
> Write the scene narrative here...

### Clues & Fallout
- `,
  },
  {
    id: 'story-thread',
    label: 'Story Thread',
    category: 'Threads',
    defaultTitle: 'Thread: ',
    content: `### Hook
Why does this matter to the crew?

### Clues Discovered
- [ ] Clue 1
- [ ] Clue 2

### Suspects / Factions Involved
- 

### Current Status
*Open* — Next lead:`,
  },
  {
    id: 'location',
    label: 'Location',
    category: 'Locations',
    defaultTitle: 'Location: ',
    content: `### First Impression & Vibe
Sensory details (sights, sounds, smells, lighting):

### Notable Features & Traits
- 

### Who Holds Power Here?
- 

### Secrets / Rumors
- `,
  },
  {
    id: 'npc',
    label: 'NPC Profile',
    category: 'NPCs',
    defaultTitle: 'NPC: ',
    content: `### Role & Appearance
- **Faction / Affiliation:** 
- **First Impression:** 

### Motivation & Leverage
- **What do they want?** 
- **What do they fear or owe?** 

### Quirks & Dialogue Notes
- `,
  },
];
