import { structures, demolitionProfiles } from './demolition-data.js?v=explosive-weapons-1';
import { calculateDemolition } from './demolition.js?v=epoch-1';

export const initialDemolitionSelection = Object.freeze({ structure: 'all', weapon: 'all', mode: 'all', shieldCleared: false, jammerDisabled: false });
const isPossible = result => ['demolish', 'health', 'conditional'].includes(result.outcome);

export function getDemolitionSelection(state, stratagems) {
  const structure = structures.find(item => item.id === state.structure);
  if (state.weapon === 'all') {
    if (!structure) return { view: 'empty' };
    const entries = [];
    let unknown = 0;
    let blocked = 0;
    for (const weapon of stratagems) {
      const profile = demolitionProfiles[weapon.id];
      // Keep each firing mode's result separate; an unverified mode is never
      // promoted to a viable attack by another mode of the same stratagem.
      const attacks = (profile?.modes || []).map(mode => ({ mode, result: calculateDemolition(structure, profile, mode, state) }));
      const viable = attacks.filter(attack => isPossible(attack.result));
      if (viable.length) {
        const outcome = viable.find(attack => attack.result.outcome !== 'conditional')?.result.outcome || 'conditional';
        entries.push({ weapon, profile, attacks: viable, outcome });
      } else if (!attacks.length || attacks.some(attack => attack.result.outcome === 'unknown')) unknown++;
      else blocked++;
    }
    const conditional = entries.filter(entry => entry.outcome === 'conditional').length;
    return { view: 'weapons', structure, entries, possible: entries.length - conditional, conditional, unknown, blocked };
  }

  const weapon = stratagems.find(item => item.id === state.weapon);
  if (!weapon) return { view: 'empty' };
  const profile = demolitionProfiles[weapon.id];
  const mode = profile?.modes.find(item => item.id === state.mode);
  const targets = state.structure === 'all' ? structures : structure ? [structure] : [];
  return {
    view: state.structure === 'all' ? 'all' : 'single', weapon, profile, mode,
    rows: targets.map(target => calculateDemolition(target, profile, mode, state)),
  };
}
