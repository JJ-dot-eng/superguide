import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { additionalEnemies } from '../dist/combat-enemies-additional.js';
import { enemies, enemyTypeCount, weaponProfiles } from '../dist/combat-data.js';
import { calculateRoute, calculateMatchup } from '../dist/combat.js';
import { combatImages } from '../dist/combat-images.js';
import { pickerEnemyImages } from '../dist/selector-images.js';
import { factionGuides } from '../dist/faction-data.js';
import { factionRecommendation, renderFactionGuide } from '../dist/faction-guide.js';
import { stratagems, categories } from '../dist/data.js';
import { wikiIcons } from '../dist/wiki-icons.js';
import { initCombat } from '../dist/combat-ui.js';
import { pickerConfigs } from '../dist/picker-content.js';
import { initImagePickers } from '../dist/image-picker.js';
import { TestDocument } from './test-dom.mjs';

// 2026-09-17 audit of Wiki Nav Enemy's combat-unit rows. Overship is deliberately
// excluded; structures and the retired low-difficulty options are not units here.
// Source: https://helldivers.wiki.gg/wiki/Template:Nav_Enemy (2026-09-17).
const reviewedRoster = ["Agitator","Alpha_Commander","Alpha_Warrior","Annihilator_Tank","Assault_Raider","Barrager_Tank","Berserker","Bile_Spewer","Bile_Spitter","Bile_Titan","Bile_Warrior","Brawler","Brood_Commander","Charger","Charger_Behemoth","Commissar","Conflagration_Devastator","Crescent_Overseer","Crusher","Devastator","Dragonroach","Dropship","Elevated_Overseer","Factory_Strider","Fleshmob","Gatekeeper","Gunship","Harvester","Heavy_Devastator","Hive_Guard","Hive_Lord","Hulk_Bruiser","Hulk_Firebomber","Hulk_Obliterator","Hulk_Scorcher","Hunter","Impaler","Incendiary_MG_Devastator","Incendiary_Rocket_Raider","Jet_Brigade_Commissar","Jet_Brigade_Devastator","Jet_Brigade_Hulk_Bruiser","Jet_Brigade_Hulk_Scorcher","Jet_Brigade_MG_Raider","Jet_Brigade_Trooper","Leviathan","MG_Raider","Marauder","Nursing_Spewer","Obtruder","Overseer","Pouncer","Predator_Hunter","Predator_Stalker","Pyro_Trooper","Radical","Reinforced_Scout_Strider","Rocket_Devastator","Rocket_Raider","Rupture_Charger","Rupture_Spewer","Rupture_Warrior","Scavenger","Scout_Strider","Shredder_Tank","Shrieker","Spore_Burst_Bile_Titan","Spore_Burst_Hunter","Spore_Burst_Scavenger","Spore_Burst_Warrior","Spore_Charger","Stalker","Stingray","Trooper","Veracitor","Voteless","Vox_Engine","War_Strider","Warp_Ship","Warrior","Watcher","Wretch"];
assert.deepEqual([...new Set(enemies.map(e => decodeURIComponent(new URL(e.source).pathname.split('/wiki/')[1])))].sort(), reviewedRoster, 'Every reviewed Wiki combat unit must remain registered');
const missing = ['scavenger', 'bile-spitter', 'pouncer', 'spore-burst-scavenger', 'spore-burst-hunter', 'trooper', 'brawler', 'commissar', 'rocket-raider', 'assault-raider', 'marauder', 'mg-raider', 'jet-brigade-commissar', 'jet-brigade-trooper', 'jet-brigade-mg-raider', 'pyro-trooper', 'incendiary-rocket-raider', 'obtruder'];
assert.deepEqual(additionalEnemies.map(e => e.id), missing);
assert.equal(enemies.length, 84);
assert.equal(enemyTypeCount, 82);
const enemy = id => enemies.find(e => e.id === id);
const shot = (standard, ap = 3, durable = standard) => ({ standard, durable, ap, explosion: 0, explosionAp: 0 });
const hit = (id, part, mode) => calculateRoute(enemy(id), enemy(id).parts.find(p => p.id === part), mode);
for (const id of missing) {
  const e = enemy(id);
  assert(e && e.checkedAt === '2026-09-17' && e.sourceRevision > 0, id);
  assert(pickerEnemyImages[id]?.src, `Missing portrait ${id}`);
  assert.deepEqual(Object.keys(combatImages[id]), e.parts.map(p => p.id), id);
}

assert.equal(hit('trooper', 'head', shot(55)).hits, 1);
assert.equal(hit('brawler', 'head', shot(55)).hits, 3, 'Brawler head shares 125 Main HP; it is not a 40-HP Trooper head');
assert.equal(hit('brawler', 'head', shot(55)).via, 'main');
assert.equal(hit('brawler', 'left-arm', shot(55)).outcome, 'kill');
assert.equal(hit('brawler', 'right-arm', shot(55)).outcome, 'break');
assert.equal(hit('trooper', 'torso', shot(100, 1)).hits, 1);
assert.equal(hit('commissar', 'torso', shot(100, 1)).hits, 2, 'Equal armor applies 65% damage');
assert.equal(hit('jet-brigade-commissar', 'torso', shot(100, 1)).hits, 1, 'Jet Commissar has AV0, not standard Commissar AV1');
assert.equal(hit('marauder', 'torso', shot(100, 1)).outcome, 'blocked');
assert.equal(hit('marauder', 'torso', shot(100, 2)).hits, 2);
assert.equal(hit('marauder', 'head', shot(100, 1)).hits, 1);
assert.equal(hit('scavenger', 'leg', shot(30)).outcome, 'break');
for (const id of ['bile-spitter', 'pouncer']) assert.equal(hit(id, 'leg', shot(30)).outcome, 'kill', 'These Wiki limbs are fatal, unlike Scavenger limbs');

assert.equal(hit('predator-hunter', 'body', weaponProfiles.stalwart.modes[0]).hits, 2);
assert.equal(hit('spore-burst-hunter', 'body', weaponProfiles.stalwart.modes[0]).hits, 3, 'The 35% durable body must not use ordinary Hunter damage');
assert.equal(hit('spore-burst-hunter', 'leg', shot(60, 3, 0)).hits, 2, 'Leg durability is 25%');
assert.equal(hit('spore-burst-hunter', 'leg', shot(60, 3, 0)).outcome, 'break');
assert.equal(hit('spore-burst-hunter', 'head', shot(40, 3, 0)).hits, 1);
for (const id of ['assault-raider','jet-brigade-commissar','jet-brigade-trooper','jet-brigade-mg-raider']) {
  assert.equal(hit(id, 'jetpack', shot(50)).outcome, 'bleed', 'Do not add unverified secondary fire/explosion damage');
  assert.equal(hit(id, 'jetpack', shot(200)).outcome, 'kill');
}
for (const [id, device] of [['mg-raider','backpack'],['pyro-trooper','fuel-tanks']]) {
  assert.equal(hit(id, device, shot(2000)).outcome, 'unknown');
  assert.match(hit(id, device, shot(2000)).reason, /별도 본체/);
  assert.equal(hit(id, 'torso', shot(100)).outcome, 'kill', 'An unresolved device must not disable known body routes');
}
assert.equal(hit('obtruder', 'body', shot(100)).hits, 4);
assert.equal(hit('obtruder', 'eye', shot(100)).hits, 3);
assert.equal(hit('obtruder', 'eye', shot(100)).outcome, 'break', 'Eye overlap is not silently treated as three simultaneous hitboxes');
assert.equal(hit('obtruder', 'vertical-fin', shot(2000)).outcome, 'break', 'Transfer cap prevents an overkill fin shot from exhausting Main');
const c4 = hit('obtruder', 'eye', weaponProfiles['c4-pack'].modes[0]);
assert.equal(c4.outcome, 'kill');
assert.equal(c4.stages[0].damage.explosion, 0);
assert.equal(c4.stages[0].damage.mainExplosion, 2000, 'ExDR100 redirects one explosion to Main; not to every hitbox');
for (const e of additionalEnemies) {
  const result = calculateMatchup(e, weaponProfiles['solo-silo'].modes[0]);
  assert.equal(result.rows.length, e.parts.length);
  assert(result.best && result.best.outcome === 'kill', `${e.id}: composite explosions remain supported`);
}

const unit = id => factionGuides.flatMap(g => g.units).find(u => u.enemy === id);
for (const id of ['spore-burst-scavenger','spore-burst-hunter']) {
  assert.deepEqual(unit(id).weapons.slice(0,2), ['flamethrower','cremator']);
  assert(factionRecommendation(unit(id),'flamethrower').adviceOnly);
  assert.equal(factionRecommendation(unit(id),'stalwart').row.target.id, 'body');
}
for (const id of ['assault-raider','jet-brigade-commissar','jet-brigade-trooper','jet-brigade-mg-raider','pyro-trooper','incendiary-rocket-raider','obtruder']) {
  assert(unit(id), `Missing faction unit ${id}`);
  assert.equal(factionRecommendation(unit(id),unit(id).weapons[0]).row.outcome, 'kill');
}
for (const id of ['spore-burst','jet-brigade','incineration','appropriators']) {
  assert.doesNotMatch(renderFactionGuide(factionGuides.find(g=>g.id===id),stratagems,wikiIcons), /계산 미등록|추천 계산에서 제외|일반 보병 변종은 포함하지/);
}

const previous = globalThis.document;
try {
  const doc = new TestDocument(await readFile(new URL('../dist/index.html',import.meta.url),'utf8'));
  globalThis.document = doc;
  const combat = initCombat({stratagems,wikiIcons,navigate(){}});
  const {dialog} = initImagePickers(pickerConfigs({stratagems,categories,wikiIcons}), {document:doc});
  for (const e of additionalEnemies) {
    combat.openMatchup({enemy:e.id,weapon:'stalwart',mode:'standard'});
    assert.equal(doc.getElementById('combat-enemy').value,e.id);
    assert.match(doc.getElementById('combat-enemy-info').innerHTML,new RegExp(e.name));
    assert.match(doc.getElementById('combat-sources').innerHTML,/적 자료 확인 2026-09-17/);
    const trigger = doc.getElementById('combat-enemy-picker');
    trigger.dispatchEvent({type:'click',target:trigger});
    const input=dialog.querySelector('input');
    input.value=e.name; input.dispatchEvent({type:'input'});
    const grid=dialog.querySelector('.picker-grid');
    const button=grid.querySelectorAll('button').find(b=>b.dataset.pickerValue===e.id);
    assert(button,`${e.id}: searchable picker entry`);
    assert.equal(button.querySelector('img').getAttribute('src'),pickerEnemyImages[e.id].src);
    grid.dispatchEvent({type:'click',target:button});
    assert.equal(dialog.open,false);
    assert.equal(doc.getElementById('combat-enemy').value,e.id);
  }
} finally {globalThis.document=previous;}
console.log('PASS: all 18 missing units, distinct armor/durability/fatal conditions, equipment boundaries, 84 picker entries and faction integration.');
