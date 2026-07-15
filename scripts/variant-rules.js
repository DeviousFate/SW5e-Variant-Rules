const MODULE_ID = "sw5e-variant-rules";
const SOURCE_URL = "https://sw5e.com/rules/variantRules";

const RULES = [
  rule("asi-feat", "ASI and a Feat", "character", "Manual", "Characters receiving an Ability Score Improvement can take +1 to one ability score and a feat.", "Foundry can store the final ability score and feat item, but SW5e level-up choices and balance decisions are table-managed."),
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
  rule("crueler-criticals", "Crueler Criticals", "combat", "Manual", "Critical hits become more dangerous than the default damage handling.", "Damage rolls vary heavily by system version and module workflow, so automatic mutation is unsafe."),
  rule("defense-rolls", "Defense Rolls", "combat", "Manual", "Players roll defenses instead of enemies rolling attacks against static defenses.", "This inverts the attack workflow and cannot be safely layered over normal SW5e attack resolution."),
  rule("destiny", "Destiny", "character", "Manual", "Characters use destiny-based rewards and spend options.", "Destiny awards and spend timing are narrative campaign management."),
  rule("dismemberment", "Dismemberment", "combat", "Manual", "Major injuries can remove or impair limbs under severe combat outcomes.", "The rule is injury adjudication and character-state narration, not a single mechanical flag."),
  rule("dueling", "Dueling", "combat", "Manual", "Formal duels can use special pacing or restrictions.", "Who is dueling, when outside interference matters, and what constraints apply are narrative state."),
  rule("elevation", "Elevation", "combat", "Manual", "Height and relative position can modify ranged and melee combat.", "Foundry token elevation data is not enough to infer all cover, reach, and line-of-fire rulings."),
  rule("exertion", "Exertion", "combat", "Manual", "Characters can push beyond normal limits at a cost such as exhaustion.", "The trigger and acceptable cost are player and GM choices."),
  rule("flanking", "Flanking", "combat", "Manual", "Positioning around a target can grant combat benefits.", "Reliable automation requires a grid geometry and reach model that matches the table's tokens, sizes, and diagonals."),
  rule("force-alignment", "Force Alignment", "casting", "Manual", "Force power use can interact with a character's light, dark, or universal alignment.", "Alignment consequences are campaign-state decisions."),
  rule("force-tech-prowess", "Force and Tech Prowess", "character", "Manual", "Characters can develop broader force or tech capability.", "This is feat/feature and power-list progression data."),
  rule("force-bond", "Force-Bond", "theme", "Manual", "Characters can share a force-linked bond with narrative and situational effects.", "The benefit is intentionally relationship- and scene-dependent."),
  rule("gestalt-dichotomous", "Gestalt and Dichotomous Characters", "character", "Manual", "Characters can progress through multiple class structures in nonstandard ways.", "This requires alternate character-builder progression and cannot be inferred from an actor sheet."),
  rule("hunted", "Hunted", "theme", "Manual", "A character or group gains ongoing opposition as a campaign pressure.", "This is adventure structure and encounter design."),
  rule("invocation-versatility", "Invocation Versatility", "character", "Manual", "Characters can replace invocation choices under defined circumstances.", "This is level-up and retraining bookkeeping."),
  rule("longer-rests", "Longer Rests", "resting", "Manual", "Short and long rests take longer or have stricter availability.", "The system rest button can still be clicked; enforcement depends on calendar/timekeeping modules and GM pacing."),
  rule("milestone-leveling", "Milestone Leveling", "character", "Manual", "Characters level by story milestones instead of experience totals.", "Foundry already lets GMs ignore XP; there is no extra mechanical hook needed."),
  rule("overlapping-features", "Overlapping Features", "character", "Manual", "Duplicate or overlapping features are resolved by replacement or non-stacking guidance.", "Feature equivalence and replacement choice are character-specific."),
  rule("replacing-powers", "Replacing Powers", "casting", "Manual", "Characters can replace known powers during advancement or retraining.", "This is a character-maintenance permission, not a runtime event."),
  rule("saving-throw-checks", "Saving Throw Checks", "checks", "Reminder", "Some ability checks can be rolled as saving throws when training or resistance is more appropriate.", "The module can remind GMs, but deciding check type remains contextual."),
  rule("simplified-forcecasting", "Simplified Forcecasting", "casting", "Manual", "Forcecasting can be simplified by reducing alignment or casting distinctions.", "This changes power taxonomy and feature text."),
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

function setEnabledRules(values) {
  return game.settings.set(MODULE_ID, "enabledRules", values);
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
      categories
    };
  }

  async _updateObject(_event, formData) {
    const enabled = {};
    for (const ruleData of RULES) enabled[ruleData.id] = Boolean(formData[ruleData.id]);
    await setEnabledRules(enabled);
    await game.settings.set(MODULE_ID, "chatReminders", Boolean(formData.chatReminders));
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

  game.settings.registerMenu(MODULE_ID, "config", {
    name: "Configure Variant Rules",
    label: "Configure Rules",
    hint: "Enable or disable SW5e variant rule options and review automation coverage.",
    icon: "fas fa-cogs",
    type: VariantRulesConfig,
    restricted: true
  });
});

Hooks.once("ready", () => {
  game.modules.get(MODULE_ID).api = {
    rules: RULES,
    isEnabled,
    openConfig: () => new VariantRulesConfig().render(true),
    openReport: () => new VariantRulesReport().render(true),
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

function handleUseItem(item) {
  if (item?.type === "consumable") {
    postEnabledRuleReminder("bonus-action-consumables", `${item.name} may be usable as a bonus action if its normal activation is not already a bonus action.`);
  }
  if (item?.type === "weapon") {
    postEnabledRuleReminder("ammunition-sizes", "Confirm the weapon is using the correct ammo size category for its damage dice.");
    postEnabledRuleReminder("weapon-sundering", "If this is a Sundering attack, apply the attack to the target weapon's HP instead of the creature.");
  }
}

function handleRollAbilityTest(_actor, _roll, abilityId) {
  postEnabledRuleReminder("careful-checks", `If this ${abilityId?.toUpperCase?.() ?? ""} check allows extra time and care, apply the table's Careful Checks procedure.`);
  postEnabledRuleReminder("saving-throw-checks", "If this check is about resisting pressure or training, consider using the appropriate saving throw instead.");
}

Hooks.on("dnd5e.useItem", handleUseItem);
Hooks.on("sw5e.useItem", handleUseItem);
Hooks.on("dnd5e.rollAbilityTest", handleRollAbilityTest);
Hooks.on("sw5e.rollAbilityTest", handleRollAbilityTest);

Hooks.on("renderCombatTracker", (_app, html) => {
  if (!game.user.isGM || !isEnabled("tactical-initiative")) return;
  const button = $(`<button type="button" class="sw5e-vr-tactical"><i class="fas fa-users"></i> Tactical Initiative</button>`);
  button.on("click", applyTacticalInitiative);
  html.find("#combat-tracker").before(button);
});
