# SW5e Variant Rules Applicability

Source reviewed: https://sw5e.com/rules/variantRules via the live `https://sw5eapi.azurewebsites.net/api/VariantRule` data.

## Automated

- Wounds: actor HP drops to 0 trigger the Constitution save, wounded-level flags, escalating/resetting DC, death-save failures, and clearing wounds at full HP.
- Alternative Armor: the SWVR Actor Sheet displays the rule's calculated AC and DR from equipped armor, shields, natural armor, or supported unarmored defense formulas. Single-target attack rolls receive a labeled `SWVR Alternative Armor` adjustment equal to normal AC minus Alternative AC, making Foundry hit checks resolve against the Alternative AC without rewriting actor data. Attack-activity damage rolls are tagged when rolled; when that damage is applied, passive Alternative Armor DR reduces positive damage to a minimum of 1.
- Strenuous Combat: deleting/ending a combat triggers Constitution saves for surviving combatants against DC 10 plus completed rounds and applies exhaustion on failure.
- Tactical Initiative: GMs can select multiple combatant tokens and use the combat tracker button to set the group to the lowest initiative.
- Hunted: Force power casts during combat encounters increase the casting user's persistent Disturbance Point pool by the Force power level. At-wills add 0. Tech powers are ignored. At combat end or when combat is marked inactive, the GM rolls d100 against each applicable pool; rolling equal to or below the pool records a Hunted status and advances the hunter perception tag without clearing the pool. A completed long rest reduces the owning user's pool by the resting actor's level, to a minimum of 0. GMs can manually adjust pools with signed values and move the bounded Hunted tier up or down. Details are shown in the GM-only Hunted log and, when Force Alignment is disabled, a compact GM-only SWVR Actor Sheet panel.
- Milestone Leveling: enabling the rule sets D&D5e `levelingMode` to `noxp`; disabling it sets the mode to `xp`.
- Force Alignment: class-sourced light and dark Force power casts of 1st level or higher move the actor on a -100 to +100 alignment scale. First unique class-sourced cast grants points equal to power level; later casts of the same power grant 1 point. At-wills, universal powers, tech powers, and detectable non-class sources are ignored. The SWVR Actor Sheet panel shows the scale, GM adjustments, minor trait save prompts, and a deed/action log.
- Crueler Criticals: enabling the rule turns on D&D5e `criticalDamageMaxDice`, which makes critical hits maximize one set of damage dice and roll the additional critical dice. Disabling the rule turns the setting off.
- ASI and a Feat: enabling the rule turns on SW5e `allowFeatsAndASI`; disabling it turns the setting off. SW5e marks this as reload-required.
- Simplified Forcecasting: enabling the rule turns on SW5e `simplifiedForcecasting`; disabling it turns the setting off. SW5e marks this as reload-required.
- Elevation: attacks against one targeted token receive source-specific adjustments for the higher creature's ranged attack bonus or AC bonus. Dexterity saves receive the higher creature's bonus or the lower creature's penalty when the controlling creature is resolved from the originating activity message or one targeted token. One-quarter, half, and three-quarters cover use the rule's +2/+3/+5 progression without stacking with dominance; cover on the lower creature reduces dominance by one level per cover level unless the higher creature has a detected Sharpshooter Mastery-style feat. Every adjustment is labeled in the roll formula and stored on the chat message flags for inspection.

## Reminder Only

- Bonus Action Consumables: item workflows differ, so the module reminds the GM when a consumable is used.
- Careful Checks: the module reminds the GM on ability checks.
- Saving Throw Checks: the module reminds the GM on ability checks.

## Assisted Character Building

- Gestalt and Dichotomous Characters: the SWVR Actor Sheet can store an actor's progression mode, Gestalt class tracks, proficiency source choices, ASI handling, Dichotomous class, archetype choices, per-Gestalt-class archetype choices, and archetype grant mode. It scans class/archetype items, calculates the Gestalt hit die, doubles displayed XP targets for guidance, flags multiclass and ASI conflicts, summarizes same/opposed casting handling, and can create or update a GM-reviewed progression note item on the actor. In Gestalt mode, both classes can remain real Foundry class items for class features and archetype data. SWVR corrects prepared character level, proficiency bonus, HP maximum, and hit dice after D&D5e preparation so the actor uses the Gestalt level and averaged hit die instead of summing both class tracks. The progression panel can sync class hit-die fields so the primary class carries the averaged hit-die pool and the secondary class contributes 0 hit dice while remaining a real class item. In Gestalt + Dichotomous mode, the panel expects two archetypes under each Gestalt class track at 3rd level. It does not bulk-grant archetype/class features, because feature grants still need GM review in SW5e/D&D5e actor data.

## Manual or Not Mechanically Applicable

The remaining variant rules either change character advancement data, item compendium data, campaign structure, narrative state, or core roll workflows too deeply to safely enforce from a small world module. They are still present in the GM configuration panel so the table can enable, document, and review them.

## Known Limits

- Alternative Armor does not permanently rewrite `system.attributes.ac`. Its attack-roll adjustment requires exactly one targeted token. DR is automated only for damage rolls created by attack activities, because D&D5e's damage application options do not otherwise prove whether damage came from an attack roll hit.
- Gestalt HP recalculation uses the primary class's stored HP advancement choices and evaluates max/average/rolled entries against the averaged Gestalt hit die. If the primary class lacks HP advancement data, SWVR falls back to the secondary class. Unusual manual HP overrides still need GM review.
- SW5e/D&D5e enforces one native archetype/subclass item per class. Extra Gestalt + Dichotomous archetypes are tracked as SWVR feature references imported through the Progression window, not as additional native subclass items. Feature grants from those references still require GM review.
- Force Alignment depends on Foundry item provenance. SW5e/D&D5e spell items do not always preserve whether a known power came from class progression, a feat, species trait, equipment, or another source. The automation requires a detected class/subclass Forcecasting source on the actor and filters obvious non-class sources when the item source metadata exposes them, but ambiguous powers may need GM correction through the manual adjustment/deed log.
- Elevation's advantage/disadvantage escalation remains intentionally GM-adjudicated. AC is implemented relationally by adjusting an incoming attack rather than permanently changing the higher actor's AC. Dexterity-save automation requires a resolvable controlling token; saves rolled outside an originating activity chat message require the saving user to target exactly one other token as the effect controller. Token cover statuses are treated as cover from the opposing creature because Foundry does not encode directional cover.
