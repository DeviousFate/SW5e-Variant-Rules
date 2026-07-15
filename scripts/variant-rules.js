const MODULE_ID = "sw5e-variant-rules";
const SOURCE_URL = "https://sw5e.com/rules/variantRules";
const SW5E_SETTING_NAMESPACES = ["sw5e-module", "sw5e"];
const RECENT_HUNTED_CASTS = new Map();
const RECENT_ALIGNMENT_CASTS = new Map();
const ELEVATION_LEVELS = {
  1: { label: "Dominance", minimum: 10, bonus: 2 },
  2: { label: "Superdominance", minimum: 20, bonus: 3 },
  3: { label: "Hyperdominance", minimum: 30, bonus: 5 }
};

const FORCE_ALIGNMENT_DEFAULT = {
  value: 0,
  seenPowers: { lgt: {}, drk: {} },
  resolvedMinorTiers: { benevolence: {}, corruption: {} },
  minorTraits: [],
  deedLog: []
};

const FORCE_ALIGNMENT_MINOR_TABLES = {
  benevolence: {
    1: [
      "Your eyes brighten in satisfaction.",
      "Your body is less likely to scar or show lasting injury.",
      "Your voice becomes slightly more eloquent.",
      "Tame animals are less uneasy around you."
    ],
    2: [
      "Your eyes become more stark and vibrant.",
      "Existing scars fade, and new wounds rarely scar or fester.",
      "Your voice gains a pleasant, melodic cadence.",
      "Your hair gains subtle gold or silver highlights."
    ],
    3: [
      "Your eyes gain flecks of an unusual complimenting color.",
      "Your skin always appears healthy.",
      "You no longer suffer minor natural illnesses and appear in excellent health.",
      "Wild animals are less prone to attack you."
    ],
    4: [
      "Your eyes permanently become an unusual complimenting color.",
      "Your voice becomes naturally calming.",
      "You become nearly immune to natural illnesses.",
      "Your hair gains visible streaks of gold or silver."
    ],
    5: [
      "Your eyes permanently emit a faint glow.",
      "You radiate a calming presence and peace.",
      "Withered or sickly plants liven near you.",
      "You appear 1d10 years younger."
    ]
  },
  corruption: {
    1: [
      "Your eyes become pale yellow when you are angry.",
      "You scar more easily.",
      "Your voice becomes slightly hoarse.",
      "Your hair loses color and gains gray streaks."
    ],
    2: [
      "Your eyes become luminous sulfuric yellow with red rims when you are angry.",
      "Your scars become more noticeable and wounds more pronounced.",
      "Your voice lowers and becomes raspier.",
      "Your hair becomes predominantly gray."
    ],
    3: [
      "Your eyes permanently become luminous sulfuric yellow with red rings.",
      "Your skin loses pigmentation and becomes pale or mottled.",
      "Your veins become increasingly visible.",
      "Your hair becomes stark white."
    ],
    4: [
      "Your eyes become luminous dark orange with red rings.",
      "Your skin becomes nearly stark white and your veins are accentuated.",
      "Your nails or claws wither, grow longer, and turn a vile yellow.",
      "Your hair withers and falls out."
    ],
    5: [
      "Your eyes become luminous blood red with red rings.",
      "You become physically devoid of emotions.",
      "You develop a sickly, uncontrollable cough.",
      "You appear 1d10 years older."
    ]
  }
};

const FORCE_ALIGNMENT_MAJOR_BENEFITS = {
  1: "Spend 1 Force Point to add 1d4 to a Persuasion check to calm, create peace, or ally with a creature within 30 feet.",
  2: "Spend 1 Force Point to let an ally within 30 feet reroll a failed save against being frightened.",
  3: "Spend 1 Force Point to let an ally within 30 feet reroll a natural 1 on an ability check or saving throw.",
  4: "Light powers cost 1 fewer Force Point, and dark powers cost 1 additional Force Point.",
  5: "Luminous Being boon. Roll or assign one boon from the Luminous Being table."
};

const FORCE_ALIGNMENT_MAJOR_CORRUPTIONS = {
  1: "You have advantage on Intimidation checks and disadvantage on Insight checks against creatures with a higher Wisdom.",
  2: "You have advantage on saves against being frightened and disadvantage on saves against being charmed.",
  3: "You have advantage on saves against dark powers, and healing from light powers is halved.",
  4: "Dark powers cost 1 fewer Force Point, and light powers cost 1 additional Force Point.",
  5: "Dark Entity boon. Roll or assign one boon from the Dark Entity table."
};

const RULES = [
  rule("asi-feat", "ASI and a Feat", "character", "Automated", "Characters receiving an Ability Score Improvement can take +1 to one ability score and a feat.", "When enabled, the SW5e module's ASI and Feat setting is turned on. When disabled, it is turned off."),
  rule("aging", "Aging", "character", "Manual", "Characters crossing age thresholds receive GM-chosen or rolled aging quirks and boons.", "The rule depends on species-specific thresholds and GM-selected permanent changes."),
  rule("alternate-casting", "Alternate Casting", "character", "Manual", "Forcecasting and techcasting can be swapped across classes and archetypes, including casting ability, saves, points, and recovery cadence.", "This requires alternate class progression, feature, and power-list data rather than a combat hook."),
  rule("alternative-armor", "Alternative Armor", "combat", "Manual", "Armor shifts from avoidance toward damage reduction, with base AC using proficiency bonus and armor/enhancement bonuses converting into DR.", "SW5e item AC formulas, natural armor, class AC features, and DR application are not represented uniformly enough for safe automatic rewriting."),
  rule("alternative-at-wills-extra-attack", "Alternative At-Wills and Extra Attack", "character", "Manual", "At-will powers scale by caster level instead of character level, and multiclass Extra Attack can combine qualified class levels.", "This touches power scaling, class tables, archetypes, and attack-count logic spread across character build data."),
  rule("ammunition-sizes", "Ammunition Sizes", "inventory", "Manual", "Ammo is split into weapon-damage-size categories instead of broad shared ammunition pools.", "Requires replacement ammunition items and weapon-to-ammo mapping in world or compendium data."),
  rule("bonus-action-consumables", "Bonus Action Consumables", "combat", "Reminder", "Consumables can be used as a bonus action unless their normal activation is already a bonus action.", "The module reports the enabled rule; exact action economy enforcement depends on the item workflow used at the table."),
  rule("bonus-proficiencies", "Bonus Proficiencies", "character", "Manual", "Characters receive additional proficiency choices.", "The choices are character-building decisions with no single automatic target."),
  rule("called-shots", "Called Shots", "combat", "Manual", "Attackers can aim at specific body parts or objects for special effects at increased difficulty.", "Targets, called locations, and GM adjudication are situational."),
  rule("careful-checks", "Careful Checks", "checks", "Reminder", "Characters can take extra time or care to improve some checks when pressure allows.", "Foundry cannot reliably infer whether a check has enough time, risk, or narrative permission."),
  rule("combination-weapons", "Combination Weapons", "inventory", "Manual", "Certain weapons can be built or treated as combined weapon forms.", "This is item data authoring rather than runtime enforcement."),
  rule("compound-advantage", "Compound Advantage", "checks", "Manual", "Multiple sources of advantage and disadvantage can stack instead of canceling to a single state.", "Core roll dialogs and system roll workflows would need deep replacement to avoid double-counting or breaking modules."),
  rule("compound-checks", "Compound Checks", "checks", "Manual", "Multiple checks or contributors can combine into a broader result.", "The applicable participants and result math are GM-adjudicated per scene."),
  rule("critical-saving-throws", "Critical Saving Throws", "checks", "Manual", "Natural 1s and 20s on saving throws have stronger consequences.", "The consequence depends on the power, effect, and save context."),
  rule("crueler-criticals", "Crueler Criticals", "combat", "Automated", "Critical hits maximize one set of damage dice and roll the additional critical dice.", "When enabled, D&D5e Critical Damage Max Dice is turned on. When disabled, it is turned off."),
  rule("defense-rolls", "Defense Rolls", "combat", "Manual", "Players roll defenses instead of enemies rolling attacks against static defenses.", "This inverts the attack workflow and cannot be safely layered over normal SW5e attack resolution."),
  rule("destiny", "Destiny", "character", "Manual", "Characters use destiny-based rewards and spend options.", "Destiny awards and spend timing are narrative campaign management."),
  rule("dismemberment", "Dismemberment", "combat", "Manual", "Major injuries can remove or impair limbs under severe combat outcomes.", "The rule is injury adjudication and character-state narration, not a single mechanical flag."),
  rule("dueling", "Dueling", "combat", "Manual", "Formal duels can use special pacing or restrictions.", "Who is dueling, when outside interference matters, and what constraints apply are narrative state."),
  rule("elevation", "Elevation", "combat", "Automated", "Creatures at sufficient height and horizontal distance gain the Elevation ranged attack bonus.", "Automated for ranged attack rolls against one targeted token. Target cover statuses reduce dominance unless the attacker has a detected Sharpshooter Mastery-style feat. The advantage/disadvantage guidance remains GM-adjudicated."),
  rule("exertion", "Exertion", "combat", "Manual", "Characters can push beyond normal limits at a cost such as exhaustion.", "The trigger and acceptable cost are player and GM choices."),
  rule("flanking", "Flanking", "combat", "Manual", "Positioning around a target can grant combat benefits.", "Reliable automation requires a grid geometry and reach model that matches the table's tokens, sizes, and diagonals."),
  rule("force-alignment", "Force Alignment", "casting", "Automated", "Force power use shifts a character toward light or dark alignment, with tier saves for minor traits.", "Automated for class-sourced light and dark Force powers of 1st level or higher. At-wills, universal powers, tech powers, and detectable non-class sources are ignored. GM deed adjustments and trait logs are available on the SWVR Actor Sheet panel."),
  rule("force-tech-prowess", "Force and Tech Prowess", "character", "Manual", "Characters can develop broader force or tech capability.", "This is feat/feature and power-list progression data."),
  rule("force-bond", "Force-Bond", "theme", "Manual", "Characters can share a force-linked bond with narrative and situational effects.", "The benefit is intentionally relationship- and scene-dependent."),
  rule("gestalt-dichotomous", "Gestalt and Dichotomous Characters", "character", "Manual", "Characters can progress through multiple class structures in nonstandard ways.", "This requires alternate character-builder progression and cannot be inferred from an actor sheet."),
  rule("hunted", "Hunted", "theme", "Automated", "Each player has a Disturbance Point pool that increases when they cast Force powers by the power's level; at-wills count as level 0.", "Automated for SW5E Force powers only. Tech powers are ignored. The log records user, actor, power, disturbance gain, running total, and detected class/feat/other Force-power sources."),
  rule("invocation-versatility", "Invocation Versatility", "character", "Manual", "Characters can replace invocation choices under defined circumstances.", "This is level-up and retraining bookkeeping."),
  rule("longer-rests", "Longer Rests", "resting", "Manual", "Short and long rests take longer or have stricter availability.", "The system rest button can still be clicked; enforcement depends on calendar/timekeeping modules and GM pacing."),
  rule("milestone-leveling", "Milestone Leveling", "character", "Automated", "Characters level by story milestones instead of experience totals.", "When enabled, D&D5e Leveling Mode is set to Level Advancement without XP. When disabled, it is set to Experience Points."),
  rule("overlapping-features", "Overlapping Features", "character", "Manual", "Duplicate or overlapping features are resolved by replacement or non-stacking guidance.", "Feature equivalence and replacement choice are character-specific."),
  rule("replacing-powers", "Replacing Powers", "casting", "Manual", "Characters can replace known powers during advancement or retraining.", "This is a character-maintenance permission, not a runtime event."),
  rule("saving-throw-checks", "Saving Throw Checks", "checks", "Reminder", "Some ability checks can be rolled as saving throws when training or resistance is more appropriate.", "The module can remind GMs, but deciding check type remains contextual."),
  rule("simplified-forcecasting", "Simplified Forcecasting", "casting", "Automated", "Forcecasting can be simplified by using universal forcecasting for light and dark powers.", "When enabled, the SW5e module's Simplified Forcecasting setting is turned on. When disabled, it is turned off."),
  rule("simplified-styles-masteries", "Simplified Styles and Masteries", "character", "Manual", "Fighting styles and masteries can be simplified or consolidated.", "Requires alternate feature lists and compendium data."),
  rule("starship-destiny", "Starship Destiny", "starship", "Manual", "A character's destiny can be tied to a starship with special Destiny Point spend options.", "The rule is campaign-facing and starship-scenario dependent."),
  rule("strenuous-combat", "Strenuous Combat", "combat", "Automated", "At combat end, surviving combatants make a Constitution save against DC 10 plus completed rounds or gain exhaustion.", "Automated when the setting is enabled; rest-based exhaustion recovery remains GM-managed."),
  rule("tactical-initiative", "Tactical Initiative", "combat", "Automated", "Selected allied combatants can form a tactical group whose initiative becomes the lowest member's result.", "Automated with a combat tracker button for selected tokens; communication and later separation remain GM-managed."),
  rule("weapon-sundering", "Weapon Sundering", "combat", "Manual", "Attackers can target weapons, with weapon HP based on damage dice and repair rules.", "Weapon HP and repair state require item-level tracking and target weapon selection that SW5e workflows do not expose consistently."),
  rule("wounds", "Wounds", "combat", "Automated", "When an actor drops to 0 HP, it rolls a Constitution save against a rising DC, gains wounded levels on failure, and receives death-save failures equal to wounded levels.", "Automated for actor HP updates; clearing wounds when restored to maximum HP is also automated.")
];

function rule(id, name, category, automation, summary, implementationNote) {
  return { id, name, category, automation, summary, implementationNote };
}

function enabledRules() {
  return foundry.utils.deepClone(game.settings.get(MODULE_ID, "enabledRules") ?? {});
}

function isEnabled(ruleId) {
  return Boolean(enabledRules()[ruleId]);
}

function useModifiedActorSheet() {
  return Boolean(game.settings.get(MODULE_ID, "useModifiedActorSheet"));
}

function setEnabledRules(values) {
  return game.settings.set(MODULE_ID, "enabledRules", values);
}

async function syncMilestoneLevelingSetting(isEnabledNow) {
  if (!game.settings.settings.has("dnd5e.levelingMode")) {
    ui.notifications.warn("D&D5e Leveling Mode setting was not found; Milestone Leveling could not sync.");
    return;
  }
  const targetMode = isEnabledNow ? "noxp" : "xp";
  const currentMode = game.settings.get("dnd5e", "levelingMode");
  if (currentMode === targetMode) return;
  await game.settings.set("dnd5e", "levelingMode", targetMode);
  const label = isEnabledNow ? "Level Advancement without XP" : "Experience Points";
  ui.notifications.info(`D&D5e Leveling Mode set to ${label}.`);
}

async function syncCruelerCriticalsSetting(isEnabledNow) {
  if (!game.settings.settings.has("dnd5e.criticalDamageMaxDice")) {
    ui.notifications.warn("D&D5e Critical Damage Max Dice setting was not found; Crueler Criticals could not sync.");
    return;
  }
  const current = Boolean(game.settings.get("dnd5e", "criticalDamageMaxDice"));
  if (current === Boolean(isEnabledNow)) return;
  await game.settings.set("dnd5e", "criticalDamageMaxDice", Boolean(isEnabledNow));
  const label = isEnabledNow ? "enabled" : "disabled";
  ui.notifications.info(`D&D5e Critical Damage Max Dice ${label} for Crueler Criticals.`);
}

function findSettingNamespace(namespaces, key) {
  return namespaces.find((namespace) => game.settings.settings.has(`${namespace}.${key}`));
}

async function syncBooleanSetting(namespaces, key, isEnabledNow, label) {
  const namespace = findSettingNamespace(namespaces, key);
  if (!namespace) {
    ui.notifications.warn(`${label} setting was not found; the linked setting could not sync.`);
    return;
  }
  const target = Boolean(isEnabledNow);
  const current = Boolean(game.settings.get(namespace, key));
  if (current === target) return;
  await game.settings.set(namespace, key, target);
  const state = target ? "enabled" : "disabled";
  ui.notifications.info(`${label} ${state}. Reload Foundry if SW5e requests it.`);
}

function syncSw5eAsiAndFeatSetting(isEnabledNow) {
  return syncBooleanSetting(SW5E_SETTING_NAMESPACES, "allowFeatsAndASI", isEnabledNow, "SW5e ASI and Feat");
}

function syncSw5eSimplifiedForcecastingSetting(isEnabledNow) {
  return syncBooleanSetting(SW5E_SETTING_NAMESPACES, "simplifiedForcecasting", isEnabledNow, "SW5e Simplified Forcecasting");
}

function disturbanceLedger() {
  return foundry.utils.deepClone(game.settings.get(MODULE_ID, "disturbanceLedger") ?? {});
}

function setDisturbanceLedger(values) {
  return game.settings.set(MODULE_ID, "disturbanceLedger", values);
}

function getPropertyCompat(document, path) {
  return foundry.utils.getProperty(document, path);
}

function getActorSystem(actor, path) {
  return getPropertyCompat(actor, `system.${path}`) ?? getPropertyCompat(actor, `data.data.${path}`);
}

function getHp(actor) {
  return {
    value: Number(getActorSystem(actor, "attributes.hp.value") ?? 0),
    max: Number(getActorSystem(actor, "attributes.hp.max") ?? 0)
  };
}

function updateActorSystemData(actor, path, value) {
  const systemPath = getPropertyCompat(actor, "system") ? `system.${path}` : `data.data.${path}`;
  return actor.update({ [systemPath]: value });
}

function exhaustionPath(actor) {
  if (getActorSystem(actor, "attributes.exhaustion") !== undefined) return "attributes.exhaustion";
  if (getActorSystem(actor, "attributes.exhaustion.value") !== undefined) return "attributes.exhaustion.value";
  return "attributes.exhaustion";
}

function deathFailurePath(actor) {
  if (getActorSystem(actor, "attributes.death.failure") !== undefined) return "attributes.death.failure";
  if (getActorSystem(actor, "attributes.death.failures") !== undefined) return "attributes.death.failures";
  return "attributes.death.failure";
}

async function rollConSave(actor, dc, flavor) {
  const rollOptions = { flavor, fastForward: true, event: null };
  if (typeof actor.rollAbilitySave === "function") {
    return actor.rollAbilitySave("con", rollOptions);
  }
  if (typeof actor.rollAbilityTest === "function") {
    return actor.rollAbilityTest("con", rollOptions);
  }
  const modifier = Number(getActorSystem(actor, "abilities.con.save") ?? getActorSystem(actor, "abilities.con.mod") ?? 0);
  const roll = await new Roll(`1d20 + ${modifier}`).evaluate({ async: true });
  await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor });
  return roll;
}

function rollTotal(roll) {
  return Number(roll?.total ?? 0);
}

function isResponsibleGM() {
  if (!game.user.isGM) return false;
  const activeGms = game.users.filter((user) => user.active && user.isGM).sort((a, b) => a.id.localeCompare(b.id));
  return activeGms[0]?.id === game.user.id;
}

function resolveUserForActor(actor, fallbackUserId = game.user.id) {
  if (!actor) return game.users.get(fallbackUserId) ?? game.user;
  const activeOwners = game.users
    .filter((user) => user.active && !user.isGM && actor.testUserPermission?.(user, "OWNER"))
    .sort((a, b) => a.name.localeCompare(b.name));
  return activeOwners[0] ?? game.users.get(fallbackUserId) ?? game.user;
}

function itemDescriptionText(item) {
  const candidates = [
    item?.system?.description?.value,
    item?.system?.description?.chat,
    item?.system?.unidentified?.description,
    item?.system?.description
  ];
  return candidates.filter((value) => typeof value === "string").join(" ");
}

function stripHtml(value) {
  const div = document.createElement("div");
  div.innerHTML = String(value ?? "");
  return div.textContent || div.innerText || "";
}

function normalizeKeywordText(value) {
  return stripHtml(value)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hasForcePowerGrantText(item) {
  const text = `${item?.name ?? ""} ${stripHtml(itemDescriptionText(item))}`.toLowerCase();
  return /\bforce[-\s]?(casting|powers?|points?)\b/.test(text)
    || /\bforce[-\s]?sensitive\b/.test(text)
    || /\bforce[-\s]?adept\b/.test(text)
    || /\bforce[-\s]?affinity\b/.test(text);
}

function isForcePowerItem(item) {
  if (!item || item.type !== "spell") return false;
  const school = item.system?.school;
  if (["lgt", "drk", "uni"].includes(school)) return true;
  if (school === "tec") return false;

  const consumeTarget = item.system?.consume?.target;
  if (typeof consumeTarget === "string" && /(^|\.)powercasting\.force\.points\.value$/.test(consumeTarget)) return true;

  const activityTargets = Object.values(item.system?.activities ?? {}).flatMap((activity) => activity?.consumption?.targets ?? []);
  return activityTargets.some((target) => target?.type === "attribute" && /(^|\.)powercasting\.force\.points\.value$/.test(target?.target ?? ""));
}

function forcePowerLevel(item) {
  const level = Number(item?.system?.level ?? item?.system?.spellLevel ?? 0);
  return Number.isFinite(level) && level > 0 ? level : 0;
}

function itemSourceLabel(item) {
  const values = [
    item?.system?.source?.custom,
    item?.system?.source?.book,
    item?.system?.source,
    item?.flags?.core?.sourceId,
    item?.flags?.dnd5e?.sourceId,
    item?.flags?.sw5e?.sourceId,
    item?.pack
  ].filter(Boolean);
  return values.map((value) => typeof value === "string" ? value : JSON.stringify(value)).join("; ");
}

function itemTypeLabel(item) {
  const labels = {
    class: "Class",
    subclass: "Subclass",
    feat: "Feat",
    background: "Background",
    race: "Species",
    equipment: "Equipment",
    consumable: "Consumable",
    loot: "Other"
  };
  return labels[item?.type] ?? item?.type ?? "Other";
}

function detectForcePowerSources(actor, castItem) {
  const classes = [];
  const feats = [];
  const other = [];
  const nativeForceClasses = new Set(["consular", "guardian", "sentinel"]);

  for (const item of actor?.items ?? []) {
    const name = item.name ?? "Unnamed Item";
    const lowerName = name.toLowerCase();
    const grantsForce = hasForcePowerGrantText(item);
    if (item.type === "class" && (nativeForceClasses.has(lowerName) || grantsForce)) classes.push(name);
    else if (item.type === "subclass" && grantsForce) classes.push(name);
    else if (item.type === "feat" && grantsForce) feats.push(name);
    else if (grantsForce && item.id !== castItem?.id) other.push(`${itemTypeLabel(item)}: ${name}`);
  }

  const castItemSource = itemSourceLabel(castItem);
  if (castItemSource) other.push(`Power source: ${castItemSource}`);

  return {
    classes: [...new Set(classes)],
    feats: [...new Set(feats)],
    other: [...new Set(other)]
  };
}

function summarizeForcePowerSources(sources = {}) {
  const parts = [];
  if (sources.classes?.length) parts.push(`Class/Subclass: ${sources.classes.join(", ")}`);
  if (sources.feats?.length) parts.push(`Feat: ${sources.feats.join(", ")}`);
  if (sources.other?.length) parts.push(`Other: ${sources.other.join(", ")}`);
  return parts.join(" | ") || "No Force-power-granting class, feat, or other source detected on the actor.";
}

function disturbancePoolsForActor(actor) {
  if (!game.user.isGM || !actor) return [];
  const ledger = disturbanceLedger();
  const pools = new Map();

  const owners = game.users
    .filter((user) => !user.isGM && actor.testUserPermission?.(user, "OWNER"))
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const user of owners) {
    pools.set(user.id, {
      userId: user.id,
      userName: user.name,
      total: Number(ledger[user.id]?.total ?? 0)
    });
  }

  for (const entry of Object.values(ledger)) {
    const hasActorEntry = (entry.entries ?? []).some((cast) => cast.actorId === actor.id);
    if (!hasActorEntry) continue;
    pools.set(entry.userId, {
      userId: entry.userId,
      userName: game.users.get(entry.userId)?.name ?? entry.userName ?? "Unknown User",
      total: Number(entry.total ?? 0)
    });
  }

  return [...pools.values()].sort((a, b) => String(a.userName).localeCompare(String(b.userName)));
}

function tokenElevation(token) {
  const elevation = Number(token?.document?.elevation ?? token?.elevation ?? 0);
  return Number.isFinite(elevation) ? elevation : 0;
}

function tokenCenter(token) {
  if (token?.center) return token.center;
  const document = token?.document ?? token;
  const width = Number(token?.w ?? document?.width ?? canvas?.grid?.size ?? 0);
  const height = Number(token?.h ?? document?.height ?? canvas?.grid?.size ?? 0);
  return {
    x: Number(token?.x ?? document?.x ?? 0) + (width / 2),
    y: Number(token?.y ?? document?.y ?? 0) + (height / 2)
  };
}

function horizontalTokenDistance(attackerToken, targetToken) {
  const attackerCenter = tokenCenter(attackerToken);
  const targetCenter = tokenCenter(targetToken);

  try {
    const measured = canvas?.grid?.measurePath?.([attackerCenter, targetCenter], { gridSpaces: true });
    const distance = Number(measured?.distance ?? measured);
    if (Number.isFinite(distance)) return distance;
  } catch (_error) {
    // Fall back to Euclidean scene distance below.
  }

  const gridSize = Number(canvas?.dimensions?.size ?? canvas?.grid?.size ?? 100) || 100;
  const gridDistance = Number(canvas?.dimensions?.distance ?? canvas?.scene?.grid?.distance ?? 5) || 5;
  return (Math.hypot(attackerCenter.x - targetCenter.x, attackerCenter.y - targetCenter.y) / gridSize) * gridDistance;
}

function activeTokenForActor(actor) {
  if (!actor || !canvas?.ready) return null;
  const controlled = canvas.tokens?.controlled?.find((token) => token.actor?.id === actor.id);
  if (controlled) return controlled;

  const combatant = game.combat?.combatants?.find((entry) => entry.actor?.id === actor.id && entry.token?.object);
  if (combatant?.token?.object) return combatant.token.object;

  const activeTokens = actor.getActiveTokens?.(false, false) ?? actor.getActiveTokens?.() ?? [];
  return activeTokens[0]?.object ?? activeTokens[0] ?? null;
}

function singleTargetToken() {
  const targets = Array.from(game.user?.targets ?? []);
  return targets.length === 1 ? targets[0] : null;
}

function activityActionType(activity, attackMode) {
  try {
    return activity?.getActionType?.(attackMode) ?? activity?.actionType ?? activity?.attack?.type?.value ?? "";
  } catch (_error) {
    return activity?.actionType ?? activity?.attack?.type?.value ?? "";
  }
}

function isRangedAttackProcess(process, attackMode) {
  const activity = process?.subject;
  const actionType = String(activityActionType(activity, attackMode ?? process?.attackMode)).toLowerCase();
  if (["rwak", "rsak", "ranged"].includes(actionType)) return true;
  const attackModeText = String(attackMode ?? process?.attackMode ?? "").toLowerCase();
  return attackModeText.includes("ranged");
}

function collectTokenStatusText(token) {
  const values = new Set();
  const add = (value) => {
    if (value !== undefined && value !== null && value !== "") values.add(String(value));
  };
  const addStatuses = (statuses) => {
    if (!statuses) return;
    for (const status of statuses) add(status);
  };

  addStatuses(token?.document?.statuses);
  addStatuses(token?.actor?.statuses);
  for (const effect of token?.actor?.effects ?? []) {
    add(effect.name ?? effect.label);
    addStatuses(effect.statuses);
    add(effect.statusId);
    add(effect.getFlag?.("core", "statusId"));
  }
  for (const effect of token?.document?.effects ?? []) {
    add(effect.name ?? effect.label);
    addStatuses(effect.statuses);
    add(effect.statusId);
    add(effect.getFlag?.("core", "statusId"));
  }

  return [...values];
}

function targetCoverLevel(token) {
  const normalized = collectTokenStatusText(token).map((value) => normalizeKeywordText(value).replace(/\s+/g, ""));
  if (normalized.some((value) => value.includes("covertotal") || value.includes("totalcover"))) {
    return { level: 3, label: "Total Cover" };
  }
  if (normalized.some((value) => value.includes("coverthreequarters") || value.includes("threequarterscover") || value.includes("threequartercover"))) {
    return { level: 2, label: "Three-Quarters Cover" };
  }
  if (normalized.some((value) => value.includes("coverhalf") || value.includes("halfcover"))) {
    return { level: 1, label: "Half Cover" };
  }
  return { level: 0, label: "" };
}

function actorSharpshooterCoverBypass(actor) {
  const matches = [];
  for (const item of actor?.items ?? []) {
    if (item.type !== "feat") continue;
    const text = normalizeKeywordText(`${item.name ?? ""} ${itemDescriptionText(item)} ${itemSourceLabel(item)}`);
    const compact = text.replace(/\s+/g, "");
    const namedMastery = compact.includes("sharpshootermastery");
    const sharpshooterCoverText = /\bsharpshooter\b/.test(text)
      && /\bcover\b/.test(text)
      && (/\b(ignore|ignores|ignored|ignoring)\b/.test(text) || /\b(benefit|benefits)\b/.test(text));
    if (namedMastery || sharpshooterCoverText) matches.push(item.name ?? "Sharpshooter feat");
  }
  return matches;
}

function baseElevationDominance(verticalFeet, horizontalFeet) {
  if (verticalFeet >= ELEVATION_LEVELS[3].minimum && horizontalFeet >= ELEVATION_LEVELS[3].minimum) return 3;
  if (verticalFeet >= ELEVATION_LEVELS[2].minimum && horizontalFeet >= ELEVATION_LEVELS[2].minimum) return 2;
  if (verticalFeet >= ELEVATION_LEVELS[1].minimum && horizontalFeet >= ELEVATION_LEVELS[1].minimum) return 1;
  return 0;
}

function evaluateElevationAttackBonus(process, attackMode) {
  if (!isEnabled("elevation")) return null;
  if (!isRangedAttackProcess(process, attackMode)) return null;

  const activity = process?.subject;
  const actor = activity?.actor ?? activity?.item?.actor;
  const attackerToken = activeTokenForActor(actor);
  const targetToken = singleTargetToken();
  if (!actor || !attackerToken || !targetToken) return null;

  const verticalFeet = tokenElevation(attackerToken) - tokenElevation(targetToken);
  const horizontalFeet = horizontalTokenDistance(attackerToken, targetToken);
  const baseLevel = baseElevationDominance(verticalFeet, horizontalFeet);
  if (!baseLevel) return null;

  const cover = targetCoverLevel(targetToken);
  const sharpshooterMatches = actorSharpshooterCoverBypass(actor);
  const coverIgnored = cover.level > 0 && sharpshooterMatches.length > 0;
  const effectiveLevel = Math.max(0, baseLevel - (coverIgnored ? 0 : cover.level));
  if (!effectiveLevel) return null;

  const base = ELEVATION_LEVELS[baseLevel];
  const effective = ELEVATION_LEVELS[effectiveLevel];
  return {
    source: "SW5e Elevation",
    label: effective.label,
    baseLabel: base.label,
    level: effectiveLevel,
    baseLevel,
    bonus: effective.bonus,
    verticalFeet: Math.round(verticalFeet * 100) / 100,
    horizontalFeet: Math.round(horizontalFeet * 100) / 100,
    attacker: {
      actorId: actor.id,
      actorName: actor.name,
      tokenId: attackerToken.id ?? attackerToken.document?.id,
      tokenName: attackerToken.name ?? attackerToken.document?.name
    },
    target: {
      actorId: targetToken.actor?.id,
      actorName: targetToken.actor?.name,
      tokenId: targetToken.id ?? targetToken.document?.id,
      tokenName: targetToken.name ?? targetToken.document?.name
    },
    cover: {
      level: cover.level,
      label: cover.label,
      ignoredBySharpshooter: coverIgnored
    },
    sharpshooterFeats: sharpshooterMatches
  };
}

function handleElevationPostBuildAttackRollConfig(process, rollConfig, index) {
  if (index !== 0 || !isEnabled("elevation")) return;
  const detail = evaluateElevationAttackBonus(process, rollConfig?.options?.attackMode);
  if (!detail?.bonus) return;
  if (!isRangedAttackProcess(process, rollConfig?.options?.attackMode)) return;

  rollConfig.parts ??= [];
  if (rollConfig.parts.some((part) => String(part).includes("SWVR Elevation"))) return;

  rollConfig.parts.push(`${detail.bonus}[SWVR Elevation: ${detail.label}]`);
  rollConfig.options ??= {};
  rollConfig.options.swvrElevation = detail;
}

function handleElevationPostAttackRollConfiguration(rolls, process, _dialog, message) {
  if (!isEnabled("elevation")) return;
  const detail = rolls?.[0]?.options?.swvrElevation;
  if (!detail?.bonus) return;
  foundry.utils.setProperty(message, `data.flags.${MODULE_ID}.elevation`, detail);
}

function forceAlignmentState(actor) {
  const stored = foundry.utils.deepClone(actor?.getFlag(MODULE_ID, "forceAlignment") ?? {});
  return foundry.utils.mergeObject(foundry.utils.deepClone(FORCE_ALIGNMENT_DEFAULT), stored, {
    inplace: false,
    insertKeys: true,
    overwrite: true
  });
}

async function setForceAlignmentState(actor, state) {
  state.value = clampForceAlignment(state.value);
  state.seenPowers ??= { lgt: {}, drk: {} };
  state.seenPowers.lgt ??= {};
  state.seenPowers.drk ??= {};
  state.resolvedMinorTiers ??= { benevolence: {}, corruption: {} };
  state.resolvedMinorTiers.benevolence ??= {};
  state.resolvedMinorTiers.corruption ??= {};
  state.minorTraits = [...(state.minorTraits ?? [])].slice(-50);
  state.deedLog = [...(state.deedLog ?? [])].slice(-200);
  await actor.setFlag(MODULE_ID, "forceAlignment", state);
}

function clampForceAlignment(value) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(-100, Math.min(100, Math.trunc(numeric)));
}

function forceAlignmentSide(value) {
  if (value > 0) return "benevolence";
  if (value < 0) return "corruption";
  return "neutral";
}

function forceAlignmentTier(value) {
  const abs = Math.abs(Number(value ?? 0));
  return Math.min(5, Math.floor(abs / 20) + (abs >= 10 ? 1 : 0));
}

function forceAlignmentTierLabel(value) {
  const side = forceAlignmentSide(value);
  const abs = Math.abs(Number(value ?? 0));
  if (side === "neutral" || abs < 10) return "Neutral";
  const minorTier = Math.min(5, Math.floor((abs + 10) / 20));
  const majorTier = Math.min(5, Math.floor(abs / 20));
  const sideLabel = side === "benevolence" ? "Benevolence" : "Corruption";
  const parts = [];
  if (abs >= 10) parts.push(`Minor ${sideLabel} ${romanNumeral(minorTier)}`);
  if (majorTier > 0) {
    const majorLabel = side === "benevolence" ? "Major Benevolence" : "Major Corruption";
    parts.push(`${majorLabel} ${romanNumeral(majorTier)}`);
  }
  if (abs >= 100) parts.push(side === "benevolence" ? "Luminous Being" : "Dark Entity");
  return parts.join(" / ");
}

function forceAlignmentMajorBenefit(value) {
  const side = forceAlignmentSide(value);
  const tier = Math.min(5, Math.floor(Math.abs(Number(value ?? 0)) / 20));
  if (tier <= 0) return "";
  return side === "benevolence" ? FORCE_ALIGNMENT_MAJOR_BENEFITS[tier] : FORCE_ALIGNMENT_MAJOR_CORRUPTIONS[tier];
}

function romanNumeral(value) {
  return ["", "I", "II", "III", "IV", "V"][Number(value)] ?? String(value);
}

function forceAlignmentMarkerPercent(value) {
  return ((clampForceAlignment(value) + 100) / 200) * 100;
}

function interpolateColor(start, end, ratio) {
  const parse = (hex) => hex.replace("#", "").match(/.{2}/g).map((part) => parseInt(part, 16));
  const [sr, sg, sb] = parse(start);
  const [er, eg, eb] = parse(end);
  const channel = (s, e) => Math.round(s + ((e - s) * ratio)).toString(16).padStart(2, "0");
  return `#${channel(sr, er)}${channel(sg, eg)}${channel(sb, eb)}`;
}

function forceAlignmentColor(value) {
  const score = clampForceAlignment(value);
  if (score === 0) return "#A0A0A0";
  if (score > 0) return interpolateColor("#A0A0A0", "#0080FF", score / 100);
  return interpolateColor("#A0A0A0", "#FF0000", Math.abs(score) / 100);
}

function normalizePowerKey(item) {
  return String(item?.name ?? item?.id ?? "unknown").trim().toLowerCase().replace(/\s+/g, "-");
}

function actorHasClassForcePowerSource(actor) {
  return detectForcePowerSources(actor, null).classes.length > 0;
}

function actorHasForceAlignmentSurface(actor) {
  if (!actor) return false;
  const state = forceAlignmentState(actor);
  if (state.value || state.minorTraits?.length || state.deedLog?.length) return true;
  return [...(actor.items ?? [])].some((item) => item.type === "spell" && ["lgt", "drk"].includes(item.system?.school) && forcePowerLevel(item) > 0);
}

function isLikelyNonClassPowerSource(item) {
  const source = itemSourceLabel(item).toLowerCase();
  return /\b(feat|background|species|race|equipment|consumable|loot)\b/.test(source);
}

function isForceAlignmentPowerItem(item) {
  if (!item || item.type !== "spell") return false;
  const school = item.system?.school;
  if (!["lgt", "drk"].includes(school)) return false;
  if (forcePowerLevel(item) <= 0) return false;
  if (!actorHasClassForcePowerSource(item.actor)) return false;
  if (isLikelyNonClassPowerSource(item)) return false;
  return true;
}

function crossedMinorTiers(previous, next) {
  const thresholds = [10, 30, 50, 70, 90];
  const side = forceAlignmentSide(next);
  if (side === "neutral") return [];
  const oldProgress = forceAlignmentSide(previous) === side ? Math.abs(previous) : 0;
  const newProgress = Math.abs(next);
  return thresholds
    .filter((threshold) => oldProgress < threshold && newProgress >= threshold)
    .map((threshold) => Math.floor((threshold + 10) / 20));
}

function forceAlignmentSaveAbility(side) {
  return side === "benevolence" ? "cha" : "wis";
}

function forceAlignmentSaveDc(tier) {
  return 10 + (Number(tier) * 2);
}

function forceAlignmentSaveLabel(side) {
  return side === "benevolence" ? "Benevolence" : "Corruption";
}

function forceAlignmentLogEntry(data) {
  return {
    id: foundry.utils.randomID(),
    timestamp: new Date().toISOString(),
    userId: game.user.id,
    userName: game.user.name,
    ...data
  };
}

async function applyForceAlignmentDelta(actor, delta, options = {}) {
  if (!actor) return null;
  const state = forceAlignmentState(actor);
  const previous = clampForceAlignment(state.value);
  const next = clampForceAlignment(previous + Number(delta ?? 0));
  const nextSide = forceAlignmentSide(next);
  const pendingMinorTiers = crossedMinorTiers(previous, next).filter((tier) => !state.resolvedMinorTiers?.[nextSide]?.[tier]);
  if (nextSide !== "neutral") {
    state.resolvedMinorTiers ??= { benevolence: {}, corruption: {} };
    state.resolvedMinorTiers[nextSide] ??= {};
    for (const tier of pendingMinorTiers) state.resolvedMinorTiers[nextSide][tier] = true;
  }
  const entry = forceAlignmentLogEntry({
    kind: options.kind ?? "manual",
    label: options.label ?? "Manual GM adjustment",
    note: options.note ?? "",
    itemId: options.itemId,
    itemName: options.itemName,
    school: options.school,
    level: options.level,
    firstCast: options.firstCast,
    points: Number(delta ?? 0),
    previous,
    next
  });

  state.value = next;
  state.deedLog = [...(state.deedLog ?? []), entry];
  await setForceAlignmentState(actor, state);

  for (const tier of pendingMinorTiers) {
    requestForceAlignmentMinorSave(actor, nextSide, tier);
  }
  return { previous, next, entry };
}

async function resetForceAlignment(actor) {
  if (!game.user.isGM || !actor) return;
  await actor.setFlag(MODULE_ID, "forceAlignment", foundry.utils.deepClone(FORCE_ALIGNMENT_DEFAULT));
}

function confirmResetForceAlignment(actor, onReset) {
  if (!game.user.isGM || !actor) return;
  new Dialog({
    title: "Reset Force Alignment",
    content: `<p>Reset Force Alignment for <strong>${escapeHtml(actor.name)}</strong>?</p><p>This clears the score, cast history, resolved tier prompts, minor traits, and the action/deed log.</p>`,
    buttons: {
      reset: {
        icon: '<i class="fas fa-trash"></i>',
        label: "Reset",
        callback: async () => {
          await resetForceAlignment(actor);
          ui.notifications.info(`Force Alignment reset for ${actor.name}.`);
          onReset?.();
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel"
      }
    },
    default: "cancel"
  }).render(true);
}

async function recordForceAlignmentCast(payload) {
  if (!game.user.isGM) return;
  const actor = await fromUuid(payload.actorUuid);
  if (!actor) return;

  const state = forceAlignmentState(actor);
  const school = payload.school;
  const key = payload.powerKey;
  const seen = state.seenPowers?.[school]?.[key];
  const firstCast = !seen;
  const points = firstCast ? Number(payload.level ?? 0) : 1;
  if (!points) return;

  state.seenPowers[school][key] = {
    itemName: payload.itemName,
    firstSeen: seen?.firstSeen ?? new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    casts: Number(seen?.casts ?? 0) + 1
  };
  await setForceAlignmentState(actor, state);

  const delta = school === "lgt" ? points : -points;
  await applyForceAlignmentDelta(actor, delta, {
    kind: "cast",
    label: `${payload.itemName} cast`,
    itemId: payload.itemId,
    itemName: payload.itemName,
    school,
    level: Number(payload.level ?? 0),
    firstCast,
    note: firstCast ? "First class-sourced casting of this power." : "Repeat class-sourced casting of this power."
  });
}

async function handleForceAlignmentPowerCast(item) {
  if (!isEnabled("force-alignment") || !isForceAlignmentPowerItem(item)) return;
  const dedupeKey = `${game.user.id}:${item.uuid ?? item.id}:${item.actor?.id ?? ""}`;
  const now = Date.now();
  const recent = RECENT_ALIGNMENT_CASTS.get(dedupeKey);
  if (recent && now - recent < 1500) return;
  RECENT_ALIGNMENT_CASTS.set(dedupeKey, now);
  for (const [key, timestamp] of RECENT_ALIGNMENT_CASTS.entries()) {
    if (now - timestamp > 5000) RECENT_ALIGNMENT_CASTS.delete(key);
  }

  const payload = {
    actorUuid: item.actor?.uuid,
    actorId: item.actor?.id,
    actorName: item.actor?.name,
    itemId: item.id,
    itemName: item.name,
    school: item.system?.school,
    level: forcePowerLevel(item),
    powerKey: normalizePowerKey(item)
  };

  if (game.user.isGM) await recordForceAlignmentCast(payload);
  else game.socket.emit(`module.${MODULE_ID}`, { type: "forceAlignmentCast", payload });
}

function requestForceAlignmentMinorSave(actor, side, tier) {
  const user = resolveUserForActor(actor, game.user.id);
  const payload = {
    actorUuid: actor.uuid,
    actorName: actor.name,
    userId: user.id,
    side,
    tier,
    dc: forceAlignmentSaveDc(tier)
  };
  if (user.id !== game.user.id && user.active) {
    game.socket.emit(`module.${MODULE_ID}`, { type: "forceAlignmentMinorSaveRequest", payload });
  } else {
    showForceAlignmentMinorSaveDialog(payload);
  }
}

async function showForceAlignmentMinorSaveDialog(payload) {
  const actor = await fromUuid(payload.actorUuid);
  if (!actor) return;
  const ability = forceAlignmentSaveAbility(payload.side);
  const label = forceAlignmentSaveLabel(payload.side);
  const content = `<p>${actor.name} reached Minor ${label} ${romanNumeral(payload.tier)}.</p><p>Roll a ${ability.toUpperCase()} save against DC ${payload.dc}, or choose to fail and gain a minor trait.</p>`;
  new Dialog({
    title: `Force Alignment: Minor ${label} ${romanNumeral(payload.tier)}`,
    content,
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: "Roll Save",
        callback: () => resolveForceAlignmentMinorSave(actor, payload.side, payload.tier, payload.dc, false)
      },
      fail: {
        icon: '<i class="fas fa-times"></i>',
        label: "Choose to Fail",
        callback: () => resolveForceAlignmentMinorSave(actor, payload.side, payload.tier, payload.dc, true)
      }
    },
    default: "roll"
  }).render(true);
}

async function resolveForceAlignmentMinorSave(actor, side, tier, dc, chooseFail) {
  let success = false;
  let total = null;
  const ability = forceAlignmentSaveAbility(side);
  if (!chooseFail) {
    const roll = typeof actor.rollAbilitySave === "function"
      ? await actor.rollAbilitySave(ability, { flavor: `Force Alignment: Minor ${forceAlignmentSaveLabel(side)} ${romanNumeral(tier)} (DC ${dc})`, fastForward: true })
      : await actor.rollAbilityTest(ability, { flavor: `Force Alignment: Minor ${forceAlignmentSaveLabel(side)} ${romanNumeral(tier)} (DC ${dc})`, fastForward: true });
    total = rollTotal(roll);
    success = total >= dc;
  }

  if (!game.user.isGM) {
    game.socket.emit(`module.${MODULE_ID}`, {
      type: "forceAlignmentMinorSaveResult",
      payload: { actorUuid: actor.uuid, side, tier, dc, chooseFail, total, success }
    });
    return;
  }
  await recordForceAlignmentMinorSaveResult(actor, { side, tier, dc, chooseFail, total, success });
}

async function recordForceAlignmentMinorSaveResult(actor, payload) {
  const state = forceAlignmentState(actor);
  const label = forceAlignmentSaveLabel(payload.side);
  const result = payload.chooseFail ? "chose to fail" : `${payload.success ? "succeeded" : "failed"}${payload.total === null ? "" : ` with ${payload.total}`}`;
  const entry = forceAlignmentLogEntry({
    kind: "save",
    label: `Minor ${label} ${romanNumeral(payload.tier)} save`,
    note: `${actor.name} ${result} against DC ${payload.dc}.`,
    points: 0,
    previous: state.value,
    next: state.value
  });
  state.deedLog = [...(state.deedLog ?? []), entry];

  if (!payload.success || payload.chooseFail) {
    const roll = await new Roll("1d4").evaluate({ async: true });
    const index = Math.max(0, Math.min(3, Number(roll.total ?? 1) - 1));
    const trait = FORCE_ALIGNMENT_MINOR_TABLES[payload.side]?.[payload.tier]?.[index] ?? "Minor trait result unavailable.";
    const traitEntry = {
      id: foundry.utils.randomID(),
      timestamp: new Date().toISOString(),
      side: payload.side,
      tier: payload.tier,
      roll: Number(roll.total ?? index + 1),
      text: trait
    };
    state.minorTraits = [...(state.minorTraits ?? []), traitEntry];
    state.deedLog.push(forceAlignmentLogEntry({
      kind: "trait",
      label: `Minor ${label} ${romanNumeral(payload.tier)} trait`,
      note: trait,
      points: 0,
      previous: state.value,
      next: state.value
    }));
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `Force Alignment: Minor ${label} ${romanNumeral(payload.tier)} trait`
    });
  }

  await setForceAlignmentState(actor, state);
}

async function recordDisturbanceCast(payload) {
  if (!game.user.isGM) return;
  const ledger = disturbanceLedger();
  const userId = payload.userId ?? game.user.id;
  const user = game.users.get(userId);
  const current = ledger[userId] ?? {
    userId,
    userName: user?.name ?? payload.userName ?? "Unknown User",
    total: 0,
    entries: []
  };
  const gain = Number(payload.points ?? 0);
  const entry = {
    id: foundry.utils.randomID(),
    timestamp: new Date().toISOString(),
    actorId: payload.actorId,
    actorName: payload.actorName,
    itemId: payload.itemId,
    itemName: payload.itemName,
    level: Number(payload.level ?? 0),
    points: gain,
    totalAfter: Number(current.total ?? 0) + gain,
    sources: payload.sources ?? { classes: [], feats: [], other: [] }
  };

  current.userName = user?.name ?? current.userName;
  current.total = entry.totalAfter;
  current.entries = [...(current.entries ?? []), entry].slice(-200);
  ledger[userId] = current;
  await setDisturbanceLedger(ledger);
  refreshForceAlignmentPanelsForActor(entry.actorId);

  if (game.settings.get(MODULE_ID, "chatReminders")) {
    ChatMessage.create({
      speaker: { alias: "SW5e Variant Rules" },
      whisper: ChatMessage.getWhisperRecipients("GM"),
      content: `<p><strong>Hunted:</strong> ${entry.actorName} cast ${entry.itemName} (level ${entry.level}), adding ${entry.points} Disturbance Point(s) to ${current.userName}. Total: ${current.total}.</p><p><strong>Detected source(s):</strong> ${summarizeForcePowerSources(entry.sources)}</p>`
    });
  }
}

function refreshForceAlignmentPanelsForActor(actorId) {
  for (const app of Object.values(ui.windows ?? {})) {
    if (!(app instanceof ForceAlignmentPanel)) continue;
    if (actorId && app.actor?.id !== actorId) continue;
    app.render();
  }
}

async function handleHuntedForcePowerCast(item) {
  if (!isEnabled("hunted") || !isForcePowerItem(item)) return;
  const dedupeKey = `${game.user.id}:${item.uuid ?? item.id}:${item.actor?.id ?? ""}`;
  const now = Date.now();
  const recent = RECENT_HUNTED_CASTS.get(dedupeKey);
  if (recent && now - recent < 1500) return;
  RECENT_HUNTED_CASTS.set(dedupeKey, now);
  for (const [key, timestamp] of RECENT_HUNTED_CASTS.entries()) {
    if (now - timestamp > 5000) RECENT_HUNTED_CASTS.delete(key);
  }

  const actor = item.actor;
  const user = resolveUserForActor(actor, game.user.id);
  const level = forcePowerLevel(item);
  const payload = {
    userId: user.id,
    userName: user.name,
    actorId: actor?.id,
    actorName: actor?.name ?? "Unknown Actor",
    itemId: item.id,
    itemName: item.name,
    level,
    points: level,
    sources: detectForcePowerSources(actor, item)
  };

  if (game.user.isGM) await recordDisturbanceCast(payload);
  else game.socket.emit(`module.${MODULE_ID}`, { type: "huntedForcePowerCast", payload });
}

async function addExhaustion(actor, amount = 1) {
  const path = exhaustionPath(actor);
  const current = Number(getActorSystem(actor, path) ?? 0);
  await updateActorSystemData(actor, path, Math.max(0, current + amount));
}

async function addDeathFailures(actor, amount) {
  if (amount <= 0) return;
  const path = deathFailurePath(actor);
  const current = Number(getActorSystem(actor, path) ?? 0);
  await updateActorSystemData(actor, path, Math.min(3, current + amount));
}

async function handleWounds(actor, changed) {
  if (!game.user.isGM || !isEnabled("wounds")) return;
  const hpChange = foundry.utils.getProperty(changed, "system.attributes.hp.value")
    ?? foundry.utils.getProperty(changed, "data.data.attributes.hp.value");
  if (hpChange === undefined) return;

  const oldHp = getHp(actor);
  const newHp = Number(hpChange);
  const wounded = Number(actor.getFlag(MODULE_ID, "wounded") ?? 0);

  if (oldHp.value > 0 && newHp <= 0) {
    const dc = Number(actor.getFlag(MODULE_ID, "woundSaveDc") ?? 10);
    const roll = await rollConSave(actor, dc, `SW5e Variant Rule: Wounds (DC ${dc})`);
    const success = rollTotal(roll) >= dc;
    const nextWounded = success ? wounded : wounded + 1;

    await actor.setFlag(MODULE_ID, "wounded", nextWounded);
    await actor.setFlag(MODULE_ID, "woundSaveDc", success ? dc + 5 : 10);
    await addDeathFailures(actor, nextWounded);

    const result = success
      ? `${actor.name} succeeded and remains at ${wounded} wounded level(s). The next Wounds save DC is ${dc + 5}.`
      : `${actor.name} failed and gains 1 wounded level, now ${nextWounded}. The next Wounds save DC resets to 10.`;
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>Wounds:</strong> ${result}</p><p>Death save failures applied from wounded levels: ${nextWounded}.</p>`
    });
  } else if (newHp > 0 && oldHp.max > 0 && newHp >= oldHp.max && wounded > 0) {
    await actor.unsetFlag(MODULE_ID, "wounded");
    await actor.setFlag(MODULE_ID, "woundSaveDc", 10);
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>Wounds:</strong> ${actor.name} was restored to maximum hit points and clears all wounded levels.</p>`
    });
  }
}

async function handleStrenuousCombat(combat) {
  if (!game.user.isGM || !isEnabled("strenuous-combat")) return;
  const turnCount = Number(combat.turns?.length ?? 0);
  const currentTurn = Number(combat.turn ?? 0);
  const currentRound = Number(combat.round ?? 1);
  const completedRounds = Math.max(0, currentRound - (turnCount > 0 && currentTurn >= turnCount - 1 ? 0 : 1));
  const dc = 10 + completedRounds;
  const combatants = combat.combatants.filter((combatant) => {
    const actor = combatant.actor;
    return actor && getHp(actor).value > 0;
  });
  if (!combatants.length) return;

  ChatMessage.create({
    speaker: { alias: "SW5e Variant Rules" },
    content: `<p><strong>Strenuous Combat:</strong> Combat ended after ${completedRounds} complete round(s). Surviving combatants roll Constitution saves against DC ${dc}; failures gain 1 exhaustion.</p>`
  });

  for (const combatant of combatants) {
    const actor = combatant.actor;
    const roll = await rollConSave(actor, dc, `SW5e Variant Rule: Strenuous Combat (DC ${dc})`);
    if (rollTotal(roll) < dc) {
      await addExhaustion(actor, 1);
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p><strong>Strenuous Combat:</strong> ${actor.name} failed and gains 1 exhaustion.</p>`
      });
    }
  }
}

async function applyTacticalInitiative() {
  if (!game.user.isGM) {
    ui.notifications.warn("Only the GM can apply Tactical Initiative.");
    return;
  }
  if (!isEnabled("tactical-initiative")) {
    ui.notifications.warn("Enable Tactical Initiative in SW5e Variant Rules settings first.");
    return;
  }
  const combat = game.combat;
  if (!combat) {
    ui.notifications.warn("No active combat.");
    return;
  }
  const selectedIds = new Set(canvas.tokens.controlled.map((token) => token.combatant?.id).filter(Boolean));
  const group = combat.combatants.filter((combatant) => selectedIds.has(combatant.id));
  if (group.length < 2) {
    ui.notifications.warn("Select at least two combatant tokens for a tactical group.");
    return;
  }

  for (const combatant of group) {
    if (combatant.initiative === null || combatant.initiative === undefined) {
      await combat.rollInitiative([combatant.id]);
    }
  }

  const lowest = Math.min(...group.map((combatant) => Number(combatant.initiative ?? 0)));
  const updates = group.map((combatant) => ({ _id: combatant.id, initiative: lowest }));
  await combat.updateEmbeddedDocuments("Combatant", updates);
  const names = group.map((combatant) => combatant.name).join(", ");
  ChatMessage.create({
    speaker: { alias: "SW5e Variant Rules" },
    content: `<p><strong>Tactical Initiative:</strong> ${names} now act as a tactical group on initiative ${lowest}.</p><p>They may act in any order during the group turn. If they separate, they keep this initiative and the GM resolves same-initiative ordering randomly.</p>`
  });
}

function postEnabledRuleReminder(ruleId, message) {
  if (!game.user.isGM || !isEnabled(ruleId) || !game.settings.get(MODULE_ID, "chatReminders")) return;
  const ruleData = RULES.find((rule) => rule.id === ruleId);
  ChatMessage.create({
    speaker: { alias: "SW5e Variant Rules" },
    whisper: ChatMessage.getWhisperRecipients("GM"),
    content: `<p><strong>${ruleData.name}:</strong> ${message}</p>`
  });
}

class VariantRulesConfig extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${MODULE_ID}-config`,
      title: "SW5e Variant Rules",
      template: `modules/${MODULE_ID}/templates/config.html`,
      width: 760,
      height: "auto",
      closeOnSubmit: true
    });
  }

  getData() {
    const enabled = enabledRules();
    const categories = [...new Set(RULES.map((item) => item.category))].sort().map((category) => ({
      label: categoryLabel(category),
      rules: RULES.filter((ruleData) => ruleData.category === category).map((ruleData) => ({
        ...ruleData,
        checked: Boolean(enabled[ruleData.id]),
        badgeClass: automationClass(ruleData.automation)
      }))
    }));
    return {
      sourceUrl: SOURCE_URL,
      chatReminders: game.settings.get(MODULE_ID, "chatReminders"),
      useModifiedActorSheet: useModifiedActorSheet(),
      categories
    };
  }

  async _updateObject(_event, formData) {
    const previous = enabledRules();
    const enabled = {};
    for (const ruleData of RULES) enabled[ruleData.id] = Boolean(formData[ruleData.id]);
    await setEnabledRules(enabled);
    await game.settings.set(MODULE_ID, "chatReminders", Boolean(formData.chatReminders));
    await game.settings.set(MODULE_ID, "useModifiedActorSheet", Boolean(formData.useModifiedActorSheet));
    if (previous["milestone-leveling"] !== enabled["milestone-leveling"]) {
      await syncMilestoneLevelingSetting(enabled["milestone-leveling"]);
    }
    if (previous["crueler-criticals"] !== enabled["crueler-criticals"]) {
      await syncCruelerCriticalsSetting(enabled["crueler-criticals"]);
    }
    if (previous["asi-feat"] !== enabled["asi-feat"]) {
      await syncSw5eAsiAndFeatSetting(enabled["asi-feat"]);
    }
    if (previous["simplified-forcecasting"] !== enabled["simplified-forcecasting"]) {
      await syncSw5eSimplifiedForcecastingSetting(enabled["simplified-forcecasting"]);
    }
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("[data-action='enable-all']").on("click", () => {
      html.find("input[data-rule-id]").prop("checked", true);
    });
    html.find("[data-action='disable-all']").on("click", () => {
      html.find("input[data-rule-id]").prop("checked", false);
    });
    html.find("[data-action='report']").on("click", () => new VariantRulesReport().render(true));
    html.find("[data-action='hunted-log']").on("click", () => new HuntedDisturbanceLog().render(true));
  }
}

class VariantRulesReport extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${MODULE_ID}-report`,
      title: "SW5e Variant Rules Applicability Report",
      template: `modules/${MODULE_ID}/templates/report.html`,
      width: 820,
      height: 720,
      resizable: true
    });
  }

  getData() {
    const enabled = enabledRules();
    return {
      sourceUrl: SOURCE_URL,
      rules: RULES.map((ruleData) => ({
        ...ruleData,
        enabled: Boolean(enabled[ruleData.id]),
        badgeClass: automationClass(ruleData.automation)
      }))
    };
  }
}

class HuntedDisturbanceLog extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${MODULE_ID}-hunted-log`,
      title: "Hunted Disturbance Log",
      template: `modules/${MODULE_ID}/templates/hunted-log.html`,
      width: 860,
      height: 720,
      resizable: true
    });
  }

  getData() {
    const users = Object.values(disturbanceLedger()).sort((a, b) => String(a.userName).localeCompare(String(b.userName)));
    return {
      users: users.map((user) => ({
        ...user,
        entries: [...(user.entries ?? [])].reverse().map((entry) => ({
          ...entry,
          sourceSummary: summarizeForcePowerSources(entry.sources),
          when: new Date(entry.timestamp).toLocaleString()
        }))
      }))
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("[data-action='reset-user']").on("click", async (event) => {
      const userId = event.currentTarget.dataset.userId;
      const ledger = disturbanceLedger();
      if (!ledger[userId]) return;
      ledger[userId].total = 0;
      ledger[userId].entries = [];
      await setDisturbanceLedger(ledger);
      this.render();
    });
    html.find("[data-action='reset-all']").on("click", async () => {
      await setDisturbanceLedger({});
      this.render();
    });
  }
}

class ForceAlignmentPanel extends Application {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${MODULE_ID}-force-alignment`,
      title: "Force Alignment",
      template: `modules/${MODULE_ID}/templates/force-alignment.html`,
      width: 720,
      height: 640,
      resizable: true
    });
  }

  get title() {
    return `Force Alignment: ${this.actor?.name ?? "Actor"}`;
  }

  getData() {
    const state = forceAlignmentState(this.actor);
    const value = clampForceAlignment(state.value);
    const side = forceAlignmentSide(value);
    return {
      actorName: this.actor?.name ?? "Actor",
      value,
      side,
      color: forceAlignmentColor(value),
      markerPercent: forceAlignmentMarkerPercent(value),
      tierLabel: forceAlignmentTierLabel(value),
      majorBenefit: forceAlignmentMajorBenefit(value),
      isGM: game.user.isGM,
      disturbancePools: disturbancePoolsForActor(this.actor),
      minorTraits: [...(state.minorTraits ?? [])].reverse().map((entry) => ({
        ...entry,
        when: new Date(entry.timestamp).toLocaleString(),
        sideLabel: forceAlignmentSaveLabel(entry.side),
        tierLabel: romanNumeral(entry.tier)
      })),
      deedLog: [...(state.deedLog ?? [])].reverse().map((entry) => ({
        ...entry,
        when: new Date(entry.timestamp).toLocaleString(),
        pointsLabel: Number(entry.points ?? 0) > 0 ? `+${entry.points}` : String(entry.points ?? 0)
      }))
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("[data-action='adjust']").on("click", async (event) => {
      if (!game.user.isGM) return;
      const amount = Number(event.currentTarget.dataset.amount ?? 0);
      await applyForceAlignmentDelta(this.actor, amount, {
        kind: "manual",
        label: "Manual GM adjustment",
        note: amount > 0 ? "GM awarded 1 light point." : "GM awarded 1 dark point."
      });
      this.render();
    });
    html.find("[data-action='log-deed']").on("click", async () => {
      if (!game.user.isGM) return;
      const amount = Number(html.find("[name='deedAmount']").val() ?? 0);
      const note = String(html.find("[name='deedNote']").val() ?? "").trim();
      if (!amount || !note) {
        ui.notifications.warn("Enter a nonzero point value and a deed note.");
        return;
      }
      await applyForceAlignmentDelta(this.actor, amount, {
        kind: "deed",
        label: "GM deed adjustment",
        note
      });
      this.render();
    });
    html.find("[data-action='reset-alignment']").on("click", () => {
      if (!game.user.isGM) return;
      confirmResetForceAlignment(this.actor, () => this.render());
    });
  }
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

function actorFromSheetApp(app) {
  return app?.actor ?? app?.document;
}

function ownText(element) {
  return [...(element?.childNodes ?? [])]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent.trim())
    .filter(Boolean)
    .join(" ");
}

function normalizedElementText(element) {
  return String(element?.textContent ?? "").replace(/\s+/g, " ").trim();
}

function isCompactSheetBlock(element) {
  const rect = element?.getBoundingClientRect?.();
  if (!rect) return true;
  return rect.width > 20 && rect.width <= 320 && rect.height > 8 && rect.height <= 90;
}

function closestCompactSheetBlock(element, pattern) {
  let block = $(element);
  for (let i = 0; i < 5; i++) {
    const parent = block.parent();
    if (!parent.length || parent.is("form, .window-content")) break;
    const parentElement = parent[0];
    const text = normalizedElementText(parentElement);
    if (!pattern.test(text) || text.length > 90 || !isCompactSheetBlock(parentElement)) break;
    block = parent;
  }
  return block;
}

function findSheetTextBlock(html, pattern) {
  const matches = html.find("*").filter((_index, element) => {
    if ($(element).closest(".sw5e-vr-force-alignment-sheet").length) return false;
    const text = ownText(element) || ($(element).children().length <= 2 ? normalizedElementText(element) : "");
    if (!pattern.test(String(text ?? "").replace(/\s+/g, " ").trim())) return false;
    return isCompactSheetBlock(element);
  }).toArray().sort((a, b) => {
    const ar = a.getBoundingClientRect?.() ?? { top: 0, left: 0 };
    const br = b.getBoundingClientRect?.() ?? { top: 0, left: 0 };
    return (ar.top - br.top) || (ar.left - br.left);
  });
  for (const match of matches) {
    const block = closestCompactSheetBlock(match, pattern);
    if (block?.length && isCompactSheetBlock(block[0])) return block;
  }
  return null;
}

function insertForceAlignmentSheetPanel(html, panel) {
  const forcePoints = findSheetTextBlock(html, /force\s*points/i);
  if (forcePoints?.length) {
    forcePoints.after(panel);
    return;
  }

  const hitDice = findSheetTextBlock(html, /hit\s*dice/i);
  if (hitDice?.length) {
    hitDice.before(panel);
    return;
  }
}

function renderForceAlignmentActorPanel(app, html) {
  html = globalThis.jQuery && html instanceof jQuery ? html : $(html);
  const actor = actorFromSheetApp(app);
  if (!actor || !useModifiedActorSheet() || !isEnabled("force-alignment")) return;
  if (!actorHasForceAlignmentSurface(actor)) return;
  const host = app?.element
    ? (globalThis.jQuery && app.element instanceof jQuery ? app.element : $(app.element))
    : html.closest(".app");
  host?.find?.(".sw5e-vr-force-alignment-sheet").remove();
  html.find(".sw5e-vr-force-alignment-sheet").remove();

  const state = forceAlignmentState(actor);
  const value = clampForceAlignment(state.value);
  const tier = forceAlignmentTierLabel(value);
  const color = forceAlignmentColor(value);
  const marker = forceAlignmentMarkerPercent(value);
  const gmControls = game.user.isGM
    ? `<button type="button" data-action="force-alignment-adjust" data-amount="1" title="Add 1 light point"><i class="fas fa-plus"></i></button><button type="button" data-action="force-alignment-adjust" data-amount="-1" title="Add 1 dark point"><i class="fas fa-minus"></i></button>`
    : "";
  const panel = $(`
    <section class="sw5e-vr-force-alignment-sheet">
      <div class="sw5e-vr-force-alignment-head">
        <label>Alignment</label>
        <strong>${value > 0 ? "+" : ""}${value}</strong>
        <button type="button" data-action="force-alignment-open" title="Open Force Alignment details"><i class="fas fa-external-link-alt"></i></button>
        ${gmControls}
      </div>
      <div class="sw5e-vr-force-alignment-bar" title="${escapeHtml(tier)}">
        <span class="sw5e-vr-force-alignment-track"></span>
        <span class="sw5e-vr-force-alignment-marker" style="left: ${marker}%; background: ${color};"></span>
      </div>
    </section>
  `);

  panel.find("[data-action='force-alignment-open']").on("click", () => new ForceAlignmentPanel(actor).render(true));
  panel.find("[data-action='force-alignment-adjust']").on("click", async (event) => {
    if (!game.user.isGM) return;
    const amount = Number(event.currentTarget.dataset.amount ?? 0);
    await applyForceAlignmentDelta(actor, amount, {
      kind: "manual",
      label: "Manual GM adjustment",
      note: amount > 0 ? "GM awarded 1 light point from the actor sheet." : "GM awarded 1 dark point from the actor sheet."
    });
    app.render?.();
  });

  insertForceAlignmentSheetPanel(html, panel);
}

function categoryLabel(category) {
  return category.replace(/(^|-)([a-z])/g, (_match, separator, letter) => `${separator ? " " : ""}${letter.toUpperCase()}`);
}

function automationClass(automation) {
  return {
    Automated: "automated",
    Reminder: "reminder",
    Manual: "manual"
  }[automation] ?? "manual";
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "enabledRules", {
    name: "Enabled Variant Rules",
    scope: "world",
    config: false,
    type: Object,
    default: RULES.reduce((values, ruleData) => {
      values[ruleData.id] = false;
      return values;
    }, {})
  });

  game.settings.register(MODULE_ID, "chatReminders", {
    name: "Show GM Chat Reminders",
    hint: "Whisper contextual reminders for enabled rules that cannot be fully automated.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, "useModifiedActorSheet", {
    name: "Use SWVR Actor Sheet",
    hint: "Enable the SWVR Actor Sheet when it is implemented.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true
  });

  game.settings.register(MODULE_ID, "disturbanceLedger", {
    name: "Hunted Disturbance Ledger",
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  game.settings.registerMenu(MODULE_ID, "config", {
    name: "Configure Variant Rules",
    label: "Configure Rules",
    hint: "Enable or disable SW5e variant rule options and review automation coverage.",
    icon: "fas fa-cogs",
    type: VariantRulesConfig,
    restricted: true
  });

  game.settings.registerMenu(MODULE_ID, "huntedLog", {
    name: "Hunted Disturbance Log",
    label: "Open Log",
    hint: "Review and reset user Disturbance Points generated by Force power casting.",
    icon: "fas fa-wave-square",
    type: HuntedDisturbanceLog,
    restricted: true
  });
});

Hooks.once("ready", () => {
  if (game.user.isGM) {
    if (isEnabled("crueler-criticals")) syncCruelerCriticalsSetting(true);
    if (isEnabled("asi-feat")) syncSw5eAsiAndFeatSetting(true);
    if (isEnabled("simplified-forcecasting")) syncSw5eSimplifiedForcecastingSetting(true);
  }

  game.socket.on(`module.${MODULE_ID}`, (message) => {
    if (message?.type === "huntedForcePowerCast" && isResponsibleGM()) {
      recordDisturbanceCast(message.payload);
      return;
    }
    if (message?.type === "forceAlignmentCast" && isResponsibleGM()) {
      recordForceAlignmentCast(message.payload);
      return;
    }
    if (message?.type === "forceAlignmentMinorSaveRequest" && message.payload?.userId === game.user.id) {
      showForceAlignmentMinorSaveDialog(message.payload);
      return;
    }
    if (message?.type === "forceAlignmentMinorSaveResult" && isResponsibleGM()) {
      fromUuid(message.payload?.actorUuid).then((actor) => {
        if (actor) recordForceAlignmentMinorSaveResult(actor, message.payload);
      });
    }
  });

  game.modules.get(MODULE_ID).api = {
    rules: RULES,
    isEnabled,
    useModifiedActorSheet,
    disturbanceLedger,
    forceAlignmentState,
    resetForceAlignment,
    confirmResetForceAlignment,
    openConfig: () => new VariantRulesConfig().render(true),
    openReport: () => new VariantRulesReport().render(true),
    openHuntedLog: () => new HuntedDisturbanceLog().render(true),
    openForceAlignment: (actor) => new ForceAlignmentPanel(actor).render(true),
    applyTacticalInitiative
  };
});

Hooks.on("preUpdateActor", (actor, changed) => {
  handleWounds(actor, changed);
});

Hooks.on("deleteCombat", (combat) => {
  handleStrenuousCombat(combat);
});

Hooks.on("createCombat", () => {
  postEnabledRuleReminder("tactical-initiative", "Select two or more allied combatant tokens and use the Tactical Initiative button in the combat tracker to set their shared initiative.");
  postEnabledRuleReminder("strenuous-combat", "When this combat ends, surviving combatants will roll Constitution saves for exhaustion.");
});

function usedItemFromHook(candidate) {
  return candidate?.item ?? candidate?.subject?.item ?? candidate;
}

function usedItemFromActivity(activity) {
  return activity?.item ?? activity?.subject?.item ?? activity;
}

async function handleUseItem(candidate) {
  const item = usedItemFromHook(candidate);
  await handleHuntedForcePowerCast(item);
  await handleForceAlignmentPowerCast(item);

  if (item?.type === "consumable") {
    postEnabledRuleReminder("bonus-action-consumables", `${item.name} may be usable as a bonus action if its normal activation is not already a bonus action.`);
  }
  if (item?.type === "weapon") {
    postEnabledRuleReminder("ammunition-sizes", "Confirm the weapon is using the correct ammo size category for its damage dice.");
    postEnabledRuleReminder("weapon-sundering", "If this is a Sundering attack, apply the attack to the target weapon's HP instead of the creature.");
  }
}

async function handleUseActivity(activity) {
  const item = usedItemFromActivity(activity);
  await handleHuntedForcePowerCast(item);
  await handleForceAlignmentPowerCast(item);
}

function handleRollAbilityTest(_actor, _roll, abilityId) {
  postEnabledRuleReminder("careful-checks", `If this ${abilityId?.toUpperCase?.() ?? ""} check allows extra time and care, apply the table's Careful Checks procedure.`);
  postEnabledRuleReminder("saving-throw-checks", "If this check is about resisting pressure or training, consider using the appropriate saving throw instead.");
}

Hooks.on("dnd5e.useItem", handleUseItem);
Hooks.on("sw5e.useItem", handleUseItem);
Hooks.on("dnd5e.postUseActivity", handleUseActivity);
Hooks.on("sw5e.postUseActivity", handleUseActivity);
Hooks.on("dnd5e.postBuildAttackRollConfig", handleElevationPostBuildAttackRollConfig);
Hooks.on("dnd5e.postAttackRollConfiguration", handleElevationPostAttackRollConfiguration);
Hooks.on("dnd5e.rollAbilityTest", handleRollAbilityTest);
Hooks.on("sw5e.rollAbilityTest", handleRollAbilityTest);
Hooks.on("renderActorSheet", renderForceAlignmentActorPanel);
Hooks.on("renderActorSheetV2", renderForceAlignmentActorPanel);
Hooks.on("renderActorSheet5eCharacter", renderForceAlignmentActorPanel);

Hooks.on("renderCombatTracker", (_app, html) => {
  if (!game.user.isGM || !isEnabled("tactical-initiative")) return;
  const button = $(`<button type="button" class="sw5e-vr-tactical"><i class="fas fa-users"></i> Tactical Initiative</button>`);
  button.on("click", applyTacticalInitiative);
  html.find("#combat-tracker").before(button);
});
