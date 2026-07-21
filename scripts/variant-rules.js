const MODULE_ID = (() => {
  const match = import.meta.url.match(/\/modules\/([^/]+)\//);
  return match ? decodeURIComponent(match[1]) : "sw5e-variant-rules";
})();
const SOURCE_URL = "https://sw5e.com/rules/variantRules";
const SW5E_SETTING_NAMESPACES = ["sw5e-module", "sw5e"];
const MIDI_QOL_ID = "midi-qol";
const RECENT_HUNTED_CASTS = new Map();
const RECENT_HUNTED_RESTS = new Map();
const RECENT_ALIGNMENT_CASTS = new Map();
const RESOLVED_HUNTED_COMBATS = new Set();
const ALTERNATIVE_ARMOR_ATTACK_PROPERTY = "swvr-alt-armor-attack";
const ELEVATION_LEVELS = {
  1: { label: "Dominance", minimum: 10, bonus: 2 },
  2: { label: "Superdominance", minimum: 20, bonus: 3 },
  3: { label: "Hyperdominance", minimum: 30, bonus: 5 }
};
const HUNTED_STATUS_LADDER = [
  { count: 0, label: "Unnoticed", description: "No successful Hunted check has occurred." },
  { count: 1, label: "Detected", description: "Hunters have perceived a disturbance, but do not yet have a clear trail." },
  { count: 2, label: "Seeking", description: "Hunters are actively looking for the source of the disturbances." },
  { count: 3, label: "Tracking", description: "Hunters have narrowed their search and can follow recurring signs." },
  { count: 4, label: "Closing", description: "Hunters are close enough that their arrival is a credible threat." },
  { count: 5, label: "Hunted", description: "Hunters have identified the quarry and are prepared to act." }
];
const HUNTED_MAX_TIER = HUNTED_STATUS_LADDER[HUNTED_STATUS_LADDER.length - 1].count;
const FORCE_ALIGNMENT_DEFAULT = {
  value: 0,
  seenPowers: { lgt: {}, drk: {} },
  resolvedMinorTiers: { benevolence: {}, corruption: {} },
  majorBoons: { benevolence: null, corruption: null },
  minorTraits: [],
  deedLog: []
};

const PROGRESSION_DEFAULT = {
  mode: "normal",
  primaryClassId: "",
  secondaryClassId: "",
  savingThrowSource: "primary",
  skillSource: "primary",
  equipmentSource: "primary",
  asiMode: "single",
  dichotomousClassId: "",
  archetypeIds: [],
  gestaltArchetypeIds: {},
  archetypeGrantMode: "both"
};

const GESTALT_ASI_LEVELS = [4, 8, 12, 16, 19];
const STANDARD_HIT_DICE = [4, 6, 8, 10, 12];
const PROGRESSION_NOTE_NAME = "SWVR Gestalt / Dichotomous Progression Notes";
const PROGRESSION_CLASS_REFERENCE_PREFIX = "SWVR Gestalt Class Reference";
const PROGRESSION_ARCHETYPE_REFERENCE_PREFIX = "SWVR Archetype Reference";
const GESTALT_PREPARED_PATCH_FLAG = "__swvrGestaltPreparedDataPatch";
const GESTALT_BASE_PATCH_FLAG = "__swvrGestaltBaseDataPatch";
const GESTALT_DERIVED_PATCH_FLAG = "__swvrGestaltDerivedDataPatch";

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

const FORCE_ALIGNMENT_TIER5_BOONS = {
  benevolence: [
    { roll: 1, name: "Lightbringer" },
    { roll: 2, name: "Protection" },
    { roll: 3, name: "Immutable Defense" },
    { roll: 4, name: "Quick Casting" },
    { roll: 5, name: "Lay On Hands" },
    { roll: 6, name: "Healer" }
  ],
  corruption: [
    { roll: 1, name: "Deathbringer" },
    { roll: 2, name: "Invincibility" },
    { roll: 3, name: "Irresistible Offense" },
    { roll: 4, name: "Quick Casting" },
    { roll: 5, name: "Recovery" },
    { roll: 6, name: "Power Mastery" }
  ]
};

const RULES = [
  rule("asi-feat", "ASI and a Feat", "character", "Automated", "Characters receiving an Ability Score Improvement can take +1 to one ability score and a feat.", "When enabled, the SW5e module's ASI and Feat setting is turned on. When disabled, it is turned off."),
  rule("aging", "Aging", "character", "Manual", "Characters crossing age thresholds receive GM-chosen or rolled aging quirks and boons.", "The rule depends on species-specific thresholds and GM-selected permanent changes."),
  rule("alternate-casting", "Alternate Casting", "character", "Manual", "Forcecasting and techcasting can be swapped across classes and archetypes, including casting ability, saves, points, and recovery cadence.", "This requires alternate class progression, feature, and power-list data rather than a combat hook."),
  rule("alternative-armor", "Alternative Armor", "combat", "Automated", "Armor shifts from avoidance toward damage reduction, with base AC using proficiency bonus and armor/enhancement bonuses converting into DR.", "Automated as a calculated SWVR Actor Sheet panel and D&D5e damage-application hook. Attack-activity damage rolls are tagged when rolled; when applied, armor/natural/unarmored DR reduces positive damage to a minimum of 1. The actor's core AC field is not rewritten."),
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
  rule("elevation", "Elevation", "combat", "Automated", "Creatures at sufficient height and horizontal distance gain the Elevation attack, AC, and Dexterity-save adjustments.", "Automated for attacks against one targeted token and Dexterity saves whose controlling creature can be resolved from the originating activity message or one targeted token. Cover and detected Sharpshooter Mastery-style feats modify the relational bonuses as prescribed. The advantage/disadvantage guidance remains GM-adjudicated."),
  rule("exertion", "Exertion", "combat", "Manual", "Characters can push beyond normal limits at a cost such as exhaustion.", "The trigger and acceptable cost are player and GM choices."),
  rule("flanking", "Flanking", "combat", "Manual", "Positioning around a target can grant combat benefits.", "Reliable automation requires a grid geometry and reach model that matches the table's tokens, sizes, and diagonals."),
  rule("force-alignment", "Force Alignment", "casting", "Automated", "Force power use shifts a character toward light or dark alignment, with tier saves for minor traits.", "Automated for class-sourced light and dark Force powers of 1st level or higher. At-wills, universal powers, tech powers, and detectable non-class sources are ignored. GM deed adjustments and trait logs are available on the SWVR Actor Sheet panel."),
  rule("force-tech-prowess", "Force and Tech Prowess", "character", "Manual", "Characters can develop broader force or tech capability.", "This is feat/feature and power-list progression data."),
  rule("force-bond", "Force-Bond", "theme", "Manual", "Characters can share a force-linked bond with narrative and situational effects.", "The benefit is intentionally relationship- and scene-dependent."),
  rule("gestalt-dichotomous", "Gestalt and Dichotomous Characters", "character", "Assisted", "Characters can progress through multiple class structures in nonstandard ways.", "The SWVR Actor Sheet stores Gestalt/Dichotomous configuration, scans class and archetype items, calculates effective hit die and XP guidance, corrects prepared level/proficiency/HP/hit dice for Gestalt actors, flags ASI/multiclass conflicts, and can create a GM-reviewed progression note item."),
  rule("hunted", "Hunted", "theme", "Automated", "Each player has a persistent Disturbance Point pool that increases when they cast Force powers by the power's level; at-wills count as level 0.", "Automated for SW5E Force powers cast during combat encounters only. At combat end, the GM rolls d100 against each applicable pool; success records a Hunted status and advances hunter perception without clearing the pool. Each completed long rest reduces the pool by the resting actor's level. GMs can manually adjust the pool and Hunted tier. Tech powers are ignored."),
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

function midiQolActive() {
  return Boolean(game.modules?.get(MIDI_QOL_ID)?.active);
}

function midiQolVersion() {
  return game.modules?.get(MIDI_QOL_ID)?.version ?? "";
}

function midiWorkflowEnabled() {
  if (!midiQolActive()) return false;
  const settingKey = `${MIDI_QOL_ID}.EnableWorkflow`;
  return !game.settings.settings.has(settingKey) || Boolean(game.settings.get(MIDI_QOL_ID, "EnableWorkflow"));
}

function midiConfigSettings(clone = true) {
  if (!midiQolActive() || !game.settings.settings.has(`${MIDI_QOL_ID}.ConfigSettings`)) return null;
  const config = game.settings.get(MIDI_QOL_ID, "ConfigSettings") ?? {};
  return clone ? foundry.utils.deepClone(config) : config;
}

function midiOptionalRulesActive(config) {
  let enabled = Boolean(config?.optionalRulesEnabled);
  if (game.user?.isGM && config?.toggleOptionalRules) enabled = !enabled;
  return enabled;
}

function midiChallengeModeArmorActive() {
  const config = midiConfigSettings(false);
  return Boolean(
    config
    && midiWorkflowEnabled()
    && midiOptionalRulesActive(config)
    && ![undefined, false, "none"].includes(config.optionalRules?.challengeModeArmor)
  );
}

function alternativeArmorAutomationAvailable() {
  return isEnabled("alternative-armor") && !midiChallengeModeArmorActive();
}

function midiCompatibilityState() {
  if (!midiQolActive()) {
    return {
      active: false,
      version: "",
      entries: [],
      hasEntries: false,
      hasActionable: false,
      hasBackup: false,
      summary: "Midi-QOL is not active. SWVR is using native D&D5e/SW5e hooks."
    };
  }

  const config = midiConfigSettings() ?? {};
  const workflowActive = midiWorkflowEnabled();
  const optionalRulesActive = workflowActive && midiOptionalRulesActive(config);
  const entries = [];
  const add = (id, label, status, detail, current, recommended, actionable = false) => {
    entries.push({
      id,
      label,
      status,
      statusClass: status.toLowerCase(),
      detail,
      current,
      recommended,
      actionable
    });
  };

  if (isEnabled("alternative-armor") && optionalRulesActive && ![undefined, false, "none"].includes(config.optionalRules?.challengeModeArmor)) {
    add(
      "challenge-mode-armor",
      "Alternative Armor / Challenge Mode Armor",
      "Conflict",
      "Both modules would alter armor-based hit and damage resolution.",
      String(config.optionalRules.challengeModeArmor),
      "Challenge Mode Armor: none",
      true
    );
  }

  if (isEnabled("elevation")) {
    const coverMode = String(config.optionalRules?.coverCalculation ?? "none");
    add(
      "elevation-cover",
      "Elevation / Midi Cover",
      "Adapted",
      !workflowActive
        ? "Midi's workflow engine is disabled; SWVR is using its native status-based path."
        : coverMode === "none"
          ? "SWVR is using status-based cover."
          : "SWVR will query Midi's cover API and compensate for Midi's later attack and Dexterity-save cover adjustments.",
      coverMode,
      "No change required"
    );
  }

  if (isEnabled("crueler-criticals")) {
    const playerMode = String(config.criticalDamage ?? "default");
    const gmMode = String(config.criticalDamageGM ?? playerMode);
    if (playerMode !== "default" || gmMode !== "default") {
      add(
        "critical-damage",
        "Crueler Criticals / Midi Critical Damage",
        "Conflict",
        "Midi's custom critical modes override the D&D5e setting controlled by SWVR.",
        `Player: ${playerMode}; GM: ${gmMode}`,
        "Player and GM: default",
        true
      );
    }
  }

  if (isEnabled("defense-rolls") && optionalRulesActive && Boolean(config.optionalRules?.activeDefence)) {
    add(
      "active-defence",
      "Defense Rolls / Active Defence",
      "Handled",
      "SWVR has no competing automation; Midi-QOL is the mechanical provider for this enabled rule.",
      "Active Defence enabled",
      "No change required"
    );
  }

  if (isEnabled("critical-saving-throws") && optionalRulesActive && Boolean(config.optionalRules?.criticalSaves)) {
    add(
      "critical-saves",
      "Critical Saving Throws / Midi Critical Saves",
      "Conflict",
      "Midi automates natural 1/20 outcomes, while SWVR leaves the rule's contextual consequences to the GM.",
      "Critical Saves enabled",
      "Critical Saves disabled",
      true
    );
  }

  if (isEnabled("wounds") && Number(config.addWounded ?? 0) > 0 && String(config.addWoundedStyle ?? "none") !== "none") {
    add(
      "wounded-status",
      "Wounds / Midi Wounded Status",
      "Conflict",
      "Midi's percentage-based Wounded status represents a different state from SWVR Wounded Levels.",
      `${config.addWounded}% (${config.addWoundedStyle})`,
      "Percentage-based Wounded status disabled",
      true
    );
  }

  const backup = game.settings.settings.has(`${MODULE_ID}.midiCompatibilityBackup`)
    ? game.settings.get(MODULE_ID, "midiCompatibilityBackup")
    : {};
  const conflicts = entries.filter((entry) => entry.status === "Conflict").length;
  return {
    active: true,
    version: midiQolVersion(),
    entries,
    hasEntries: entries.length > 0,
    hasActionable: entries.some((entry) => entry.actionable),
    hasBackup: Boolean(backup?.values && Object.keys(backup.values).length),
    summary: conflicts
      ? `${conflicts} active compatibility conflict${conflicts === 1 ? "" : "s"} detected.`
      : "No active Midi-QOL conflicts detected."
  };
}

function confirmCompatibilityChange(title, content, confirmLabel) {
  return new Promise((resolve) => {
    let resolved = false;
    const finish = (value) => {
      if (resolved) return;
      resolved = true;
      resolve(value);
    };
    new Dialog({
      title,
      content,
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: confirmLabel,
          callback: () => finish(true)
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel",
          callback: () => finish(false)
        }
      },
      default: "cancel",
      close: () => finish(false)
    }).render(true);
  });
}

function midiCompatibilityRecommendedChanges(config) {
  const changes = [];
  const set = (path, value, label) => {
    const current = foundry.utils.getProperty(config, path);
    if (current === value) return;
    changes.push({ path, current, value, label });
  };

  if (isEnabled("alternative-armor") && midiWorkflowEnabled()) {
    set("optionalRules.challengeModeArmor", "none", "Disable Midi Challenge Mode Armor");
  }
  if (isEnabled("crueler-criticals")) {
    set("criticalDamage", "default", "Use D&D5e critical damage for players");
    set("criticalDamageGM", "default", "Use D&D5e critical damage for the GM");
  }
  if (isEnabled("critical-saving-throws") && midiWorkflowEnabled()) {
    set("optionalRules.criticalSaves", false, "Disable Midi Critical Saves");
  }
  if (isEnabled("wounds")) {
    set("addWounded", 0, "Disable Midi percentage-based Wounded threshold");
    set("addWoundedStyle", "none", "Disable Midi percentage-based Wounded style");
  }
  return changes;
}

async function applyRecommendedMidiCompatibilitySettings() {
  if (!game.user.isGM || !midiQolActive()) return;
  const config = midiConfigSettings();
  if (!config) return;
  const changes = midiCompatibilityRecommendedChanges(config);
  if (!changes.length) {
    ui.notifications.info("Midi-QOL compatibility settings already match SWVR recommendations.");
    return;
  }

  const confirmed = await confirmCompatibilityChange(
    "Apply Midi-QOL Compatibility Settings",
    `<p>SWVR will make the following Midi-QOL configuration changes:</p><ul>${changes.map((change) => `<li>${change.label}</li>`).join("")}</ul><p>The previous values will be retained for restoration.</p>`,
    "Apply Settings"
  );
  if (!confirmed) return;

  const existingBackup = game.settings.get(MODULE_ID, "midiCompatibilityBackup") ?? {};
  const backupValues = foundry.utils.deepClone(existingBackup.values ?? {});
  for (const change of changes) {
    if (!Object.prototype.hasOwnProperty.call(backupValues, change.path)) backupValues[change.path] = change.current;
    foundry.utils.setProperty(config, change.path, change.value);
  }
  await game.settings.set(MODULE_ID, "midiCompatibilityBackup", {
    version: midiQolVersion(),
    savedAt: new Date().toISOString(),
    values: backupValues
  });
  await game.settings.set(MIDI_QOL_ID, "ConfigSettings", config);
  ui.notifications.info("Recommended Midi-QOL compatibility settings applied.");
}

async function restoreMidiCompatibilitySettings() {
  if (!game.user.isGM || !midiQolActive()) return;
  const backup = game.settings.get(MODULE_ID, "midiCompatibilityBackup") ?? {};
  if (!backup.values || !Object.keys(backup.values).length) {
    ui.notifications.warn("No SWVR Midi-QOL settings backup is available.");
    return;
  }
  const confirmed = await confirmCompatibilityChange(
    "Restore Midi-QOL Settings",
    "<p>Restore the Midi-QOL values saved before SWVR applied its compatibility recommendations?</p>",
    "Restore Settings"
  );
  if (!confirmed) return;

  const config = midiConfigSettings();
  if (!config) return;
  for (const [path, value] of Object.entries(backup.values)) foundry.utils.setProperty(config, path, value);
  await game.settings.set(MIDI_QOL_ID, "ConfigSettings", config);
  await game.settings.set(MODULE_ID, "midiCompatibilityBackup", {});
  ui.notifications.info("Previous Midi-QOL settings restored.");
}

function notifyMidiCompatibilityConflicts() {
  if (!game.user.isGM) return;
  const state = midiCompatibilityState();
  const count = state.entries.filter((entry) => entry.status === "Conflict").length;
  if (!count) return;
  ui.notifications.warn(`SWVR detected ${count} active Midi-QOL compatibility conflict${count === 1 ? "" : "s"}. Open Configure Rules to review them.`);
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

function actorAbilityMod(actor, abilityId) {
  return Number(getActorSystem(actor, `abilities.${abilityId}.mod`) ?? 0);
}

function actorProficiencyBonus(actor) {
  return Number(getActorSystem(actor, "attributes.prof") ?? getActorSystem(actor, "prof") ?? 0);
}

function isResponsibleGM() {
  if (!game.user.isGM) return false;
  const activeGms = game.users.filter((user) => user.active && user.isGM).sort((a, b) => a.id.localeCompare(b.id));
  return activeGms[0]?.id === game.user.id;
}

function resolveUserForActor(actor, fallbackUserId = game.user.id) {
  if (!actor) return game.users.get(fallbackUserId) ?? game.user;
  const fallbackUser = game.users.get(fallbackUserId);
  if (fallbackUser && !fallbackUser.isGM && actor.testUserPermission?.(fallbackUser, "OWNER")) return fallbackUser;
  const owners = game.users
    .filter((user) => !user.isGM && actor.testUserPermission?.(user, "OWNER"))
    .sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name));
  return owners[0] ?? fallbackUser ?? game.user;
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

function huntedStatusForCount(count) {
  const numeric = Math.max(0, Math.trunc(Number(count ?? 0)));
  return [...HUNTED_STATUS_LADDER].reverse().find((status) => numeric >= status.count) ?? HUNTED_STATUS_LADDER[0];
}

function huntedStatusView(entry = {}) {
  const huntedCount = Math.min(HUNTED_MAX_TIER, Math.max(0, Math.trunc(Number(entry.huntedCount ?? 0))));
  const status = huntedStatusForCount(huntedCount);
  return {
    huntedCount,
    huntedStatusLabel: status.label,
    huntedStatusDescription: status.description,
    canDecreaseHuntedTier: huntedCount > 0,
    canIncreaseHuntedTier: huntedCount < HUNTED_MAX_TIER
  };
}

function activeCombatForActor(actor) {
  if (!actor) return null;
  const combat = game.combat;
  if (!combat) return null;
  const combatants = combat.combatants ?? [];
  return combatants.some((combatant) => combatant.actor?.id === actor.id) ? combat : null;
}

function combatIdentifiers(combat) {
  return new Set([combat?.id, combat?._id, combat?.uuid].filter(Boolean).map(String));
}

function combatLabel(combat) {
  return combat?.name ?? combat?.scene?.name ?? "Combat Encounter";
}

function actorIdsForCombat(combat) {
  return new Set([...combat?.combatants ?? []].map((combatant) => combatant.actor?.id).filter(Boolean));
}

function userOwnsAnyActorId(user, actorIds) {
  if (!user || !actorIds?.size) return false;
  return [...actorIds].some((actorId) => {
    const actor = game.actors?.get(actorId);
    return actor?.testUserPermission?.(user, "OWNER");
  });
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
      total: Number(ledger[user.id]?.total ?? 0),
      ...huntedStatusView(ledger[user.id])
    });
  }

  for (const entry of Object.values(ledger)) {
    const hasActorEntry = (entry.entries ?? []).some((cast) => cast.actorId === actor.id);
    if (!hasActorEntry) continue;
    pools.set(entry.userId, {
      userId: entry.userId,
      userName: game.users.get(entry.userId)?.name ?? entry.userName ?? "Unknown User",
      total: Number(entry.total ?? 0),
      ...huntedStatusView(entry)
    });
  }

  return [...pools.values()].sort((a, b) => String(a.userName).localeCompare(String(b.userName)));
}

function huntedRestLevel(actor) {
  const level = Number(getActorSystem(actor, "details.level") ?? 0);
  return Number.isFinite(level) ? Math.max(0, Math.trunc(level)) : 0;
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

function midiWorkflowFromRollProcess(process, rollConfig) {
  if (!midiWorkflowEnabled()) return null;
  const workflow = process?.midiOptions?.workflow
    ?? process?.options?.midiOptions?.workflow
    ?? process?.config?.midiOptions?.workflow
    ?? rollConfig?.midiOptions?.workflow
    ?? rollConfig?.options?.midiOptions?.workflow;
  if (workflow) return workflow;
  const workflowId = process?.midiOptions?.workflowId
    ?? process?.options?.midiOptions?.workflowId
    ?? process?.config?.midiOptions?.workflowId
    ?? rollConfig?.midiOptions?.workflowId
    ?? rollConfig?.options?.midiOptions?.workflowId
    ?? rollConfig?.options?.workflowId;
  if (!workflowId) return null;
  return globalThis.MidiQOL?.Workflow?.getWorkflow?.(workflowId) ?? null;
}

function tokenFromMidiWorkflow(workflow) {
  if (!workflow) return null;
  if (workflow.token?.actor) return workflow.token;
  const tokenDocument = workflow.tokenUuid ? fromUuidSync(workflow.tokenUuid) : null;
  if (tokenDocument?.object?.actor) return tokenDocument.object;
  if (tokenDocument?.actor) return tokenDocument;
  return activeTokenForActor(workflow.actor ?? workflow.activity?.actor ?? workflow.item?.actor);
}

function midiDynamicCoverBonus(attackerToken, targetToken, activity) {
  if (!midiWorkflowEnabled() || !attackerToken || !targetToken) return 0;
  try {
    return normalizeCoverBonus(globalThis.MidiQOL?.computeCoverBonus?.(attackerToken, targetToken, activity));
  } catch (error) {
    console.warn(`${MODULE_ID} | Midi-QOL cover calculation failed; using status cover only.`, error);
    return 0;
  }
}

function normalizeCoverBonus(value) {
  const numeric = Number(value ?? 0);
  if (numeric === Infinity || numeric >= 999) return Infinity;
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
}

function targetCoverLevel(token, { attackerToken = null, activity = null } = {}) {
  const normalized = collectTokenStatusText(token).map((value) => normalizeKeywordText(value).replace(/\s+/g, ""));
  const systemBonus = normalizeCoverBonus(getActorSystem(token?.actor, "attributes.ac.cover") ?? token?.actor?.coverBonus);
  const midiBonus = midiDynamicCoverBonus(attackerToken, token, activity);
  const appliedBonus = midiBonus === Infinity ? Infinity : Math.max(systemBonus, midiBonus);
  if (normalized.some((value) => value.includes("covertotal") || value.includes("totalcover"))) {
    return { level: 4, label: "Total Cover", bonus: 0, systemBonus, midiBonus, appliedBonus: Infinity, total: true };
  }
  if (systemBonus === Infinity || midiBonus === Infinity) {
    return { level: 4, label: "Total Cover", bonus: 0, systemBonus, midiBonus, appliedBonus: Infinity, total: true };
  }

  let cover = { level: 0, label: "", bonus: 0 };
  if (normalized.some((value) => value.includes("coverthreequarters") || value.includes("threequarterscover") || value.includes("threequartercover"))) {
    cover = { level: 3, label: "Three-Quarters Cover", bonus: 5 };
  } else if (normalized.some((value) => value.includes("coverhalf") || value.includes("halfcover"))) {
    cover = { level: 2, label: "Half Cover", bonus: 3 };
  } else if (normalized.some((value) => value.includes("coverquarter") || value.includes("quartercover") || value.includes("onequartercover"))) {
    cover = { level: 1, label: "One-Quarter Cover", bonus: 2 };
  } else if (systemBonus >= 5) {
    cover = { level: 3, label: "Three-Quarters Cover", bonus: 5 };
  } else if (systemBonus >= 3) {
    cover = { level: 2, label: "Half Cover", bonus: 3 };
  } else if (systemBonus >= 2) {
    cover = { level: 1, label: "One-Quarter Cover", bonus: 2 };
  }

  const midiCover = midiBonus >= 5
    ? { level: 3, label: "Three-Quarters Cover (Midi)", bonus: 5 }
    : midiBonus >= 3
      ? { level: 2, label: "Half Cover (Midi)", bonus: 3 }
      : midiBonus >= 2
        ? { level: 1, label: "One-Quarter Cover (Midi)", bonus: 2 }
        : { level: 0, label: "", bonus: 0 };
  if (midiCover.level > cover.level || midiCover.bonus > cover.bonus) cover = midiCover;
  return { ...cover, systemBonus, midiBonus, appliedBonus, total: false };
}

function actorSharpshooterCoverBypass(actor) {
  const matches = [];
  if (actor?.flags?.[MIDI_QOL_ID]?.sharpShooter || actor?.flags?.dnd5e?.sharpShooter) {
    matches.push("Configured Sharpshooter flag");
  }
  if (actor?.flags?.dnd5e?.spellSniper) matches.push("Configured Spell Sniper flag");
  for (const item of actor?.items ?? []) {
    if (item.type !== "feat") continue;
    const text = normalizeKeywordText(`${item.name ?? ""} ${itemDescriptionText(item)} ${itemSourceLabel(item)}`);
    const compact = text.replace(/\s+/g, "");
    const namedMastery = compact.includes("sharpshootermastery");
    const sharpshooterCoverText = /\bsharpshooter\b/.test(text)
      && /\bcover\b/.test(text)
      && (/\b(ignore|ignores|ignored|ignoring)\b/.test(text) || /\b(benefit|benefits)\b/.test(text));
    if ((namedMastery || sharpshooterCoverText) && !matches.includes(item.name)) matches.push(item.name ?? "Sharpshooter feat");
  }
  return matches;
}

function baseElevationDominance(verticalFeet, horizontalFeet) {
  if (verticalFeet >= ELEVATION_LEVELS[3].minimum && horizontalFeet >= ELEVATION_LEVELS[3].minimum) return 3;
  if (verticalFeet >= ELEVATION_LEVELS[2].minimum && horizontalFeet >= ELEVATION_LEVELS[2].minimum) return 2;
  if (verticalFeet >= ELEVATION_LEVELS[1].minimum && horizontalFeet >= ELEVATION_LEVELS[1].minimum) return 1;
  return 0;
}

function elevationParticipant(token) {
  return {
    actorId: token?.actor?.id,
    actorName: token?.actor?.name,
    tokenId: token?.id ?? token?.document?.id,
    tokenName: token?.name ?? token?.document?.name
  };
}

function elevationRollPart(adjustment, label) {
  const value = Number(adjustment ?? 0);
  return `${value >= 0 ? "+" : ""}${value}[SWVR Elevation: ${label}]`;
}

function originatingMessageFromRollProcess(process) {
  const element = process?.event?.target ?? process?.event?.currentTarget;
  const messageId = element?.closest?.("[data-message-id]")?.dataset?.messageId;
  return messageId ? game.messages?.get(messageId) : null;
}

function tokenFromMessageSpeaker(message) {
  const speaker = message?.speaker ?? message?.data?.speaker;
  if (!speaker) return null;
  if (canvas?.ready && speaker.token) {
    const token = canvas.tokens?.get(speaker.token);
    if (token) return token;
  }
  const actor = speaker.actor ? game.actors?.get(speaker.actor) : null;
  return activeTokenForActor(actor);
}

function elevationSourceTokenForSave(process, rollConfig) {
  const savingActor = process?.subject;
  const workflow = midiWorkflowFromRollProcess(process, rollConfig);
  const workflowToken = tokenFromMidiWorkflow(workflow);
  if (workflowToken?.actor?.id && workflowToken.actor.id !== savingActor?.id) {
    return {
      token: workflowToken,
      method: "midiWorkflow",
      activity: workflow?.activity,
      workflowId: workflow?.id
    };
  }

  const messageToken = tokenFromMessageSpeaker(originatingMessageFromRollProcess(process));
  if (messageToken?.actor?.id && messageToken.actor.id !== savingActor?.id) {
    return { token: messageToken, method: "originatingMessage", activity: null, workflowId: null };
  }

  const target = singleTargetToken();
  if (target?.actor?.id && target.actor.id !== savingActor?.id) {
    return { token: target, method: "target", activity: null, workflowId: null };
  }
  return null;
}

function evaluateElevationAttackAdjustment(process, attackMode) {
  if (!isEnabled("elevation")) return null;

  const activity = process?.subject;
  const actor = activity?.actor ?? activity?.item?.actor;
  const attackerToken = activeTokenForActor(actor);
  const targetToken = singleTargetToken();
  if (!actor || !attackerToken || !targetToken) return null;

  const verticalFeet = tokenElevation(attackerToken) - tokenElevation(targetToken);
  const horizontalFeet = horizontalTokenDistance(attackerToken, targetToken);
  const rangedAttack = isRangedAttackProcess(process, attackMode);
  const common = {
    source: "SW5e Elevation",
    verticalFeet: Math.round(verticalFeet * 100) / 100,
    horizontalFeet: Math.round(horizontalFeet * 100) / 100,
    attacker: elevationParticipant(attackerToken),
    target: elevationParticipant(targetToken)
  };

  if (verticalFeet > 0) {
    if (!rangedAttack) return null;
    const baseLevel = baseElevationDominance(verticalFeet, horizontalFeet);
    if (!baseLevel) return null;
    const cover = targetCoverLevel(targetToken, { attackerToken, activity });
    if (cover.total) return null;
    const sharpshooterMatches = actorSharpshooterCoverBypass(actor);
    const coverIgnored = cover.level > 0 && sharpshooterMatches.length > 0;
    const effectiveLevel = Math.max(0, baseLevel - (coverIgnored ? 0 : cover.level));
    const base = ELEVATION_LEVELS[baseLevel];
    const effective = ELEVATION_LEVELS[effectiveLevel];
    const bonus = effective?.bonus ?? 0;
    const coverLabel = cover.label
      ? coverIgnored
        ? `${cover.label} ignored`
        : `${cover.label} reduces ${base.label} to ${effective?.label ?? "no dominance"}`
      : "";
    return {
      ...common,
      effect: "rangedAttack",
      label: effective?.label ?? "No Dominance",
      baseLabel: base.label,
      level: effectiveLevel,
      baseLevel,
      bonus,
      formulaAdjustment: cover.appliedBonus + bonus,
      formulaLabel: `${effective?.label ?? "Dominance negated"} ranged attack${coverLabel ? `; ${coverLabel}` : ""}`,
      cover: {
        ...cover,
        ignoredBySharpshooter: coverIgnored
      },
      sharpshooterFeats: sharpshooterMatches
    };
  }

  const baseLevel = baseElevationDominance(-verticalFeet, horizontalFeet);
  if (!baseLevel) return null;
  const cover = targetCoverLevel(targetToken, { attackerToken, activity });
  if (cover.total) return null;
  const sharpshooterMatches = actorSharpshooterCoverBypass(actor);
  const coverIgnored = rangedAttack && cover.level > 0 && sharpshooterMatches.length > 0;
  const dominance = ELEVATION_LEVELS[baseLevel];
  const desiredDefense = coverIgnored ? dominance.bonus : Math.max(dominance.bonus, cover.bonus);
  const defenseLabel = cover.label && !coverIgnored && cover.bonus > dominance.bonus
    ? cover.label
    : dominance.label;
  return {
    ...common,
    effect: "targetAC",
    label: dominance.label,
    baseLabel: dominance.label,
    level: baseLevel,
    baseLevel,
    bonus: dominance.bonus,
    acBonus: desiredDefense,
    formulaAdjustment: cover.appliedBonus - desiredDefense,
    formulaLabel: `${dominance.label} target AC +${desiredDefense}${cover.label ? `; uses ${defenseLabel}` : ""}`,
    cover: {
      ...cover,
      ignoredBySharpshooter: coverIgnored
    },
    sharpshooterFeats: sharpshooterMatches
  };
}

function handleElevationPostBuildAttackRollConfig(process, rollConfig, index) {
  if (index !== 0 || !isEnabled("elevation")) return;
  const detail = evaluateElevationAttackAdjustment(process, rollConfig?.options?.attackMode);
  if (!detail) return;

  rollConfig.parts ??= [];
  if (rollConfig.parts.some((part) => String(part).includes("SWVR Elevation"))) return;

  rollConfig.parts.push(elevationRollPart(detail.formulaAdjustment, detail.formulaLabel));
  rollConfig.options ??= {};
  rollConfig.options.swvrElevation = detail;
}

function evaluateElevationDexSaveAdjustment(process, rollConfig) {
  if (!isEnabled("elevation") || String(process?.ability ?? "").toLowerCase() !== "dex") return null;
  const savingActor = process?.subject;
  const savingToken = activeTokenForActor(savingActor);
  const source = elevationSourceTokenForSave(process, rollConfig);
  const sourceToken = source?.token;
  const sourceActor = sourceToken?.actor;
  if (!savingActor || !savingToken || !sourceActor || !sourceToken) return null;

  const verticalFeet = tokenElevation(savingToken) - tokenElevation(sourceToken);
  const horizontalFeet = horizontalTokenDistance(savingToken, sourceToken);
  const cover = targetCoverLevel(savingToken, { attackerToken: sourceToken, activity: source.activity });
  if (cover.total) return null;
  const sharpshooterMatches = actorSharpshooterCoverBypass(sourceActor);
  const coverIgnored = cover.level > 0 && sharpshooterMatches.length > 0;
  const common = {
    source: "SW5e Elevation",
    sourceResolution: source.method,
    workflowId: source.workflowId,
    verticalFeet: Math.round(verticalFeet * 100) / 100,
    horizontalFeet: Math.round(horizontalFeet * 100) / 100,
    saver: elevationParticipant(savingToken),
    controller: elevationParticipant(sourceToken),
    cover: {
      ...cover,
      ignoredBySharpshooter: coverIgnored
    },
    sharpshooterFeats: sharpshooterMatches
  };

  if (verticalFeet > 0) {
    const level = baseElevationDominance(verticalFeet, horizontalFeet);
    if (!level) return null;
    const dominance = ELEVATION_LEVELS[level];
    const desiredBonus = coverIgnored ? dominance.bonus : Math.max(dominance.bonus, cover.bonus);
    const defenseLabel = cover.label && !coverIgnored && cover.bonus > dominance.bonus
      ? cover.label
      : dominance.label;
    return {
      ...common,
      effect: "dexSaveBonus",
      label: dominance.label,
      level,
      baseLevel: level,
      bonus: dominance.bonus,
      saveBonus: desiredBonus,
      formulaAdjustment: desiredBonus - cover.appliedBonus,
      formulaLabel: `${dominance.label} Dexterity save +${desiredBonus}${cover.label ? `; uses ${defenseLabel}` : ""}`
    };
  }

  const baseLevel = baseElevationDominance(-verticalFeet, horizontalFeet);
  if (!baseLevel) return null;
  const base = ELEVATION_LEVELS[baseLevel];
  const effectiveLevel = Math.max(0, baseLevel - (coverIgnored ? 0 : cover.level));
  const effective = ELEVATION_LEVELS[effectiveLevel];
  const penalty = effective?.bonus ?? 0;
  const coverLabel = cover.label
    ? coverIgnored
      ? `${cover.label} ignored`
      : `${cover.label} reduces ${base.label} to ${effective?.label ?? "no dominance"}`
    : "";
  return {
    ...common,
    effect: "dexSavePenalty",
    label: effective?.label ?? "No Dominance",
    baseLabel: base.label,
    level: effectiveLevel,
    baseLevel,
    bonus: penalty,
    savePenalty: penalty,
    formulaAdjustment: -cover.appliedBonus - penalty,
    formulaLabel: `${effective?.label ?? "Dominance negated"} Dexterity save penalty${penalty ? ` -${penalty}` : ""}${coverLabel ? `; ${coverLabel}` : ""}`
  };
}

function handleElevationPostBuildSavingThrowRollConfig(process, rollConfig, index) {
  if (index !== 0 || !isEnabled("elevation")) return;
  const detail = evaluateElevationDexSaveAdjustment(process, rollConfig);
  if (!detail) return;
  rollConfig.parts ??= [];
  if (rollConfig.parts.some((part) => String(part).includes("SWVR Elevation"))) return;
  rollConfig.parts.push(elevationRollPart(detail.formulaAdjustment, detail.formulaLabel));
  rollConfig.options ??= {};
  rollConfig.options.swvrElevationSave = detail;
}

function handleAlternativeArmorPostBuildAttackRollConfig(_process, rollConfig, index) {
  if (index !== 0 || !alternativeArmorAutomationAvailable()) return;
  const target = singleTargetToken();
  const actor = target?.actor;
  if (!actor) return;
  const summary = alternativeArmorSummary(actor);
  if (!summary.currentAc || !summary.value) return;

  const delta = summary.currentAc - summary.value;
  if (!delta) return;

  rollConfig.parts ??= [];
  if (rollConfig.parts.some((part) => String(part).includes("SWVR Alternative Armor"))) return;
  const sign = delta > 0 ? "+" : "";
  rollConfig.parts.push(`${sign}${delta}[SWVR Alternative Armor: target AC ${summary.value}]`);
  rollConfig.options ??= {};
  rollConfig.options.swvrAlternativeArmor = {
    targetActorId: actor.id,
    targetName: actor.name,
    normalAc: summary.currentAc,
    alternativeAc: summary.value,
    attackDelta: delta,
    dr: summary.dr
  };
}

function handleElevationPostAttackRollConfiguration(rolls, process, _dialog, message) {
  if (!isEnabled("elevation")) return;
  const detail = rolls?.[0]?.options?.swvrElevation;
  if (!detail) return;
  foundry.utils.setProperty(message, `data.flags.${MODULE_ID}.elevation`, detail);
}

function handleElevationPostSavingThrowRollConfiguration(rolls, _process, _dialog, message) {
  if (!isEnabled("elevation")) return;
  const detail = rolls?.[0]?.options?.swvrElevationSave;
  if (!detail) return;
  foundry.utils.setProperty(message, `data.flags.${MODULE_ID}.elevationSave`, detail);
}

function handleAlternativeArmorPostAttackRollConfiguration(rolls, _process, _dialog, message) {
  if (!alternativeArmorAutomationAvailable()) return;
  const detail = rolls?.[0]?.options?.swvrAlternativeArmor;
  if (!detail) return;
  foundry.utils.setProperty(message, `data.flags.${MODULE_ID}.alternativeArmor`, detail);
}

function equippedArmorItems(actor) {
  return [...(actor?.items ?? [])].filter((item) => {
    if (item.type !== "equipment" || !item.system?.equipped) return false;
    return ["light", "medium", "heavy", "shield"].includes(item.system?.type?.value);
  });
}

function equippedArmor(actor) {
  return getActorSystem(actor, "attributes.ac.equippedArmor")
    ?? equippedArmorItems(actor).find((item) => item.system?.type?.value !== "shield")
    ?? null;
}

function equippedShield(actor) {
  return getActorSystem(actor, "attributes.ac.equippedShield")
    ?? equippedArmorItems(actor).find((item) => item.system?.type?.value === "shield")
    ?? null;
}

function armorValue(item) {
  return Number(item?.system?.armor?.value ?? item?.system?.armor?.base ?? 0);
}

function armorDexCap(item) {
  const cap = item?.system?.armor?.dex;
  return Number.isFinite(Number(cap)) ? Number(cap) : Infinity;
}

function hasConfiguredDamageModification(actor) {
  const damageModification = getActorSystem(actor, "traits.dm");
  if (!damageModification) return false;
  const values = [];
  const collect = (value) => {
    if (value === null || value === undefined || value === "") return;
    if (typeof value === "object") {
      for (const nested of Object.values(value)) collect(nested);
      return;
    }
    values.push(value);
  };
  collect(damageModification.amount);
  collect(damageModification.midi);
  return values.some((value) => {
    if (typeof value === "number") return value !== 0;
    return String(value).trim() !== "" && String(value).trim() !== "0";
  });
}

function alternativeArmorSummary(actor) {
  const ac = getActorSystem(actor, "attributes.ac") ?? {};
  const armor = equippedArmor(actor);
  const shield = equippedShield(actor);
  const armorType = armor?.system?.type?.value ?? "";
  const dexMod = actorAbilityMod(actor, "dex");
  const prof = actorProficiencyBonus(actor);
  const details = [];
  const warnings = [];
  if (midiChallengeModeArmorActive()) {
    warnings.push("Alternative Armor automation is paused while Midi Challenge Mode Armor is active.");
  }
  if (midiWorkflowEnabled() && hasConfiguredDamageModification(actor)) {
    warnings.push("Midi/DAE damage modification fields are present and may stack with Alternative Armor DR.");
  }

  let dexToAc = dexMod;
  let dr = 0;
  let source = "Unarmored";

  if (armor) {
    const value = armorValue(armor);
    source = armor.name;
    dr += Math.max(0, value - 10);
    if (armorType === "heavy") {
      dexToAc = 0;
      details.push("Heavy armor ignores Dexterity for Alternative Armor AC.");
    } else {
      dexToAc = Math.min(dexMod, armorDexCap(armor));
      if (armorType === "medium") details.push("Medium armor caps Dexterity to AC as normal.");
    }
    details.push(`${armor.name} converts ${value} normal armor AC into DR ${Math.max(0, value - 10)}.`);
  } else {
    const calc = String(ac.calc ?? "");
    if (calc === "unarmoredBarb") {
      const con = Math.max(0, actorAbilityMod(actor, "con"));
      dr += con;
      details.push(`Constitution modifier converts to DR ${con} for unarmored defense.`);
    } else if (calc === "unarmoredMonk") {
      const wis = actorAbilityMod(actor, "wis");
      dexToAc += wis;
      details.push(`Wisdom modifier ${wis >= 0 ? "+" : ""}${wis} remains AC for unarmored defense.`);
    } else if (calc === "unarmoredBard") {
      const cha = actorAbilityMod(actor, "cha");
      dexToAc += cha;
      details.push(`Charisma modifier ${cha >= 0 ? "+" : ""}${cha} remains AC for unarmored defense.`);
    } else if (["natural", "mage", "draconic"].includes(calc)) {
      const naturalBase = Number(ac.flat ?? ac.value ?? 0);
      const naturalDr = Math.max(0, naturalBase - 10);
      if (naturalDr) {
        dr += naturalDr;
        details.push(`Natural/base AC adjustment converts to DR ${naturalDr}.`);
      }
    } else if (calc === "custom") {
      warnings.push("Custom AC formulas need GM review under Alternative Armor.");
    }
  }

  const shieldBonus = armorValue(shield);
  if (shieldBonus) details.push(`${shield.name} remains an AC bonus of ${shieldBonus}.`);

  const bonus = Number(ac.bonus ?? 0);
  const cover = Number(ac.cover ?? 0);
  const minimum = Number(ac.min ?? 0);
  const calculated = 8 + prof + dexToAc + shieldBonus + bonus + cover;
  const value = minimum ? Math.max(minimum, calculated) : calculated;

  return {
    actor,
    armor,
    shield,
    source,
    armorType,
    prof,
    dexMod,
    dexToAc,
    shieldBonus,
    bonus,
    cover,
    minimum,
    value,
    currentAc: Number(ac.value ?? 0),
    dr,
    details,
    warnings
  };
}

function isAttackActivity(subject) {
  return subject?.type === "attack" || subject?.constructor?.metadata?.type === "attack";
}

function markAlternativeArmorAttackDamage(rolls, data) {
  if (!alternativeArmorAutomationAvailable() || !isAttackActivity(data?.subject)) return;
  for (const roll of rolls ?? []) {
    roll.options ??= {};
    roll.options.properties ??= [];
    if (roll.options.properties instanceof Set) {
      roll.options.properties.add(ALTERNATIVE_ARMOR_ATTACK_PROPERTY);
    } else if (!roll.options.properties.includes(ALTERNATIVE_ARMOR_ATTACK_PROPERTY)) {
      roll.options.properties.push(ALTERNATIVE_ARMOR_ATTACK_PROPERTY);
    }
  }
}

function hasAlternativeArmorAttackMarker(damages) {
  return [...(damages ?? [])].some((damage) => damage?.properties?.has?.(ALTERNATIVE_ARMOR_ATTACK_PROPERTY));
}

function applyAlternativeArmorDamageReduction(actor, damages, options = {}) {
  if (options?.swvrAlternativeArmor?.applied) return;
  if (!alternativeArmorAutomationAvailable() || !hasAlternativeArmorAttackMarker(damages)) return;
  if (options?.only === "healing" || damages.amount <= 0) return;

  const summary = alternativeArmorSummary(actor);
  const reduction = Math.min(summary.dr, Math.max(0, damages.amount - 1));
  if (reduction <= 0) return;

  damages.amount -= reduction;
  damages.swvrAlternativeArmor = {
    dr: summary.dr,
    applied: reduction,
    source: summary.source,
    ac: summary.value
  };
  options.swvrAlternativeArmor = damages.swvrAlternativeArmor;

  let remaining = reduction;
  for (const damage of damages) {
    damage.properties?.delete?.(ALTERNATIVE_ARMOR_ATTACK_PROPERTY);
    if (remaining <= 0 || damage.value <= 0) continue;
    const applied = Math.min(remaining, damage.value);
    damage.value -= applied;
    damage.active ??= {};
    damage.active.swvrAlternativeArmor = true;
    damage.active.modification = true;
    remaining -= applied;
  }
}

function progressionState(actor) {
  const stored = foundry.utils.deepClone(actor?.getFlag(MODULE_ID, "progression") ?? {});
  return foundry.utils.mergeObject(foundry.utils.deepClone(PROGRESSION_DEFAULT), stored, {
    inplace: false,
    insertKeys: true,
    overwrite: true
  });
}

function classItems(actor) {
  return [...(actor?.items ?? [])].filter((item) => item.type === "class");
}

function progressionClassReferenceData(item) {
  return item?.getFlag?.(MODULE_ID, "gestaltClassReference") ?? item?.flags?.[MODULE_ID]?.gestaltClassReference ?? null;
}

function progressionClassReferenceItems(actor) {
  return [...(actor?.items ?? [])].filter((item) => progressionClassReferenceData(item));
}

function progressionArchetypeReferenceData(item) {
  return item?.getFlag?.(MODULE_ID, "gestaltArchetypeReference") ?? item?.flags?.[MODULE_ID]?.gestaltArchetypeReference ?? null;
}

function progressionArchetypeReferenceItems(actor) {
  return [...(actor?.items ?? [])].filter((item) => progressionArchetypeReferenceData(item));
}

function subclassItems(actor) {
  const nativeItems = [...(actor?.items ?? [])].filter((item) => {
    if (item.type === "subclass") return true;
    const typeText = normalizeKeywordText(`${item.type ?? ""} ${item.system?.type?.value ?? ""} ${item.system?.type ?? ""}`);
    return /\b(subclass|archetype)\b/.test(typeText);
  });
  const references = progressionArchetypeReferenceItems(actor);
  return [...nativeItems, ...references.filter((item) => !nativeItems.some((native) => native.id === item.id))];
}

function itemLevelValue(item) {
  const candidates = [
    item?.system?.levels,
    item?.system?.level,
    item?.system?.levels?.value,
    item?.system?.level?.value
  ];
  const value = candidates.map(Number).find((candidate) => Number.isFinite(candidate));
  return value ?? 0;
}

function hitDieSize(item) {
  const candidates = [
    item?.system?.hitDice,
    item?.system?.hitDie,
    item?.system?.hd,
    item?.system?.hd?.denomination,
    item?.system?.hitDice?.denomination
  ];
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    const text = typeof candidate === "object" ? JSON.stringify(candidate) : String(candidate);
    const match = text.match(/d?\s*(4|6|8|10|12)\b/i);
    if (match) return Number(match[1]);
  }
  return null;
}

function averagedHitDie(sizeA, sizeB) {
  if (!sizeA || !sizeB) return null;
  const average = Math.floor((Number(sizeA) + Number(sizeB)) / 2);
  return [...STANDARD_HIT_DICE].reverse().find((size) => size <= average) ?? 4;
}

function primaryGestaltClassItem(actor, scan) {
  const item = actor?.items?.get?.(scan?.primary?.id);
  return item?.type === "class" ? item : null;
}

function secondaryGestaltClassItem(actor, scan) {
  const item = actor?.items?.get?.(scan?.secondary?.id);
  return item?.type === "class" ? item : null;
}

function proficiencyBonusForLevel(level) {
  const numericLevel = Math.max(Number(level) || 0, 1);
  return Math.ceil(numericLevel / 4) + 1;
}

function evaluateFormulaNumber(value, rollData = {}) {
  if (value === null || value === undefined || value === "") return 0;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;
  try {
    return Number(Roll.create(String(value), rollData).evaluateSync().total) || 0;
  } catch (error) {
    console.warn(`${MODULE_ID} | Unable to evaluate formula "${value}".`, error);
    return 0;
  }
}

function hpAdvancementForClass(classItem) {
  return classItem?.advancement?.byType?.HitPoints?.[0] ?? null;
}

function hpAdvancementValueForLevel(advancement, hitDie, level) {
  const values = advancement?.value ?? {};
  const raw = values[level] ?? values[String(level)];
  if (raw === "max") return hitDie;
  if (raw === "avg") return (hitDie / 2) + 1;
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) return Math.clamp(numeric, 1, hitDie);
  return level === 1 ? hitDie : (hitDie / 2) + 1;
}

function gestaltHpMax(actor, primaryItem, secondaryItem, hitDie, level) {
  const advancement = hpAdvancementForClass(primaryItem) ?? hpAdvancementForClass(secondaryItem);
  if (!advancement || !hitDie || !level) return null;

  const abilityId = CONFIG?.DND5E?.defaultAbilities?.hitPoints ?? "con";
  const mod = Number(getActorSystem(actor, `abilities.${abilityId}.mod`) ?? 0);
  let classHp = 0;
  for (let classLevel = 1; classLevel <= level; classLevel++) {
    const base = hpAdvancementValueForLevel(advancement, hitDie, classLevel);
    classHp += Math.max(base + mod, 1);
  }

  const rollData = actor?.getRollData?.({ deterministic: true }) ?? {};
  const hpBonuses = getActorSystem(actor, "attributes.hp.bonuses") ?? {};
  const bonus = (evaluateFormulaNumber(hpBonuses.level, rollData) * level)
    + evaluateFormulaNumber(hpBonuses.overall, rollData);
  return Math.max(Math.floor(classHp + bonus), 0);
}

function gestaltProgressionMetrics(actor, scan = progressionScan(actor)) {
  if (!scan?.gestaltEnabled || !scan.primary || !scan.secondary || !scan.gestaltHitDie) return null;
  const primaryItem = primaryGestaltClassItem(actor, scan);
  const secondaryItem = secondaryGestaltClassItem(actor, scan);
  if (!primaryItem) return null;

  const level = Math.max(Number(scan.primary.level) || 0, 1);
  const hpMax = gestaltHpMax(actor, primaryItem, secondaryItem, scan.gestaltHitDie, level);
  return {
    actor,
    scan,
    primaryItem,
    secondaryItem,
    level,
    hitDie: scan.gestaltHitDie,
    denomination: `d${scan.gestaltHitDie}`,
    hpMax
  };
}

function createGestaltHitDiceData(metrics) {
  const spent = Math.clamp(Number(metrics.primaryItem?.system?.hd?.spent ?? 0) || 0, 0, metrics.level);
  const value = Math.max(metrics.level - spent, 0);
  const bySize = { [metrics.denomination]: value };
  const hitDiceClass = {
    id: metrics.primaryItem.id,
    name: metrics.primaryItem.name,
    system: {
      ...metrics.primaryItem.system,
      hd: {
        ...(metrics.primaryItem.system?.hd ?? {}),
        denomination: metrics.denomination,
        max: metrics.level,
        value,
        spent
      }
    },
    update: (data, options) => metrics.primaryItem.update(data, options)
  };
  const classes = [hitDiceClass];
  return {
    actor: metrics.actor,
    classes,
    sizes: new Set([metrics.hitDie]),
    value,
    max: metrics.level,
    bySize,
    smallest: metrics.denomination,
    largest: metrics.denomination,
    smallestAvailable: value ? metrics.denomination : "d0",
    largestAvailable: value ? metrics.denomination : "d0",
    smallestFace: metrics.hitDie,
    largestFace: metrics.hitDie,
    pct: Math.clamp(metrics.level ? (value / metrics.level) * 100 : 0, 0, 100),
    toString() {
      return String(this.value);
    },
    createHitDiceUpdates({ maxHitDice, fraction = 0.5 } = {}, result = {}) {
      const recoverLimit = Number.isInteger(maxHitDice) ? maxHitDice : Math.max(Math.floor(this.max * fraction), 1);
      const recovered = Math.min(spent, recoverLimit);
      if (recovered <= 0) return;
      foundry.utils.mergeObject(result, {
        deltas: {
          hitDice: (result.deltas?.hitDice ?? 0) + recovered
        },
        updateItems: [{
          _id: metrics.primaryItem.id,
          "system.hd.spent": spent - recovered
        }]
      });
    }
  };
}

function applyGestaltBaseDataCorrections(actor) {
  if (!actor || actor.type !== "character" || !isEnabled("gestalt-dichotomous")) return;
  const metrics = gestaltProgressionMetrics(actor);
  if (!metrics) return;

  const system = actor.system;
  if (!system?.details || !system?.attributes) return;

  system.details.level = metrics.level;
  system.attributes.prof = proficiencyBonusForLevel(metrics.level);
}

function applyGestaltPreparedDataCorrections(actor) {
  if (!actor || actor.type !== "character" || !isEnabled("gestalt-dichotomous")) return;
  const metrics = gestaltProgressionMetrics(actor);
  if (!metrics) return;

  const system = actor.system;
  const hp = system?.attributes?.hp;
  if (!system?.details || !system?.attributes || !hp) return;
  system.details.level = metrics.level;
  system.attributes.prof = proficiencyBonusForLevel(metrics.level);
  system.attributes.hd = createGestaltHitDiceData(metrics);

  if (metrics.hpMax !== null) {
    hp.max = metrics.hpMax;
    if (actor.hasConditionEffect?.("halfHealth")) hp.max = Math.floor(hp.max * 0.5);
    hp.effectiveMax = Math.max(hp.max + (Number(hp.tempmax) || 0), 0);
    hp.value = Math.min(Number(hp.value) || 0, hp.effectiveMax);
    hp.damage = hp.effectiveMax - hp.value;
    hp.pct = Math.clamp(hp.effectiveMax ? (hp.value / hp.effectiveMax) * 100 : 0, 0, 100);
  }
}

function patchGestaltPreparedData() {
  const CharacterData = CONFIG?.Actor?.dataModels?.character;
  if (CharacterData?.prototype?.prepareBaseData && CharacterData?.prototype?.prepareDerivedData) {
    if (!CharacterData.prototype[GESTALT_BASE_PATCH_FLAG]) {
      const originalPrepareBaseData = CharacterData.prototype.prepareBaseData;
      CharacterData.prototype.prepareBaseData = function swvrPrepareBaseData(...args) {
        const result = originalPrepareBaseData.apply(this, args);
        try {
          applyGestaltBaseDataCorrections(this.parent);
        } catch (error) {
          console.error(`${MODULE_ID} | Failed to apply Gestalt base-data corrections.`, error);
        }
        return result;
      };
      CharacterData.prototype[GESTALT_BASE_PATCH_FLAG] = true;
    }

    if (!CharacterData.prototype[GESTALT_DERIVED_PATCH_FLAG]) {
      const originalPrepareDerivedData = CharacterData.prototype.prepareDerivedData;
      CharacterData.prototype.prepareDerivedData = function swvrPrepareDerivedData(...args) {
        const result = originalPrepareDerivedData.apply(this, args);
        try {
          applyGestaltPreparedDataCorrections(this.parent);
        } catch (error) {
          console.error(`${MODULE_ID} | Failed to apply Gestalt derived-data corrections.`, error);
        }
        return result;
      };
      CharacterData.prototype[GESTALT_DERIVED_PATCH_FLAG] = true;
    }
  }

  const ActorClass = CONFIG?.Actor?.documentClass;
  if (!ActorClass?.prototype?.prepareData || ActorClass.prototype[GESTALT_PREPARED_PATCH_FLAG]) return;
  const originalPrepareData = ActorClass.prototype.prepareData;
  ActorClass.prototype.prepareData = function swvrPrepareData(...args) {
    const result = originalPrepareData.apply(this, args);
    try {
      applyGestaltPreparedDataCorrections(this);
    } catch (error) {
      console.error(`${MODULE_ID} | Failed to apply Gestalt prepared-data corrections.`, error);
    }
    return result;
  };
  ActorClass.prototype[GESTALT_PREPARED_PATCH_FLAG] = true;
}

function reprepareGestaltActors() {
  for (const actor of game.actors ?? []) {
    if (actor.type !== "character") continue;
    const scan = progressionScan(actor);
    if (!scan.gestaltEnabled) continue;
    actor.prepareData();
    actor.sheet?.rendered && actor.sheet.render(false);
    for (const app of Object.values(actor.apps ?? {})) app?.render?.(false);
  }
}

function classRole(item) {
  const text = normalizeKeywordText(`${item?.name ?? ""} ${stripHtml(itemDescriptionText(item))}`);
  if (/\b(consular|guardian|sentinel)\b/.test(text) || /\bforcecasting\b/.test(text)) return "force";
  if (/\b(engineer|scout)\b/.test(text) || /\btechcasting\b/.test(text)) return "tech";
  return "none";
}

function classOptionData(actor) {
  const realClasses = classItems(actor).map((item) => ({
    id: item.id,
    uuid: item.uuid,
    name: item.name,
    level: itemLevelValue(item),
    hitDie: hitDieSize(item),
    role: classRole(item),
    counting: true,
    reference: false,
    itemType: item.type
  }));
  const references = progressionClassReferenceItems(actor).map((item) => {
    const data = progressionClassReferenceData(item) ?? {};
    return {
      id: item.id,
      uuid: item.uuid,
      name: data.name ?? item.name?.replace(`${PROGRESSION_CLASS_REFERENCE_PREFIX}: `, "") ?? item.name,
      level: Number(data.level ?? 0),
      hitDie: Number(data.hitDie ?? 0) || null,
      role: data.role ?? "none",
      counting: false,
      reference: true,
      itemType: item.type,
      sourceItemId: data.sourceItemId,
      sourceUuid: data.sourceUuid
    };
  });
  return [...realClasses, ...references];
}

function subclassClassHint(item) {
  const candidates = [
    item?.system?.classIdentifier,
    item?.system?.class,
    item?.system?.className,
    item?.system?.identifier,
    item?.system?.source?.custom,
    item?.system?.source,
    itemDescriptionText(item)
  ].filter(Boolean);
  return candidates.map((value) => typeof value === "string" ? stripHtml(value) : JSON.stringify(value)).join("; ");
}

function subclassOptionData(actor) {
  return subclassItems(actor).map((item) => {
    const reference = progressionArchetypeReferenceData(item);
    return {
      id: item.id,
      uuid: item.uuid,
      name: reference?.name ?? item.name?.replace(`${PROGRESSION_ARCHETYPE_REFERENCE_PREFIX}: `, "") ?? item.name,
      classHint: reference
        ? `${reference.className ?? "SWVR class track"}; reference from ${reference.sourceName ?? reference.name ?? item.name}`
        : subclassClassHint(item),
      reference: Boolean(reference),
      classTrackId: reference?.classTrackId ?? "",
      sourceUuid: reference?.sourceUuid ?? item.uuid
    };
  });
}

function progressionModeLabel(mode) {
  return {
    normal: "Normal",
    gestalt: "Gestalt",
    dichotomous: "Dichotomous",
    both: "Gestalt + Dichotomous"
  }[mode] ?? "Normal";
}

function progressionSourceLabel(source, primary, secondary) {
  if (source === "secondary") return secondary?.name ?? "Secondary class";
  return primary?.name ?? "Primary class";
}

function progressionClassOptionLabel(item) {
  const countLabel = item.reference ? "reference" : "counts";
  return `${item.name} (level ${item.level || "?"}${item.hitDie ? `, d${item.hitDie}` : ""}; ${countLabel})`;
}

function progressionClassArchetypeIds(state, classId) {
  if (!classId) return [];
  const values = state.gestaltArchetypeIds?.[classId] ?? [];
  return Array.isArray(values) ? values : [];
}

function selectedArchetypesForClass(archetypes, state, classId) {
  const ids = new Set(progressionClassArchetypeIds(state, classId));
  return archetypes.filter((item) => ids.has(item.id));
}

function selectedGestaltArchetypeIds(state, classIds) {
  return classIds.flatMap((classId) => progressionClassArchetypeIds(state, classId));
}

function progressionScan(actor) {
  const state = progressionState(actor);
  const classes = classOptionData(actor);
  const archetypes = subclassOptionData(actor);
  const primary = classes.find((item) => item.id === state.primaryClassId) ?? classes[0] ?? null;
  const secondary = classes.find((item) => item.id === state.secondaryClassId) ?? classes.find((item) => item.id !== primary?.id) ?? null;
  const dichotomousClass = classes.find((item) => item.id === state.dichotomousClassId) ?? primary ?? null;
  const selectedArchetypes = archetypes.filter((item) => state.archetypeIds?.includes(item.id));
  const primaryArchetypes = selectedArchetypesForClass(archetypes, state, primary?.id);
  const secondaryArchetypes = selectedArchetypesForClass(archetypes, state, secondary?.id);
  const gestaltClassArchetypes = [
    primary ? { role: "Primary", classItem: primary, archetypes: primaryArchetypes } : null,
    secondary ? { role: "Secondary", classItem: secondary, archetypes: secondaryArchetypes } : null
  ].filter(Boolean);
  const gestaltArchetypeIds = selectedGestaltArchetypeIds(state, gestaltClassArchetypes.map((entry) => entry.classItem.id));
  const duplicateGestaltArchetypeIds = [...new Set(gestaltArchetypeIds.filter((id, index, ids) => ids.indexOf(id) !== index))];
  const gestaltEnabled = state.mode === "gestalt" || state.mode === "both";
  const dichotomousEnabled = state.mode === "dichotomous" || state.mode === "both";
  const warnings = [];
  const recommendations = [];
  const details = [];
  const countedClasses = classes.filter((item) => item.counting);
  const rawClassLevelTotal = countedClasses.reduce((total, item) => total + (Number(item.level) || 0), 0);
  let gestaltHitDie = null;

  if (gestaltEnabled) {
    if (!primary || !secondary) warnings.push("Choose two class tracks for Gestalt progression.");
    if (primary && secondary && primary.id === secondary.id) warnings.push("Gestalt requires two different classes.");
    if (countedClasses.length > 2) warnings.push("Gestalt characters are not suitable for multiclassing; this actor has more than two counted class items.");
    if (primary && !primary.counting) warnings.push("The primary Gestalt class should remain a real counted class item.");
    if (secondary?.reference) recommendations.push(`${secondary.name} is tracked as an SWVR reference. For full class features and two-subclass testing, add it back as a real class item and select it as the secondary Gestalt class.`);
    if (primary && secondary && primary.level !== secondary.level) warnings.push(`${primary.name} is level ${primary.level}, while ${secondary.name} is level ${secondary.level}. Gestalt class tracks should advance together.`);

    gestaltHitDie = averagedHitDie(primary?.hitDie, secondary?.hitDie);
    if (gestaltHitDie) {
      details.push(`Gestalt Hit Die: d${gestaltHitDie} from ${primary.name} d${primary.hitDie} and ${secondary.name} d${secondary.hitDie}.`);
      if (primary?.counting && secondary?.counting) {
        const primaryItem = primaryGestaltClassItem(actor, { primary });
        const secondaryItem = secondaryGestaltClassItem(actor, { secondary });
        const hpMax = gestaltHpMax(actor, primaryItem, secondaryItem, gestaltHitDie, Math.max(Number(primary.level) || 0, 1));
        details.push(`Gestalt effective level: ${primary.level}. Raw Foundry class-level total is ${rawClassLevelTotal}; SWVR corrects prepared level, proficiency, HP, and hit dice after D&D5e preparation.`);
        if (hpMax !== null) details.push(`Gestalt HP max: ${hpMax} using ${primary.name}'s HP choices evaluated against d${gestaltHitDie}.`);
        recommendations.push("Use Sync Gestalt Class Hit Dice so rests and hit-die rolls use one averaged hit-die pool while both classes remain on the actor.");
      } else if (primary?.counting) {
        recommendations.push(`Apply d${gestaltHitDie} to the counted primary class item so Foundry uses the Gestalt hit die instead of ${primary.name}'s normal d${primary.hitDie}.`);
      }
    }
    else details.push("Gestalt Hit Die: unable to calculate because one or both class hit dice were not detected.");

    const xpMax = Number(getActorSystem(actor, "details.xp.max") ?? getActorSystem(actor, "details.xp.next") ?? 0);
    if (xpMax > 0) details.push(`Gestalt XP target: ${xpMax * 2} XP for the next level if the normal threshold is ${xpMax}.`);
    else details.push("Gestalt XP target: double the normal XP threshold for each level.");

    const sharedAsiLevels = GESTALT_ASI_LEVELS.filter((level) => (primary?.level ?? 0) >= level && (secondary?.level ?? 0) >= level);
    if (sharedAsiLevels.length) {
      const asiText = state.asiMode === "asi-and-feat"
        ? "Use one +2 ASI from one class and a feat from the other if the ASI and a Feat variant is active."
        : "Grant only one Ability Score Improvement, not one from each class.";
      recommendations.push(`ASI levels reached on both tracks (${sharedAsiLevels.join(", ")}): ${asiText}`);
    }

    if (primary?.role !== "none" && primary?.role === secondary?.role) {
      recommendations.push(`Both Gestalt classes appear to use ${primary.role}casting. Add points from both classes, determine max power level as multiclassing, and keep powers known separated by class.`);
    } else if (primary?.role !== "none" && secondary?.role !== "none" && primary?.role !== secondary?.role) {
      recommendations.push("The Gestalt classes appear to use opposing casting types. Treat forcecasting and techcasting separately by class.");
    }

    details.push(`Saving throws source: ${progressionSourceLabel(state.savingThrowSource, primary, secondary)}.`);
    details.push(`Skill source: ${progressionSourceLabel(state.skillSource, primary, secondary)}.`);
    details.push("Weapons, armor, and tools: grant proficiencies from both Gestalt classes.");
    details.push(`Starting equipment source: ${progressionSourceLabel(state.equipmentSource, primary, secondary)}.`);
    if (secondary?.reference) details.push(`${secondary.name} is tracked as an SWVR reference and does not add Foundry class levels, hit dice, or HP.`);
  }

  if (dichotomousEnabled) {
    const grantText = state.archetypeGrantMode === "choose"
      ? "At each archetype feature level, choose one archetype's feature."
      : "At each archetype feature level, grant features from both archetypes.";
    if (state.mode === "both") {
      if (!primary || !secondary) warnings.push("Gestalt + Dichotomous requires two class tracks before assigning archetypes.");
      details.push(`Gestalt + Dichotomous archetypes selected: ${gestaltArchetypeIds.length}/4 total, with 2 expected under each Gestalt class.`);
      if (duplicateGestaltArchetypeIds.length) {
        const duplicateNames = archetypes.filter((item) => duplicateGestaltArchetypeIds.includes(item.id)).map((item) => item.name);
        warnings.push(`Each Gestalt + Dichotomous archetype slot should point to a distinct archetype item. Repeated selection: ${duplicateNames.join(", ")}.`);
      }
      for (const entry of gestaltClassArchetypes) {
        if (entry.archetypes.length < 2) warnings.push(`${entry.classItem.name} needs two archetypes for Gestalt + Dichotomous progression.`);
        if (entry.archetypes.length > 2) warnings.push(`${entry.classItem.name} has more than two archetypes selected; the rule expects two.`);
        if (entry.archetypes.length) {
          details.push(`${entry.role} class archetypes (${entry.classItem.name}) ${entry.archetypes.length}/2: ${entry.archetypes.map((item) => item.name).join(", ")}.`);
        }
      }
      if (gestaltArchetypeIds.length === 4 && !duplicateGestaltArchetypeIds.length) {
        details.push("Gestalt + Dichotomous archetype requirement is complete: four total archetypes, two under each class track.");
      }
      recommendations.push(`Gestalt + Dichotomous archetype handling: allow four total archetypes at 3rd level, two under each Gestalt class track. ${grantText}`);
    } else {
      if (!dichotomousClass) warnings.push("Choose the class that receives two archetypes.");
      if (selectedArchetypes.length < 2) warnings.push("Choose two archetypes for Dichotomous progression.");
      if (selectedArchetypes.length > 2) warnings.push("More than two archetypes are selected; the rule expects two.");
      recommendations.push(`${progressionModeLabel(state.mode)} archetype handling: ${grantText}`);
      if (selectedArchetypes.length) details.push(`Selected archetypes: ${selectedArchetypes.map((item) => item.name).join(", ")}.`);
      if (state.mode === "dichotomous" && classes.length > 1) warnings.push("Dichotomous multiclassing needs GM adjudication if more than one class reaches archetype levels.");
    }
  }

  if (state.mode === "normal") details.push("Normal progression selected. No Gestalt or Dichotomous adjustments are active.");

  return {
    state,
    classes,
    archetypes,
    primary,
    secondary,
    dichotomousClass,
    selectedArchetypes,
    gestaltClassArchetypes,
    gestaltArchetypeIds,
    duplicateGestaltArchetypeIds,
    gestaltEnabled,
    dichotomousEnabled,
    gestaltHitDie,
    warnings,
    recommendations,
    details
  };
}

function progressionNoteHtml(actor) {
  const scan = progressionScan(actor);
  const lines = [
    `<p><strong>Mode:</strong> ${escapeHtml(progressionModeLabel(scan.state.mode))}</p>`
  ];
  if (scan.details.length) {
    lines.push("<h3>Rule Calculations</h3><ul>");
    for (const detail of scan.details) lines.push(`<li>${escapeHtml(detail)}</li>`);
    lines.push("</ul>");
  }
  if (scan.recommendations.length) {
    lines.push("<h3>GM-Reviewed Progression Actions</h3><ul>");
    for (const recommendation of scan.recommendations) lines.push(`<li>${escapeHtml(recommendation)}</li>`);
    lines.push("</ul>");
  }
  if (scan.warnings.length) {
    lines.push("<h3>Warnings</h3><ul>");
    for (const warning of scan.warnings) lines.push(`<li>${escapeHtml(warning)}</li>`);
    lines.push("</ul>");
  }
  lines.push("<p><em>Generated by SW5e Variant Rules. This item is a checklist and audit note; the GM should approve class features, archetype features, proficiencies, equipment, and casting changes before applying them.</em></p>");
  return lines.join("");
}

async function createOrUpdateProgressionNote(actor) {
  if (!actor || !game.user.isGM) return;
  const existing = actor.items.find((item) => item.name === PROGRESSION_NOTE_NAME && item.getFlag(MODULE_ID, "progressionNote"));
  const itemData = {
    name: PROGRESSION_NOTE_NAME,
    type: "feat",
    system: {
      description: {
        value: progressionNoteHtml(actor)
      }
    },
    flags: {
      [MODULE_ID]: {
        progressionNote: true
      }
    }
  };
  if (existing) {
    await existing.update(itemData);
    ui.notifications.info("SWVR progression note updated.");
  } else {
    await actor.createEmbeddedDocuments("Item", [itemData]);
    ui.notifications.info("SWVR progression note created.");
  }
}

function confirmDialog({ title, content, yes = "Confirm", no = "Cancel" }) {
  return new Promise((resolve) => {
    new Dialog({
      title,
      content,
      buttons: {
        yes: {
          icon: '<i class="fas fa-check"></i>',
          label: yes,
          callback: () => resolve(true)
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: no,
          callback: () => resolve(false)
        }
      },
      default: "no",
      close: () => resolve(false)
    }).render(true);
  });
}

function progressionReferenceDescription(classItem, data) {
  return [
    `<p><strong>${escapeHtml(classItem.name)}</strong> is tracked by SW5e Variant Rules as a Gestalt class reference.</p>`,
    "<p>This item is intentionally not a class item, so Foundry does not add its levels, hit dice, HP, or class-derived totals to the actor.</p>",
    "<ul>",
    `<li>Tracked level: ${escapeHtml(data.level)}</li>`,
    `<li>Tracked hit die: ${data.hitDie ? `d${escapeHtml(data.hitDie)}` : "not detected"}</li>`,
    `<li>Tracked casting role: ${escapeHtml(data.role)}</li>`,
    "</ul>"
  ].join("");
}

function progressionArchetypeReferenceDescription(sourceItem, classItem, data) {
  return [
    `<p><strong>${escapeHtml(sourceItem.name)}</strong> is tracked by SW5e Variant Rules as an additional Gestalt + Dichotomous archetype for <strong>${escapeHtml(classItem.name)}</strong>.</p>`,
    "<p>This item is intentionally stored as a feature reference instead of a native archetype/subclass item because the SW5e/D&D5e actor sheet permits only one native archetype per class.</p>",
    "<p>Use this reference for SWVR Progression tracking. Class and archetype features still need GM review before adding them to the actor.</p>"
  ].join("");
}

async function createGestaltArchetypeReference(actor, classTrackId, sourceUuid) {
  if (!actor || !game.user.isGM) return null;
  const classItem = actor.items.get(classTrackId);
  if (!classItem) {
    ui.notifications.warn("Choose a Gestalt class track before importing an archetype reference.");
    return null;
  }
  const sourceItem = await fromUuid(String(sourceUuid ?? "").trim());
  if (!sourceItem) {
    ui.notifications.warn("Could not find that archetype UUID.");
    return null;
  }

  const typeText = normalizeKeywordText(`${sourceItem.type ?? ""} ${sourceItem.system?.type?.value ?? ""} ${sourceItem.system?.type ?? ""} ${sourceItem.name ?? ""}`);
  if (sourceItem.type !== "subclass" && !/\b(subclass|archetype)\b/.test(typeText)) {
    ui.notifications.warn(`${sourceItem.name} does not look like an archetype/subclass item.`);
    return null;
  }

  const existing = progressionArchetypeReferenceItems(actor).find((item) => {
    const data = progressionArchetypeReferenceData(item);
    return data?.classTrackId === classTrackId && data?.sourceUuid === sourceItem.uuid;
  });
  const state = progressionState(actor);
  state.gestaltArchetypeIds ??= {};
  state.gestaltArchetypeIds[classTrackId] ??= [];
  if (existing) {
    if (!state.gestaltArchetypeIds[classTrackId].includes(existing.id)) {
      state.gestaltArchetypeIds[classTrackId].push(existing.id);
      await actor.setFlag(MODULE_ID, "progression", state);
    }
    ui.notifications.info(`${sourceItem.name} is already imported for ${classItem.name}.`);
    return existing;
  }

  const data = {
    name: sourceItem.name,
    sourceName: sourceItem.name,
    sourceUuid: sourceItem.uuid,
    sourceType: sourceItem.type,
    classTrackId,
    className: classItem.name,
    classIdentifier: sourceItem.system?.classIdentifier ?? classItem.system?.identifier ?? "",
    importedAt: new Date().toISOString()
  };
  const created = await actor.createEmbeddedDocuments("Item", [{
    name: `${PROGRESSION_ARCHETYPE_REFERENCE_PREFIX}: ${sourceItem.name}`,
    type: "feat",
    img: sourceItem.img,
    system: {
      description: {
        value: progressionArchetypeReferenceDescription(sourceItem, classItem, data)
      }
    },
    flags: {
      [MODULE_ID]: {
        gestaltArchetypeReference: data
      }
    }
  }]);
  const reference = created?.[0] ?? null;
  if (reference) {
    state.gestaltArchetypeIds[classTrackId].push(reference.id);
    await actor.setFlag(MODULE_ID, "progression", state);
    ui.notifications.info(`${sourceItem.name} imported as an SWVR archetype reference for ${classItem.name}.`);
  }
  return reference;
}

function progressionStateUsesArchetype(state, archetypeId) {
  if (state.archetypeIds?.includes(archetypeId)) return true;
  return Object.values(state.gestaltArchetypeIds ?? {}).some((ids) => Array.isArray(ids) && ids.includes(archetypeId));
}

async function removeProgressionArchetype(actor, archetypeId, classTrackId = "") {
  if (!actor || !game.user.isGM) return;
  const item = actor.items.get(archetypeId);
  const reference = progressionArchetypeReferenceData(item);
  const confirmed = await confirmDialog({
    title: "Remove Archetype",
    content: reference
      ? `<p>Remove <strong>${escapeHtml(reference.name ?? item?.name ?? "this archetype")}</strong> from this progression slot?</p><p>This SWVR archetype reference will be deleted from the actor if no other slot uses it.</p>`
      : `<p>Remove <strong>${escapeHtml(item?.name ?? "this archetype")}</strong> from this SWVR progression slot?</p><p>The native archetype item will remain on the actor.</p>`,
    yes: "Remove"
  });
  if (!confirmed) return;

  const state = progressionState(actor);
  state.archetypeIds = (state.archetypeIds ?? []).filter((id) => id !== archetypeId);
  state.gestaltArchetypeIds ??= {};
  if (classTrackId) {
    state.gestaltArchetypeIds[classTrackId] = (state.gestaltArchetypeIds[classTrackId] ?? []).filter((id) => id !== archetypeId);
  } else {
    for (const [id, ids] of Object.entries(state.gestaltArchetypeIds)) {
      state.gestaltArchetypeIds[id] = (ids ?? []).filter((value) => value !== archetypeId);
    }
  }

  await actor.setFlag(MODULE_ID, "progression", state);
  if (reference && item && !progressionStateUsesArchetype(state, archetypeId)) {
    await actor.deleteEmbeddedDocuments("Item", [item.id]);
    ui.notifications.info(`${reference.name ?? item.name} removed from SWVR progression and deleted as a reference.`);
  } else {
    ui.notifications.info(`${item?.name ?? "Archetype"} removed from SWVR progression.`);
  }
}

async function convertGestaltClassToReference(actor, classItemId) {
  if (!actor || !game.user.isGM) return null;
  const classItem = actor.items.get(classItemId);
  if (!classItem || classItem.type !== "class") {
    ui.notifications.warn("Choose a real class item to convert into an SWVR Gestalt reference.");
    return null;
  }

  const data = {
    name: classItem.name,
    sourceItemId: classItem.id,
    sourceUuid: classItem.uuid,
    level: itemLevelValue(classItem),
    hitDie: hitDieSize(classItem),
    role: classRole(classItem),
    convertedAt: new Date().toISOString()
  };

  const confirmed = await confirmDialog({
    title: "Convert Gestalt Class",
    content: `<p>Convert <strong>${escapeHtml(classItem.name)}</strong> into a non-counting SWVR Gestalt class reference?</p><p>The original class item will be removed so Foundry stops adding its levels, hit dice, and HP. Any class features that were granted from that item should be reviewed manually.</p>`,
    yes: "Convert"
  });
  if (!confirmed) return null;

  const created = await actor.createEmbeddedDocuments("Item", [{
    name: `${PROGRESSION_CLASS_REFERENCE_PREFIX}: ${classItem.name}`,
    type: "feat",
    system: {
      description: {
        value: progressionReferenceDescription(classItem, data)
      }
    },
    flags: {
      [MODULE_ID]: {
        gestaltClassReference: data
      }
    }
  }]);
  const reference = created?.[0] ?? null;
  if (reference) {
    const state = progressionState(actor);
    if (state.primaryClassId === classItem.id) state.primaryClassId = "";
    if (state.secondaryClassId === classItem.id) state.secondaryClassId = reference.id;
    await actor.setFlag(MODULE_ID, "progression", state);
  }
  await actor.deleteEmbeddedDocuments("Item", [classItem.id]);
  ui.notifications.info(`${classItem.name} converted to an SWVR Gestalt class reference.`);
  return reference;
}

async function applyGestaltHitDieToPrimary(actor) {
  if (!actor || !game.user.isGM) return null;
  const scan = progressionScan(actor);
  const classItem = primaryGestaltClassItem(actor, scan);
  const hitDie = scan.gestaltHitDie;

  if (!scan.gestaltEnabled || !scan.primary || !scan.secondary || !hitDie) {
    ui.notifications.warn("Choose two Gestalt class tracks with detectable hit dice before applying the Gestalt hit die.");
    return null;
  }
  if (!classItem) {
    ui.notifications.warn("The primary Gestalt class must be a real class item before its hit die can be updated.");
    return null;
  }
  if (scan.primary.hitDie === hitDie) {
    ui.notifications.info(`${classItem.name} already uses the calculated Gestalt hit die d${hitDie}.`);
    return classItem;
  }

  const confirmed = await confirmDialog({
    title: "Apply Gestalt Hit Die",
    content: `<p>Set <strong>${escapeHtml(classItem.name)}</strong> to use a d${hitDie} hit die?</p><p>This applies the rule average of ${escapeHtml(scan.primary.name)} d${escapeHtml(scan.primary.hitDie)} and ${escapeHtml(scan.secondary.name)} d${escapeHtml(scan.secondary.hitDie)}. Existing hit point totals and prior level HP choices should still be reviewed manually after the update.</p>`,
    yes: "Apply d" + hitDie
  });
  if (!confirmed) return null;

  await classItem.update({ "system.hd.denomination": `d${hitDie}` });
  ui.notifications.info(`${classItem.name} updated to Gestalt hit die d${hitDie}. Review current HP totals before play.`);
  return classItem;
}

async function syncGestaltClassHitDice(actor) {
  if (!actor || !game.user.isGM) return null;
  const scan = progressionScan(actor);
  const metrics = gestaltProgressionMetrics(actor, scan);
  if (!metrics?.secondaryItem) {
    ui.notifications.warn("Choose two real Gestalt class items before syncing Gestalt hit dice.");
    return null;
  }

  const confirmed = await confirmDialog({
    title: "Sync Gestalt Class Hit Dice",
    content: `<p>Sync <strong>${escapeHtml(metrics.primaryItem.name)}</strong> and <strong>${escapeHtml(metrics.secondaryItem.name)}</strong> for Gestalt hit dice?</p><p>The primary class will use ${escapeHtml(metrics.denomination)} for ${escapeHtml(metrics.level)} hit dice. The secondary class remains a real class item for features, but its hit-dice contribution is set to 0 so Foundry does not add the two pools together.</p><p>Prepared HP max is recalculated automatically from the averaged die while the variant rule is enabled.</p>`,
    yes: "Sync Hit Dice"
  });
  if (!confirmed) return null;

  const secondaryLevel = Number(metrics.secondaryItem.system?.levels ?? metrics.scan.secondary.level ?? 0) || 0;
  const updates = [
    {
      _id: metrics.primaryItem.id,
      "system.hd.denomination": metrics.denomination,
      "system.hd.additional": ""
    },
    {
      _id: metrics.secondaryItem.id,
      "system.hd.denomination": metrics.denomination,
      "system.hd.additional": secondaryLevel ? `-${secondaryLevel}` : ""
    }
  ];
  await actor.updateEmbeddedDocuments("Item", updates);
  actor.prepareData();
  ui.notifications.info(`Gestalt hit dice synced to ${metrics.denomination}. ${metrics.primaryItem.name} supplies the active pool; ${metrics.secondaryItem.name} remains counted for class features.`);
  return updates;
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
  state.majorBoons ??= { benevolence: null, corruption: null };
  state.majorBoons.benevolence ??= null;
  state.majorBoons.corruption ??= null;
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

function forceAlignmentTier5Side(value) {
  const score = clampForceAlignment(value);
  if (score >= 100) return "benevolence";
  if (score <= -100) return "corruption";
  return "neutral";
}

function forceAlignmentTier5Label(side) {
  if (side === "benevolence") return "Luminous Being";
  if (side === "corruption") return "Dark Entity";
  return "";
}

function forceAlignmentTier5BoonOptions(side, selectedRoll = null) {
  const selected = Number(selectedRoll ?? 0);
  return [...(FORCE_ALIGNMENT_TIER5_BOONS[side] ?? [])].map((boon) => ({
    ...boon,
    selected: boon.roll === selected
  }));
}

function forceAlignmentTier5Boon(side, roll) {
  return FORCE_ALIGNMENT_TIER5_BOONS[side]?.find((boon) => boon.roll === Number(roll)) ?? null;
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
  if (actorHasClassForcePowerSource(actor)) return true;
  return [...(actor.items ?? [])].some((item) => item.type === "spell" && ["lgt", "drk"].includes(item.system?.school));
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
    content: `<p>Reset Force Alignment for <strong>${escapeHtml(actor.name)}</strong>?</p><p>This clears the score, cast history, resolved tier prompts, Tier 5 boons, minor traits, and the action/deed log.</p>`,
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

async function setForceAlignmentTier5Boon(actor, side, boon, method = "assigned") {
  if (!game.user.isGM || !actor || !boon) return null;
  const state = forceAlignmentState(actor);
  const endpointSide = forceAlignmentTier5Side(state.value);
  if (side !== endpointSide) {
    ui.notifications.warn("Tier 5 boons can only be assigned to a Luminous Being or Dark Entity.");
    return null;
  }

  const sideLabel = forceAlignmentTier5Label(side);
  const assigned = {
    id: foundry.utils.randomID(),
    timestamp: new Date().toISOString(),
    userId: game.user.id,
    userName: game.user.name,
    side,
    sideLabel,
    roll: Number(boon.roll),
    name: boon.name,
    method
  };

  state.majorBoons ??= { benevolence: null, corruption: null };
  state.majorBoons[side] = assigned;
  state.deedLog = [...(state.deedLog ?? []), forceAlignmentLogEntry({
    kind: "majorBoon",
    label: `${sideLabel} boon ${method === "rolled" ? "rolled" : "assigned"}`,
    note: `${sideLabel}: ${boon.name} (${method === "rolled" ? `d6 result ${boon.roll}` : "GM assignment"}).`,
    points: 0,
    previous: state.value,
    next: state.value
  })];
  await setForceAlignmentState(actor, state);
  refreshForceAlignmentPanelsForActor(actor.id);
  return assigned;
}

async function assignForceAlignmentTier5Boon(actor, side, roll) {
  const boon = forceAlignmentTier5Boon(side, roll);
  if (!boon) {
    ui.notifications.warn("Choose a valid Tier 5 boon.");
    return null;
  }
  const assigned = await setForceAlignmentTier5Boon(actor, side, boon, "assigned");
  if (assigned) ui.notifications.info(`${forceAlignmentTier5Label(side)} boon assigned: ${boon.name}.`);
  return assigned;
}

async function rollForceAlignmentTier5Boon(actor, side) {
  if (!game.user.isGM || !actor) return null;
  const endpointSide = forceAlignmentTier5Side(forceAlignmentState(actor).value);
  if (side !== endpointSide) {
    ui.notifications.warn("Tier 5 boons can only be rolled for a Luminous Being or Dark Entity.");
    return null;
  }
  const roll = await new Roll("1d6").evaluate({ async: true });
  const boon = forceAlignmentTier5Boon(side, roll.total);
  if (!boon) {
    ui.notifications.warn("Unable to resolve Tier 5 boon roll.");
    return null;
  }
  const assigned = await setForceAlignmentTier5Boon(actor, side, boon, "rolled");
  if (!assigned) return null;
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `Force Alignment: ${forceAlignmentTier5Label(side)} boon - ${boon.name}`
  });
  return assigned;
}

async function clearForceAlignmentTier5Boon(actor, side) {
  if (!game.user.isGM || !actor) return;
  const state = forceAlignmentState(actor);
  const existing = state.majorBoons?.[side];
  if (!existing) return;
  const sideLabel = forceAlignmentTier5Label(side);
  state.majorBoons[side] = null;
  state.deedLog = [...(state.deedLog ?? []), forceAlignmentLogEntry({
    kind: "majorBoon",
    label: `${sideLabel} boon cleared`,
    note: `${existing.name} was removed by the GM.`,
    points: 0,
    previous: state.value,
    next: state.value
  })];
  await setForceAlignmentState(actor, state);
  refreshForceAlignmentPanelsForActor(actor.id);
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

function claimPowerCast(map, item, workflowKey = "") {
  const now = Date.now();
  const dedupeKey = workflowKey
    ? `${game.user.id}:${workflowKey}`
    : `${game.user.id}:${item?.uuid ?? item?.id}:${item?.actor?.id ?? ""}`;
  const recent = map.get(dedupeKey);
  const duplicateWindow = workflowKey ? 10 * 60 * 1000 : 1500;
  if (recent && now - recent < duplicateWindow) return false;
  map.set(dedupeKey, now);
  for (const [key, timestamp] of map.entries()) {
    if (now - timestamp > 10 * 60 * 1000) map.delete(key);
  }
  return true;
}

async function handleForceAlignmentPowerCast(item, workflowKey = "") {
  if (!isEnabled("force-alignment") || !isForceAlignmentPowerItem(item)) return;
  if (!claimPowerCast(RECENT_ALIGNMENT_CASTS, item, workflowKey)) return;

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
  if (!payload.combatId) return;
  const ledger = disturbanceLedger();
  const userId = payload.userId ?? game.user.id;
  const user = game.users.get(userId);
  const current = ledger[userId] ?? {
    userId,
    userName: user?.name ?? payload.userName ?? "Unknown User",
    total: 0,
    entries: []
  };
  const activeTotal = Math.max(0, Number(current.total ?? 0));
  const gain = Number(payload.points ?? 0);
  const entry = {
    id: foundry.utils.randomID(),
    timestamp: new Date().toISOString(),
    combatId: payload.combatId,
    combatName: payload.combatName,
    round: payload.round,
    actorId: payload.actorId,
    actorName: payload.actorName,
    itemId: payload.itemId,
    itemName: payload.itemName,
    level: Number(payload.level ?? 0),
    points: gain,
    totalAfter: activeTotal + gain,
    sources: payload.sources ?? { classes: [], feats: [], other: [] }
  };

  current.userName = user?.name ?? current.userName;
  current.combatId = payload.combatId;
  current.combatName = payload.combatName;
  current.total = entry.totalAfter;
  current.entries = [...(current.entries ?? []), entry].slice(-200);
  ledger[userId] = current;
  await setDisturbanceLedger(ledger);
  refreshForceAlignmentPanelsForActor(entry.actorId);
  refreshHuntedActorSheetPanels();
  refreshHuntedLogWindows();
}

function huntedLedgerEntry(ledger, userId) {
  const user = game.users.get(userId);
  return ledger[userId] ?? {
    userId,
    userName: user?.name ?? "Unknown User",
    total: 0,
    huntedCount: 0,
    entries: []
  };
}

async function adjustDisturbancePool(userId, amount) {
  if (!game.user.isGM) return;
  const requested = Math.trunc(Number(amount ?? 0));
  if (!Number.isFinite(requested) || requested === 0) {
    ui.notifications.warn("Enter a nonzero Disturbance Point adjustment.");
    return;
  }

  const ledger = disturbanceLedger();
  const current = huntedLedgerEntry(ledger, userId);
  const previous = Math.max(0, Number(current.total ?? 0));
  const next = Math.max(0, previous + requested);
  const applied = next - previous;
  if (!applied) {
    ui.notifications.info("The Disturbance Point pool is already at 0.");
    return;
  }

  current.total = next;
  current.manualAdjustments = [...(current.manualAdjustments ?? []), {
    id: foundry.utils.randomID(),
    timestamp: new Date().toISOString(),
    kind: "pool",
    gmName: game.user.name,
    change: applied,
    previous,
    next
  }].slice(-100);
  ledger[userId] = current;
  await setDisturbanceLedger(ledger);
  refreshForceAlignmentPanelsForActor();
  refreshHuntedActorSheetPanels();
  refreshHuntedLogWindows();
}

async function adjustHuntedTier(userId, amount) {
  if (!game.user.isGM) return;
  const direction = Math.sign(Number(amount ?? 0));
  if (!direction) return;

  const ledger = disturbanceLedger();
  const current = huntedLedgerEntry(ledger, userId);
  const previous = Math.min(HUNTED_MAX_TIER, Math.max(0, Math.trunc(Number(current.huntedCount ?? 0))));
  const next = Math.min(HUNTED_MAX_TIER, Math.max(0, previous + direction));
  if (next === previous) {
    ui.notifications.info(`The Hunted tier is already at ${direction > 0 ? "its maximum" : "0"}.`);
    return;
  }

  const previousStatus = huntedStatusForCount(previous);
  const nextStatus = huntedStatusForCount(next);
  current.huntedCount = next;
  current.huntedStatusLabel = nextStatus.label;
  current.huntedStatusDescription = nextStatus.description;
  current.manualAdjustments = [...(current.manualAdjustments ?? []), {
    id: foundry.utils.randomID(),
    timestamp: new Date().toISOString(),
    kind: "tier",
    gmName: game.user.name,
    change: next - previous,
    previous,
    next,
    previousStatusLabel: previousStatus.label,
    nextStatusLabel: nextStatus.label
  }].slice(-100);
  ledger[userId] = current;
  await setDisturbanceLedger(ledger);
  refreshForceAlignmentPanelsForActor();
  refreshHuntedActorSheetPanels();
  refreshHuntedLogWindows();
}

function activateHuntedManualControls(html) {
  html.on("click", "[data-action='hunted-pool-adjust']", async (event) => {
    const controls = $(event.currentTarget).closest("[data-hunted-user-id]");
    const amount = controls.find("[data-field='hunted-pool-adjustment']").first().val();
    await adjustDisturbancePool(controls.data("huntedUserId"), amount);
  });
  html.on("click", "[data-action='hunted-tier-adjust']", async (event) => {
    const controls = $(event.currentTarget).closest("[data-hunted-user-id]");
    await adjustHuntedTier(controls.data("huntedUserId"), event.currentTarget.dataset.amount);
  });
  html.on("keydown", "[data-field='hunted-pool-adjustment']", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    $(event.currentTarget).closest("[data-hunted-user-id]").find("[data-action='hunted-pool-adjust']").trigger("click");
  });
}

async function reduceDisturbanceForLongRest(actor, requestedUserId = game.user.id) {
  if (!game.user.isGM || !isEnabled("hunted") || !actor) return;
  const user = resolveUserForActor(actor, requestedUserId);
  if (!user || user.isGM || !actor.testUserPermission?.(user, "OWNER")) return;

  const level = huntedRestLevel(actor);
  if (level <= 0) return;

  const dedupeKey = `${user.id}:${actor.uuid ?? actor.id}`;
  const now = Date.now();
  const recent = RECENT_HUNTED_RESTS.get(dedupeKey);
  if (recent && now - recent < 1500) return;
  RECENT_HUNTED_RESTS.set(dedupeKey, now);
  for (const [key, timestamp] of RECENT_HUNTED_RESTS.entries()) {
    if (now - timestamp > 5000) RECENT_HUNTED_RESTS.delete(key);
  }

  const ledger = disturbanceLedger();
  const current = ledger[user.id];
  const previous = Math.max(0, Number(current?.total ?? 0));
  if (!current || previous <= 0) return;

  const reduction = Math.min(previous, level);
  current.total = previous - reduction;
  current.restReductions = [...(current.restReductions ?? []), {
    id: foundry.utils.randomID(),
    timestamp: new Date().toISOString(),
    actorId: actor.id,
    actorName: actor.name ?? "Unknown Actor",
    level,
    reduction,
    totalBefore: previous,
    totalAfter: current.total
  }].slice(-100);
  ledger[user.id] = current;

  await setDisturbanceLedger(ledger);
  refreshForceAlignmentPanelsForActor();
  refreshHuntedActorSheetPanels();
  refreshHuntedLogWindows();
}

async function handleHuntedLongRest(actor, result) {
  if (!isEnabled("hunted") || !(result?.longRest || result?.type === "long")) return;
  const user = resolveUserForActor(actor, game.user.id);
  if (!user || user.isGM) return;
  if (game.user.isGM) await reduceDisturbanceForLongRest(actor, user.id);
  else game.socket.emit(`module.${MODULE_ID}`, {
    type: "huntedLongRest",
    payload: { actorUuid: actor.uuid, userId: user.id }
  });
}

function refreshForceAlignmentPanelsForActor(actorId) {
  for (const app of Object.values(ui.windows ?? {})) {
    if (!(app instanceof ForceAlignmentPanel)) continue;
    if (actorId && app.actor?.id !== actorId) continue;
    app.render();
  }
}

function refreshHuntedLogWindows() {
  for (const app of Object.values(ui.windows ?? {})) {
    if (app instanceof HuntedDisturbanceLog) app.render();
  }
}

async function handleHuntedCombatEnd(combat) {
  if (!game.user.isGM || !isEnabled("hunted")) return;
  const resolutionKey = combat?.uuid ?? combat?.id ?? combat?._id;
  if (resolutionKey && RESOLVED_HUNTED_COMBATS.has(resolutionKey)) return;
  const ledger = disturbanceLedger();
  const combatIds = combatIdentifiers(combat);
  const combatActorIds = actorIdsForCombat(combat);
  const updatedActors = new Set();
  let changed = false;

  for (const [userId, current] of Object.entries(ledger)) {
    const user = game.users.get(userId);
    const alreadyResolved = (current.resolutions ?? []).some((entry) => combatIds.has(String(entry.combatId ?? "")));
    if (alreadyResolved) continue;
    const storedCombatId = current.combatId ? String(current.combatId) : "";
    const exactCombatMatch = storedCombatId && combatIds.has(storedCombatId);
    const ownerFallbackMatch = !exactCombatMatch
      && Number(current.total ?? 0) > 0
      && userOwnsAnyActorId(user, combatActorIds);
    if (!exactCombatMatch && !ownerFallbackMatch) continue;

    const pool = Math.max(0, Math.trunc(Number(current.total ?? 0)));
    const roll = pool > 0 ? await new Roll("1d100").evaluate({ async: true }) : null;
    const detected = Boolean(roll && rollTotal(roll) <= pool);
    const previousCount = Math.min(HUNTED_MAX_TIER, Math.max(0, Math.trunc(Number(current.huntedCount ?? 0))));
    const huntedCount = detected ? Math.min(HUNTED_MAX_TIER, previousCount + 1) : previousCount;
    const status = huntedStatusForCount(huntedCount);
    const resolution = {
      id: foundry.utils.randomID(),
      timestamp: new Date().toISOString(),
      combatId: combat.id,
      combatName: combatLabel(combat),
      pool,
      roll: roll ? rollTotal(roll) : null,
      detected,
      match: exactCombatMatch ? "combatId" : "actorOwner",
      huntedCount,
      huntedStatusLabel: status.label,
      huntedStatusDescription: status.description
    };

    current.huntedCount = huntedCount;
    current.huntedStatusLabel = status.label;
    current.huntedStatusDescription = status.description;
    current.resolutions = [...(current.resolutions ?? []), resolution].slice(-50);
    ledger[userId] = current;
    changed = true;

    for (const entry of current.entries ?? []) {
      if (combatIds.has(String(entry.combatId ?? "")) && entry.actorId) updatedActors.add(entry.actorId);
    }
    if (ownerFallbackMatch) {
      for (const actorId of combatActorIds) {
        const actor = game.actors?.get(actorId);
        if (actor?.testUserPermission?.(user, "OWNER")) updatedActors.add(actorId);
      }
    }

  }

  if (!changed) return;
  await setDisturbanceLedger(ledger);
  if (resolutionKey) RESOLVED_HUNTED_COMBATS.add(resolutionKey);
  for (const actorId of updatedActors) refreshForceAlignmentPanelsForActor(actorId);
  refreshHuntedActorSheetPanels();
  refreshHuntedLogWindows();
}

async function handleHuntedForcePowerCast(item, workflowKey = "") {
  if (!isEnabled("hunted") || !isForcePowerItem(item)) return;
  const actor = item.actor;
  const combat = activeCombatForActor(actor);
  if (!combat) return;
  if (!claimPowerCast(RECENT_HUNTED_CASTS, item, workflowKey)) return;

  const user = resolveUserForActor(actor, game.user.id);
  const level = forcePowerLevel(item);
  const payload = {
    userId: user.id,
    userName: user.name,
    combatId: combat.id,
    combatName: combatLabel(combat),
    round: combat.round,
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
      midiCompatibility: midiCompatibilityState(),
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
    notifyMidiCompatibilityConflicts();
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
    html.find("[data-action='midi-apply']").on("click", async () => {
      await applyRecommendedMidiCompatibilitySettings();
      this.render(false);
    });
    html.find("[data-action='midi-restore']").on("click", async () => {
      await restoreMidiCompatibilitySettings();
      this.render(false);
    });
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
  constructor(options = {}) {
    super(options);
    this.sourceDetails = new Map();
  }

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
    this.sourceDetails.clear();
    return {
      users: users.map((user) => ({
        ...user,
        ...huntedStatusView(user),
        manualAdjustments: [...(user.manualAdjustments ?? [])].reverse().map((entry) => ({
          ...entry,
          when: new Date(entry.timestamp).toLocaleString(),
          adjustmentLabel: entry.kind === "tier" ? "Hunted tier" : "Disturbance pool",
          changeLabel: Number(entry.change ?? 0) > 0 ? `+${entry.change}` : String(entry.change ?? 0),
          resultLabel: entry.kind === "tier"
            ? `${entry.previousStatusLabel} ${entry.previous} to ${entry.nextStatusLabel} ${entry.next}`
            : `${entry.previous} to ${entry.next}`
        })),
        restReductions: [...(user.restReductions ?? [])].reverse().map((entry) => ({
          ...entry,
          when: new Date(entry.timestamp).toLocaleString()
        })),
        resolutions: [...(user.resolutions ?? [])].reverse().map((entry) => ({
          ...entry,
          when: new Date(entry.timestamp).toLocaleString(),
          rollLabel: entry.roll === null || entry.roll === undefined ? "No roll" : entry.roll,
          resultLabel: entry.detected ? "Hunted status recorded" : "Not detected"
        })),
        entries: [...(user.entries ?? [])].reverse().map((entry) => ({
          ...entry,
          sourceId: this.cacheSourceDetail(entry),
          sourceSummary: summarizeForcePowerSources(entry.sources),
          when: new Date(entry.timestamp).toLocaleString(),
          combatName: entry.combatName ?? "Combat Encounter"
        }))
      }))
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    installResizableHuntedTables(html);
    activateHuntedManualControls(html);
    html.find("[data-action='reset-user']").on("click", async (event) => {
      const userId = event.currentTarget.dataset.userId;
      const ledger = disturbanceLedger();
      if (!ledger[userId]) return;
      ledger[userId].total = 0;
      ledger[userId].entries = [];
      ledger[userId].manualAdjustments = [];
      ledger[userId].restReductions = [];
      ledger[userId].resolutions = [];
      ledger[userId].huntedCount = 0;
      delete ledger[userId].combatId;
      delete ledger[userId].combatName;
      delete ledger[userId].huntedStatusLabel;
      delete ledger[userId].huntedStatusDescription;
      await setDisturbanceLedger(ledger);
      refreshForceAlignmentPanelsForActor();
      refreshHuntedActorSheetPanels();
      this.render();
    });
    html.find("[data-action='reset-all']").on("click", async () => {
      await setDisturbanceLedger({});
      refreshForceAlignmentPanelsForActor();
      refreshHuntedActorSheetPanels();
      this.render();
    });
    html.find("[data-action='source-detail']").on("click", (event) => {
      const detail = this.sourceDetails.get(event.currentTarget.dataset.sourceId);
      if (detail) new HuntedSourceDetail(detail).render(true);
    });
  }

  cacheSourceDetail(entry) {
    const id = entry.id ?? foundry.utils.randomID();
    this.sourceDetails.set(id, {
      actorName: entry.actorName,
      itemName: entry.itemName,
      sourceSummary: summarizeForcePowerSources(entry.sources)
    });
    return id;
  }
}

class HuntedSourceDetail extends Application {
  constructor(data, options = {}) {
    super(options);
    this.data = data;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${MODULE_ID}-hunted-source-detail`,
      title: "Detected Sources",
      width: 420,
      height: "auto",
      resizable: true
    });
  }

  get title() {
    return `Detected Sources: ${this.data.itemName ?? "Force Power"}`;
  }

  async _renderInner() {
    const actorName = escapeHtml(this.data.actorName ?? "Unknown Actor");
    const itemName = escapeHtml(this.data.itemName ?? "Unknown Force Power");
    const sourceSummary = escapeHtml(this.data.sourceSummary ?? "No detected source detail.");
    return $(`<section class="sw5e-vr-hunted-source-detail">
      <p><strong>Actor:</strong> ${actorName}</p>
      <p><strong>Force Power:</strong> ${itemName}</p>
      <p><strong>Detected Source(s):</strong> ${sourceSummary}</p>
    </section>`);
  }
}

function installResizableHuntedTables(html) {
  html.find(".sw5e-vr-hunted-log table").each((_index, tableElement) => {
    const table = $(tableElement);
    const headers = table.find("thead th");
    if (!headers.length) return;

    headers.each((_headerIndex, headerElement) => {
      const header = $(headerElement);
      header.css("width", `${headerElement.getBoundingClientRect().width}px`);
    });
    table.css("table-layout", "fixed");

    headers.each((_headerIndex, headerElement) => {
      const header = $(headerElement);
      if (header.find(".sw5e-vr-column-resizer").length) return;
      const handle = $(`<span class="sw5e-vr-column-resizer" aria-hidden="true"></span>`);
      header.append(handle);
      handle.on("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const startX = event.clientX;
        const startWidth = headerElement.getBoundingClientRect().width;
        handle[0].setPointerCapture?.(event.pointerId);
        const onMove = (moveEvent) => {
          const nextWidth = Math.max(48, startWidth + (moveEvent.clientX - startX));
          header.css("width", `${nextWidth}px`);
        };
        const onEnd = (endEvent) => {
          handle[0].releasePointerCapture?.(endEvent.pointerId);
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerup", onEnd);
          document.removeEventListener("pointercancel", onEnd);
        };
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onEnd);
        document.addEventListener("pointercancel", onEnd);
      });
    });
  });
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
    const tier5Side = forceAlignmentTier5Side(value);
    const tier5Boon = tier5Side === "neutral" ? null : state.majorBoons?.[tier5Side];
    return {
      actorName: this.actor?.name ?? "Actor",
      value,
      side,
      color: forceAlignmentColor(value),
      markerPercent: forceAlignmentMarkerPercent(value),
      tierLabel: forceAlignmentTierLabel(value),
      majorBenefit: forceAlignmentMajorBenefit(value),
      isGM: game.user.isGM,
      tier5Side,
      tier5Label: forceAlignmentTier5Label(tier5Side),
      tier5Options: forceAlignmentTier5BoonOptions(tier5Side, tier5Boon?.roll),
      tier5Boon: tier5Boon
        ? {
          ...tier5Boon,
          when: new Date(tier5Boon.timestamp).toLocaleString(),
          methodLabel: tier5Boon.method === "rolled" ? "Rolled" : "Assigned"
        }
        : null,
      canManageTier5Boon: game.user.isGM && tier5Side !== "neutral",
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
    activateHuntedManualControls(html);
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
    html.find("[data-action='assign-tier5-boon']").on("click", async (event) => {
      if (!game.user.isGM) return;
      const side = event.currentTarget.dataset.side;
      const roll = Number(html.find("[name='tier5BoonRoll']").val() ?? 0);
      await assignForceAlignmentTier5Boon(this.actor, side, roll);
      this.render();
    });
    html.find("[data-action='roll-tier5-boon']").on("click", async (event) => {
      if (!game.user.isGM) return;
      const side = event.currentTarget.dataset.side;
      await rollForceAlignmentTier5Boon(this.actor, side);
      this.render();
    });
    html.find("[data-action='clear-tier5-boon']").on("click", async (event) => {
      if (!game.user.isGM) return;
      const side = event.currentTarget.dataset.side;
      await clearForceAlignmentTier5Boon(this.actor, side);
      this.render();
    });
    html.find("[data-action='hunted-log']").on("click", () => {
      if (!game.user.isGM) return;
      new HuntedDisturbanceLog().render(true);
    });
  }
}

class CharacterProgressionPanel extends Application {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${MODULE_ID}-character-progression`,
      title: "SWVR Character Progression",
      width: 760,
      height: 720,
      resizable: true
    });
  }

  get title() {
    return `SWVR Progression: ${this.actor?.name ?? "Actor"}`;
  }

  async _renderInner() {
    const scan = progressionScan(this.actor);
    const state = scan.state;
    const primaryId = state.primaryClassId || scan.primary?.id || "";
    const secondaryId = state.secondaryClassId || scan.secondary?.id || "";
    const dichotomousClassId = state.dichotomousClassId || scan.dichotomousClass?.id || "";
    const classOptions = scan.classes.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === primaryId ? "selected" : ""}>${escapeHtml(progressionClassOptionLabel(item))}</option>`).join("");
    const secondaryOptions = scan.classes.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === secondaryId ? "selected" : ""}>${escapeHtml(progressionClassOptionLabel(item))}</option>`).join("");
    const dichotomousOptions = scan.classes.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === dichotomousClassId ? "selected" : ""}>${escapeHtml(progressionClassOptionLabel(item))}</option>`).join("");
    const syncHitDiceHtml = (scan.gestaltEnabled && scan.primary?.counting && scan.secondary?.counting && scan.gestaltHitDie)
      ? `<button type="button" class="sw5e-vr-progression-hitdie" data-action="sync-gestalt-hit-dice"><i class="fas fa-dice-d20"></i> Sync Gestalt Class Hit Dice</button><p class="notes">Keeps both class items real, sets the active hit-die pool to d${escapeHtml(scan.gestaltHitDie)}, and zeroes the secondary class's hit-dice contribution so Foundry does not add both pools.</p>`
      : "";
    const applyHitDieHtml = (scan.gestaltEnabled && scan.primary?.counting && scan.secondary && !scan.secondary?.counting && scan.gestaltHitDie && scan.primary.hitDie !== scan.gestaltHitDie)
      ? `<button type="button" class="sw5e-vr-progression-hitdie" data-action="apply-gestalt-hit-die"><i class="fas fa-dice-d20"></i> Apply Gestalt Hit Die d${escapeHtml(scan.gestaltHitDie)} to Primary Class</button><p class="notes">Legacy reference workflow only. For new Gestalt actors, keep both classes real and use Sync Gestalt Class Hit Dice instead.</p>`
      : "";
    const archetypeRows = scan.archetypes.length
      ? scan.archetypes.map((item) => {
        const selected = state.archetypeIds?.includes(item.id);
        return `
          <div class="sw5e-vr-progression-archetype-row">
            <label class="sw5e-vr-progression-check">
              <input type="checkbox" name="archetypeIds" value="${escapeHtml(item.id)}" ${selected ? "checked" : ""}>
              <span><strong>${escapeHtml(item.name)}</strong>${item.classHint ? `<small>${escapeHtml(item.classHint)}</small>` : ""}</span>
            </label>
            ${selected ? `<button type="button" data-action="remove-archetype" data-archetype-id="${escapeHtml(item.id)}" title="Remove Archetype"><i class="fas fa-trash"></i></button>` : ""}
          </div>
        `;
      }).join("")
      : `<p class="notes">No archetype/subclass items were detected on this actor. Add the archetype items first, then scan again.</p>`;
    const gestaltArchetypeRows = scan.gestaltClassArchetypes.length && scan.archetypes.length
      ? scan.gestaltClassArchetypes.map((entry) => {
        const selectedIds = new Set(progressionClassArchetypeIds(state, entry.classItem.id));
        const selectedCount = selectedIds.size;
        const rows = scan.archetypes.map((item) => {
          const selected = selectedIds.has(item.id);
          return `
            <div class="sw5e-vr-progression-archetype-row">
              <label class="sw5e-vr-progression-check">
                <input type="checkbox" name="gestaltArchetypeIds" data-class-id="${escapeHtml(entry.classItem.id)}" value="${escapeHtml(item.id)}" ${selected ? "checked" : ""}>
                <span><strong>${escapeHtml(item.name)}</strong>${item.classHint ? `<small>${escapeHtml(item.classHint)}</small>` : ""}</span>
              </label>
              ${selected ? `<button type="button" data-action="remove-archetype" data-class-id="${escapeHtml(entry.classItem.id)}" data-archetype-id="${escapeHtml(item.id)}" title="Remove Archetype"><i class="fas fa-trash"></i></button>` : ""}
            </div>
          `;
        }).join("");
        return `
          <div class="sw5e-vr-progression-class-archetypes" data-class-id="${escapeHtml(entry.classItem.id)}">
            <h4>${escapeHtml(entry.role)} Class: ${escapeHtml(entry.classItem.name)} <span>${escapeHtml(selectedCount)}/2</span></h4>
            <p class="notes">Choose exactly two archetypes for this class track.</p>
            <div class="sw5e-vr-progression-import">
              <input type="text" data-class-id="${escapeHtml(entry.classItem.id)}" name="archetypeUuid-${escapeHtml(entry.classItem.id)}" placeholder="Drop archetype here or paste UUID">
              <button type="button" data-action="import-archetype" data-class-id="${escapeHtml(entry.classItem.id)}" title="Import Archetype"><i class="fas fa-file-import"></i></button>
            </div>
            ${rows}
          </div>
        `;
      }).join("")
      : `<p class="notes">Add two Gestalt class tracks and archetype/subclass items, then scan again.</p>`;
    const gestaltArchetypeSummaryHtml = state.mode === "both"
      ? `<p class="notes">Gestalt + Dichotomous expects four total archetypes: two under ${escapeHtml(scan.primary?.name ?? "the primary class")} and two under ${escapeHtml(scan.secondary?.name ?? "the secondary class")}. Current total: ${escapeHtml(scan.gestaltArchetypeIds.length)}/4.</p>`
      : "";
    const archetypeSelectionHtml = state.mode === "both"
      ? gestaltArchetypeRows
      : `
        <div class="form-group">
          <label>Class</label>
          <select name="dichotomousClassId">${dichotomousOptions || `<option value="">No classes detected</option>`}</select>
        </div>
        <div class="sw5e-vr-progression-archetypes">${archetypeRows}</div>
      `;
    const warningHtml = scan.warnings.length
      ? `<section class="sw5e-vr-progression-warnings"><h3>Warnings</h3><ul>${scan.warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>`
      : `<section class="sw5e-vr-progression-ok"><h3>Warnings</h3><p>No blocking warnings detected.</p></section>`;
    const recommendationHtml = scan.recommendations.length
      ? `<section><h3>GM-Reviewed Actions</h3><ul>${scan.recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>`
      : "";
    const detailHtml = scan.details.length
      ? `<section><h3>Rule Calculations</h3><ul>${scan.details.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>`
      : "";

    return $(`
      <form class="sw5e-vr-progression">
        <p class="notes">This panel assists Gestalt and Dichotomous progression without automatically adding a second class as a normal class item. Review the scan, then apply class features, archetype features, proficiencies, equipment, and casting changes intentionally.</p>

        <div class="form-group">
          <label>Progression Mode</label>
          <select name="mode">
            <option value="normal" ${state.mode === "normal" ? "selected" : ""}>Normal</option>
            <option value="gestalt" ${state.mode === "gestalt" ? "selected" : ""}>Gestalt</option>
            <option value="dichotomous" ${state.mode === "dichotomous" ? "selected" : ""}>Dichotomous</option>
            <option value="both" ${state.mode === "both" ? "selected" : ""}>Gestalt + Dichotomous</option>
          </select>
        </div>

        <fieldset>
          <legend>Gestalt Class Tracks</legend>
          <div class="form-group">
            <label>Primary Class</label>
            <select name="primaryClassId">${classOptions || `<option value="">No classes detected</option>`}</select>
          </div>
          <div class="form-group">
            <label>Secondary Class</label>
            <select name="secondaryClassId">${secondaryOptions || `<option value="">No classes detected</option>`}</select>
          </div>
          ${syncHitDiceHtml}
          ${applyHitDieHtml}
          <div class="form-group">
            <label>Saving Throws From</label>
            <select name="savingThrowSource">
              <option value="primary" ${state.savingThrowSource === "primary" ? "selected" : ""}>Primary class pair</option>
              <option value="secondary" ${state.savingThrowSource === "secondary" ? "selected" : ""}>Secondary class pair</option>
            </select>
          </div>
          <div class="form-group">
            <label>Skills From</label>
            <select name="skillSource">
              <option value="primary" ${state.skillSource === "primary" ? "selected" : ""}>Primary class list</option>
              <option value="secondary" ${state.skillSource === "secondary" ? "selected" : ""}>Secondary class list</option>
            </select>
          </div>
          <div class="form-group">
            <label>Starting Equipment From</label>
            <select name="equipmentSource">
              <option value="primary" ${state.equipmentSource === "primary" ? "selected" : ""}>Primary class</option>
              <option value="secondary" ${state.equipmentSource === "secondary" ? "selected" : ""}>Secondary class</option>
            </select>
          </div>
          <div class="form-group">
            <label>ASI Handling</label>
            <select name="asiMode">
              <option value="single" ${state.asiMode === "single" ? "selected" : ""}>Single ASI only</option>
              <option value="asi-and-feat" ${state.asiMode === "asi-and-feat" ? "selected" : ""}>ASI from one class + feat from the other</option>
            </select>
          </div>
        </fieldset>

        <fieldset>
          <legend>Dichotomous Archetypes</legend>
          <div class="form-group">
            <label>Feature Grant Mode</label>
            <select name="archetypeGrantMode">
              <option value="both" ${state.archetypeGrantMode === "both" ? "selected" : ""}>Grant both archetypes at each feature level</option>
              <option value="choose" ${state.archetypeGrantMode === "choose" ? "selected" : ""}>Choose one archetype feature at each feature level</option>
            </select>
          </div>
          ${gestaltArchetypeSummaryHtml}
          ${archetypeSelectionHtml}
        </fieldset>

        <section class="sw5e-vr-progression-results">
          ${warningHtml}
          ${detailHtml}
          ${recommendationHtml}
        </section>

        <footer class="sw5e-vr-progression-footer">
          <button type="button" data-action="progression-save"><i class="fas fa-save"></i> Save and Scan</button>
          <button type="button" data-action="progression-note"><i class="fas fa-clipboard-list"></i> Create/Update Notes Feature</button>
        </footer>
      </form>
    `);
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("form").on("submit", (event) => {
      event.preventDefault();
    });
    html.find("[data-action='progression-save']").on("click", async (event) => {
      event.preventDefault();
      await this.saveFromForm(html);
      await this.refreshContent();
    });
    html.find("[data-action='progression-note']").on("click", async () => {
      await this.saveFromForm(html, { notify: false });
      await createOrUpdateProgressionNote(this.actor);
      await this.refreshContent();
    });
    html.find("[data-action='convert-secondary-class']").on("click", async (event) => {
      event.preventDefault();
      await this.saveFromForm(html, { notify: false });
      const state = progressionState(this.actor);
      await convertGestaltClassToReference(this.actor, state.secondaryClassId);
      await this.refreshContent();
    });
    html.find("[data-action='apply-gestalt-hit-die']").on("click", async (event) => {
      event.preventDefault();
      await this.saveFromForm(html, { notify: false });
      await applyGestaltHitDieToPrimary(this.actor);
      await this.refreshContent();
    });
    html.find("[data-action='sync-gestalt-hit-dice']").on("click", async (event) => {
      event.preventDefault();
      await this.saveFromForm(html, { notify: false });
      await syncGestaltClassHitDice(this.actor);
      await this.refreshContent();
    });
    html.find("[data-action='import-archetype']").on("click", async (event) => {
      event.preventDefault();
      await this.saveFromForm(html, { notify: false });
      const classId = event.currentTarget.dataset.classId;
      const uuid = String(html.find(".sw5e-vr-progression-import input").toArray().find((input) => input.dataset.classId === classId)?.value ?? "").trim();
      if (!uuid) {
        ui.notifications.warn("Paste an archetype UUID or drop an archetype onto this class track.");
        return;
      }
      await createGestaltArchetypeReference(this.actor, classId, uuid);
      await this.refreshContent();
    });
    html.find("[data-action='remove-archetype']").on("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const archetypeId = event.currentTarget.dataset.archetypeId;
      const classId = event.currentTarget.dataset.classId ?? "";
      await removeProgressionArchetype(this.actor, archetypeId, classId);
      await this.refreshContent();
    });
    html.find(".sw5e-vr-progression-class-archetypes").on("dragover", (event) => {
      event.preventDefault();
    });
    html.find(".sw5e-vr-progression-class-archetypes").on("drop", async (event) => {
      event.preventDefault();
      await this.saveFromForm(html, { notify: false });
      const classId = event.currentTarget.dataset.classId;
      const data = TextEditor.getDragEventData(event.originalEvent ?? event);
      const uuid = data?.uuid ?? data?.itemUuid ?? data?.documentUuid;
      if (!uuid) {
        ui.notifications.warn("Drop an archetype/subclass item or paste its UUID.");
        return;
      }
      await createGestaltArchetypeReference(this.actor, classId, uuid);
      await this.refreshContent();
    });
  }

  async refreshContent() {
    const content = this.element?.find?.(".window-content");
    if (!content?.length) return this.render(true);
    const inner = await this._renderInner();
    content.empty().append(inner);
    this.activateListeners(content);
  }

  async saveFromForm(html, { notify = true } = {}) {
    if (!this.actor || !game.user.isGM) {
      ui.notifications.warn("Only a GM can change SWVR progression configuration.");
      return;
    }
    const archetypeIds = html.find("input[name='archetypeIds']:checked").toArray().map((input) => input.value);
    const gestaltArchetypeIds = {};
    for (const input of html.find("input[name='gestaltArchetypeIds']:checked").toArray()) {
      const classId = input.dataset.classId;
      if (!classId) continue;
      gestaltArchetypeIds[classId] ??= [];
      gestaltArchetypeIds[classId].push(input.value);
    }
    const state = {
      mode: String(html.find("[name='mode']").val() ?? "normal"),
      primaryClassId: String(html.find("[name='primaryClassId']").val() ?? ""),
      secondaryClassId: String(html.find("[name='secondaryClassId']").val() ?? ""),
      savingThrowSource: String(html.find("[name='savingThrowSource']").val() ?? "primary"),
      skillSource: String(html.find("[name='skillSource']").val() ?? "primary"),
      equipmentSource: String(html.find("[name='equipmentSource']").val() ?? "primary"),
      asiMode: String(html.find("[name='asiMode']").val() ?? "single"),
      dichotomousClassId: String(html.find("[name='dichotomousClassId']").val() ?? ""),
      archetypeIds,
      gestaltArchetypeIds,
      archetypeGrantMode: String(html.find("[name='archetypeGrantMode']").val() ?? "both")
    };
    await this.actor.setFlag(MODULE_ID, "progression", state);
    this.actor.prepareData();
    if (notify) ui.notifications.info("SWVR progression configuration saved.");
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
    if ($(element).closest(".sw5e-vr-progression-sheet").length) return false;
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
    return true;
  }

  const hitDice = findSheetTextBlock(html, /hit\s*dice/i);
  if (hitDice?.length) {
    hitDice.before(panel);
    return true;
  }

  return false;
}

function huntedActorSheetRows(actor) {
  return disturbancePoolsForActor(actor).map((pool) => `
    <div class="sw5e-vr-hunted-pool" data-hunted-user-id="${escapeHtml(pool.userId)}">
      <div class="sw5e-vr-hunted-pool-summary">
        <span>${escapeHtml(pool.userName)}</span>
        <strong>${Math.max(0, Number(pool.total ?? 0))} DP</strong>
        <em title="${escapeHtml(pool.huntedStatusDescription)}">${escapeHtml(pool.huntedStatusLabel)} ${pool.huntedCount}</em>
      </div>
      <div class="sw5e-vr-hunted-manual-controls">
        <input type="number" value="1" step="1" data-field="hunted-pool-adjustment" title="Signed Disturbance Point adjustment" />
        <button type="button" data-action="hunted-pool-adjust" title="Apply Disturbance Point adjustment"><i class="fas fa-check"></i></button>
        <button type="button" data-action="hunted-tier-adjust" data-amount="-1" title="Decrease Hunted tier" ${pool.canDecreaseHuntedTier ? "" : "disabled"}><i class="fas fa-arrow-down"></i></button>
        <button type="button" data-action="hunted-tier-adjust" data-amount="1" title="Increase Hunted tier" ${pool.canIncreaseHuntedTier ? "" : "disabled"}><i class="fas fa-arrow-up"></i></button>
      </div>
    </div>
  `).join("");
}

function refreshHuntedActorSheetPanels(actorId = null) {
  if (!game.user?.isGM) return;
  for (const panelElement of document.querySelectorAll(".sw5e-vr-hunted-sheet")) {
    const panelActorId = panelElement.dataset.actorId;
    if (actorId && panelActorId !== actorId) continue;
    const actor = game.actors?.get(panelActorId);
    const body = panelElement.querySelector(".sw5e-vr-hunted-pools");
    if (actor && body) body.innerHTML = huntedActorSheetRows(actor);
  }
}

function renderHuntedActorPanel(app, html) {
  html = globalThis.jQuery && html instanceof jQuery ? html : $(html);
  const actor = actorFromSheetApp(app);
  if (!actor || !game.user.isGM || !useModifiedActorSheet() || !isEnabled("hunted") || isEnabled("force-alignment")) return;
  const host = app?.element
    ? (globalThis.jQuery && app.element instanceof jQuery ? app.element : $(app.element))
    : html.closest(".app");
  host?.find?.(".sw5e-vr-hunted-sheet").remove();
  html.find(".sw5e-vr-hunted-sheet").remove();

  const rows = huntedActorSheetRows(actor);
  if (!rows) return;
  const panel = $(`
    <section class="sw5e-vr-hunted-sheet" data-actor-id="${escapeHtml(actor.id)}">
      <div class="sw5e-vr-hunted-head">
        <label>Hunted</label>
        <button type="button" data-action="hunted-log" title="Open Hunted disturbance log"><i class="fas fa-list"></i></button>
      </div>
      <div class="sw5e-vr-hunted-pools">${rows}</div>
    </section>
  `);
  panel.find("[data-action='hunted-log']").on("click", () => new HuntedDisturbanceLog().render(true));
  activateHuntedManualControls(panel);

  if (!insertForceAlignmentSheetPanel(html, panel)) {
    console.warn(`SWVR could not find an actor sheet insertion point for Hunted on ${actor.name}.`);
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

  if (!insertForceAlignmentSheetPanel(html, panel)) {
    console.warn(`SWVR could not find an actor sheet insertion point for Force Alignment on ${actor.name}.`);
  }
}

function renderProgressionActorPanel(app, html) {
  html = globalThis.jQuery && html instanceof jQuery ? html : $(html);
  const actor = actorFromSheetApp(app);
  if (!actor || !useModifiedActorSheet() || !isEnabled("gestalt-dichotomous")) return;
  const host = app?.element
    ? (globalThis.jQuery && app.element instanceof jQuery ? app.element : $(app.element))
    : html.closest(".app");
  host?.find?.(".sw5e-vr-progression-sheet").remove();
  html.find(".sw5e-vr-progression-sheet").remove();

  const scan = progressionScan(actor);
  const active = scan.state.mode !== "normal";
  const warningCount = scan.warnings.length;
  const panel = $(`
    <section class="sw5e-vr-progression-sheet">
      <div class="sw5e-vr-progression-head">
        <label>Progression</label>
        <strong>${escapeHtml(progressionModeLabel(scan.state.mode))}</strong>
        <button type="button" data-action="progression-open" title="Open SWVR progression details"><i class="fas fa-project-diagram"></i></button>
      </div>
      <div class="sw5e-vr-progression-summary ${warningCount ? "warning" : active ? "active" : ""}">
        ${warningCount ? `${warningCount} warning${warningCount === 1 ? "" : "s"}` : active ? "Configured" : "Normal"}
      </div>
    </section>
  `);

  panel.find("[data-action='progression-open']").on("click", () => new CharacterProgressionPanel(actor).render(true));

  const forcePanel = html.find(".sw5e-vr-force-alignment-sheet").last();
  if (forcePanel.length) {
    forcePanel.after(panel);
    return;
  }

  const hitDice = findSheetTextBlock(html, /hit\s*dice/i);
  if (hitDice?.length) {
    hitDice.after(panel);
    return;
  }

  const forcePoints = findSheetTextBlock(html, /force\s*points/i);
  if (forcePoints?.length) {
    forcePoints.after(panel);
    return;
  }
}

function renderAlternativeArmorActorPanel(app, html) {
  html = globalThis.jQuery && html instanceof jQuery ? html : $(html);
  const actor = actorFromSheetApp(app);
  if (!actor || !useModifiedActorSheet() || !isEnabled("alternative-armor")) return;
  const host = app?.element
    ? (globalThis.jQuery && app.element instanceof jQuery ? app.element : $(app.element))
    : html.closest(".app");
  host?.find?.(".sw5e-vr-alt-armor-sheet").remove();
  html.find(".sw5e-vr-alt-armor-sheet").remove();

  const summary = alternativeArmorSummary(actor);
  const warning = summary.warnings.length ? `<span title="${escapeHtml(summary.warnings.join(" "))}">!</span>` : "";
  const panel = $(`
    <section class="sw5e-vr-alt-armor-sheet">
      <div class="sw5e-vr-alt-armor-head">
        <label>Alt Armor</label>
        ${warning}
      </div>
      <div class="sw5e-vr-alt-armor-values" title="${escapeHtml(summary.details.concat(summary.warnings).join(" "))}">
        <strong>AC ${summary.value}</strong>
        <strong>DR ${summary.dr}</strong>
      </div>
      <small>${escapeHtml(summary.source)}${summary.currentAc ? ` (normal AC ${summary.currentAc})` : ""}</small>
    </section>
  `);

  const progressionPanel = html.find(".sw5e-vr-progression-sheet").last();
  if (progressionPanel.length) {
    progressionPanel.after(panel);
    return;
  }

  const forcePanel = html.find(".sw5e-vr-force-alignment-sheet").last();
  if (forcePanel.length) {
    forcePanel.after(panel);
    return;
  }

  const hitDice = findSheetTextBlock(html, /hit\s*dice/i);
  if (hitDice?.length) {
    hitDice.after(panel);
    return;
  }

  const armor = findSheetTextBlock(html, /armor/i);
  if (armor?.length) armor.after(panel);
}

function safeRenderActorPanel(label, callback, app, html) {
  try {
    callback(app, html);
  } catch (error) {
    console.error(`SWVR failed to render ${label} actor sheet panel.`, error);
  }
}

function categoryLabel(category) {
  return category.replace(/(^|-)([a-z])/g, (_match, separator, letter) => `${separator ? " " : ""}${letter.toUpperCase()}`);
}

function automationClass(automation) {
  return {
    Automated: "automated",
    Assisted: "assisted",
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
    hint: "Enable SWVR actor-facing panels and popouts for supported rules.",
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

  game.settings.register(MODULE_ID, "midiCompatibilityBackup", {
    name: "Midi-QOL Compatibility Backup",
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

  patchGestaltPreparedData();
});

Hooks.once("ready", () => {
  patchGestaltPreparedData();
  reprepareGestaltActors();

  if (game.user.isGM) {
    if (isEnabled("crueler-criticals")) syncCruelerCriticalsSetting(true);
    if (isEnabled("asi-feat")) syncSw5eAsiAndFeatSetting(true);
    if (isEnabled("simplified-forcecasting")) syncSw5eSimplifiedForcecastingSetting(true);
    notifyMidiCompatibilityConflicts();
  }

  game.socket.on(`module.${MODULE_ID}`, (message) => {
    if (message?.type === "huntedForcePowerCast" && isResponsibleGM()) {
      recordDisturbanceCast(message.payload);
      return;
    }
    if (message?.type === "huntedLongRest" && isResponsibleGM()) {
      fromUuid(message.payload?.actorUuid).then((actor) => {
        if (actor) reduceDisturbanceForLongRest(actor, message.payload?.userId);
      });
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
    adjustDisturbancePool,
    adjustHuntedTier,
    forceAlignmentState,
    resetForceAlignment,
    confirmResetForceAlignment,
    assignForceAlignmentTier5Boon,
    rollForceAlignmentTier5Boon,
    clearForceAlignmentTier5Boon,
    openConfig: () => new VariantRulesConfig().render(true),
    openReport: () => new VariantRulesReport().render(true),
    openHuntedLog: () => new HuntedDisturbanceLog().render(true),
    openForceAlignment: (actor) => new ForceAlignmentPanel(actor).render(true),
    openProgression: (actor) => new CharacterProgressionPanel(actor).render(true),
    progressionState,
    progressionScan,
    convertGestaltClassToReference,
    createGestaltArchetypeReference,
    removeProgressionArchetype,
    applyGestaltHitDieToPrimary,
    syncGestaltClassHitDice,
    alternativeArmorSummary,
    midiCompatibilityState,
    applyRecommendedMidiCompatibilitySettings,
    restoreMidiCompatibilitySettings,
    applyTacticalInitiative
  };
});

Hooks.on("preUpdateActor", (actor, changed) => {
  handleWounds(actor, changed);
});

Hooks.on("deleteCombat", (combat) => {
  handleHuntedCombatEnd(combat);
  handleStrenuousCombat(combat);
});

Hooks.on("updateCombat", (combat, changed) => {
  if (foundry.utils.getProperty(changed, "active") === false) handleHuntedCombatEnd(combat);
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
  if (!midiWorkflowEnabled()) {
    await handleHuntedForcePowerCast(item);
    await handleForceAlignmentPowerCast(item);
  }

  if (item?.type === "consumable") {
    postEnabledRuleReminder("bonus-action-consumables", `${item.name} may be usable as a bonus action if its normal activation is not already a bonus action.`);
  }
  if (item?.type === "weapon") {
    postEnabledRuleReminder("ammunition-sizes", "Confirm the weapon is using the correct ammo size category for its damage dice.");
    postEnabledRuleReminder("weapon-sundering", "If this is a Sundering attack, apply the attack to the target weapon's HP instead of the creature.");
  }
}

async function handleUseActivity(activity) {
  if (midiWorkflowEnabled()) return;
  const item = usedItemFromActivity(activity);
  await handleHuntedForcePowerCast(item);
  await handleForceAlignmentPowerCast(item);
}

async function handleMidiWorkflowComplete(workflow) {
  if (!midiWorkflowEnabled() || !workflow) return;
  const item = workflow.item ?? workflow.activity?.item;
  if (!item) return;
  const workflowId = workflow.id ?? workflow.uuid ?? workflow.itemCardUuid;
  const workflowKey = workflowId ? `midi:${workflowId}` : "";
  await handleHuntedForcePowerCast(item, workflowKey);
  await handleForceAlignmentPowerCast(item, workflowKey);
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
Hooks.on("dnd5e.postBuildSavingThrowRollConfig", handleElevationPostBuildSavingThrowRollConfig);
Hooks.on("dnd5e.postSavingThrowRollConfiguration", handleElevationPostSavingThrowRollConfiguration);
Hooks.on("dnd5e.postBuildAttackRollConfig", handleAlternativeArmorPostBuildAttackRollConfig);
Hooks.on("dnd5e.postAttackRollConfiguration", handleAlternativeArmorPostAttackRollConfiguration);
Hooks.on("dnd5e.postDamageRollConfiguration", markAlternativeArmorAttackDamage);
Hooks.on("sw5e.postDamageRollConfiguration", markAlternativeArmorAttackDamage);
Hooks.on("dnd5e.rollDamage", markAlternativeArmorAttackDamage);
Hooks.on("sw5e.rollDamage", markAlternativeArmorAttackDamage);
Hooks.on("dnd5e.calculateDamage", applyAlternativeArmorDamageReduction);
Hooks.on("sw5e.calculateDamage", applyAlternativeArmorDamageReduction);
Hooks.on("midi-qol.dnd5eCalculateDamage", applyAlternativeArmorDamageReduction);
Hooks.on("midi-qol.RollComplete", handleMidiWorkflowComplete);
Hooks.on("dnd5e.rollAbilityTest", handleRollAbilityTest);
Hooks.on("sw5e.rollAbilityTest", handleRollAbilityTest);
Hooks.on("renderActorSheet", (app, html) => safeRenderActorPanel("Force Alignment", renderForceAlignmentActorPanel, app, html));
Hooks.on("renderActorSheetV2", (app, html) => safeRenderActorPanel("Force Alignment", renderForceAlignmentActorPanel, app, html));
Hooks.on("renderActorSheet5eCharacter", (app, html) => safeRenderActorPanel("Force Alignment", renderForceAlignmentActorPanel, app, html));
Hooks.on("renderActorSheet", (app, html) => safeRenderActorPanel("Hunted", renderHuntedActorPanel, app, html));
Hooks.on("renderActorSheetV2", (app, html) => safeRenderActorPanel("Hunted", renderHuntedActorPanel, app, html));
Hooks.on("renderActorSheet5eCharacter", (app, html) => safeRenderActorPanel("Hunted", renderHuntedActorPanel, app, html));
Hooks.on("renderActorSheet", (app, html) => safeRenderActorPanel("Progression", renderProgressionActorPanel, app, html));
Hooks.on("renderActorSheetV2", (app, html) => safeRenderActorPanel("Progression", renderProgressionActorPanel, app, html));
Hooks.on("renderActorSheet5eCharacter", (app, html) => safeRenderActorPanel("Progression", renderProgressionActorPanel, app, html));
Hooks.on("renderActorSheet", (app, html) => safeRenderActorPanel("Alternative Armor", renderAlternativeArmorActorPanel, app, html));
Hooks.on("renderActorSheetV2", (app, html) => safeRenderActorPanel("Alternative Armor", renderAlternativeArmorActorPanel, app, html));
Hooks.on("renderActorSheet5eCharacter", (app, html) => safeRenderActorPanel("Alternative Armor", renderAlternativeArmorActorPanel, app, html));
Hooks.on("dnd5e.restCompleted", handleHuntedLongRest);

Hooks.on("renderCombatTracker", (_app, html) => {
  if (!game.user.isGM || !isEnabled("tactical-initiative")) return;
  const button = $(`<button type="button" class="sw5e-vr-tactical"><i class="fas fa-users"></i> Tactical Initiative</button>`);
  button.on("click", applyTacticalInitiative);
  html.find("#combat-tracker").before(button);
});
