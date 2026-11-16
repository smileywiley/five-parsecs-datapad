import { Campaign } from '../types/campaign';

export function exportCampaignToMarkdown(campaign: Campaign): string {
  const lines: string[] = [];
  lines.push(`# ${campaign.name} — Campaign Journal`);
  lines.push('');
  lines.push(
    `**Turn:** ${campaign.turn} | **Planet:** ${campaign.currentPlanet} | **Credits:** ${campaign.credits} | **Story Points:** ${campaign.storyPoints} | **Rumors:** ${campaign.rumors}`
  );
  if (campaign.activeQuest) {
    lines.push(`**Active Quest:** ${campaign.activeQuest}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Mission Logs');
  lines.push('');
  if (campaign.missions.length === 0) {
    lines.push('_No missions logged yet._');
  } else {
    const sortedMissions = [...campaign.missions].sort((a, b) => a.turn - b.turn);
    for (const m of sortedMissions) {
      lines.push(`### Turn ${m.turn}: ${m.missionType} on ${m.planet} (${m.outcome})`);
      if (m.objective) lines.push(`- **Objective:** ${m.objective}`);
      lines.push(`- **Credits Earned:** ${m.creditsEarned}`);
      if (m.loot) lines.push(`- **Loot:** ${m.loot}`);
      if (m.casualties) lines.push(`- **Casualties:** ${m.casualties}`);
      if (m.report) {
        lines.push('');
        lines.push(m.report);
      }
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');
  lines.push('## Solo Journal Notes');
  lines.push('');
  if (campaign.notes.length === 0) {
    lines.push('_No journal notes yet._');
  } else {
    for (const note of campaign.notes) {
      lines.push(`### [${note.category}] ${note.title}${note.pinned ? ' (Pinned)' : ''}`);
      const meta: string[] = [];
      if (note.links.turn !== undefined) meta.push(`Turn ${note.links.turn}`);
      if (note.links.planet) meta.push(`Planet: ${note.links.planet}`);
      if (note.tags.length > 0) meta.push(`Tags: ${note.tags.join(', ')}`);
      if (meta.length > 0) {
        lines.push(`_${meta.join(' | ')}_`);
      }
      lines.push('');
      lines.push(note.content);
      lines.push('');
    }
  }

  return lines.join('\n');
}
