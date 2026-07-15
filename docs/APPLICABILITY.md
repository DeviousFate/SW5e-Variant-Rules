# SW5e Variant Rules Applicability

Source reviewed: https://sw5e.com/rules/variantRules via the live `https://sw5eapi.azurewebsites.net/api/VariantRule` data.

## Automated

- Wounds: actor HP drops to 0 trigger the Constitution save, wounded-level flags, escalating/resetting DC, death-save failures, and clearing wounds at full HP.
- Strenuous Combat: deleting/ending a combat triggers Constitution saves for surviving combatants against DC 10 plus completed rounds and applies exhaustion on failure.
- Tactical Initiative: GMs can select multiple combatant tokens and use the combat tracker button to set the group to the lowest initiative.
- Hunted: Force power casts increase the casting user's Disturbance Point pool by the Force power level. At-wills add 0. Tech powers are ignored. The log records detected class, feat, and other Force-power sources from the actor's owned items.
- Milestone Leveling: enabling the rule sets D&D5e `levelingMode` to `noxp`; disabling it sets the mode to `xp`.
- Force Alignment: class-sourced light and dark Force power casts of 1st level or higher move the actor on a -100 to +100 alignment scale. First unique class-sourced cast grants points equal to power level; later casts of the same power grant 1 point. At-wills, universal powers, tech powers, and detectable non-class sources are ignored. The SWVR Actor Sheet panel shows the scale, GM adjustments, minor trait save prompts, and a deed/action log.
- Crueler Criticals: enabling the rule turns on D&D5e `criticalDamageMaxDice`, which makes critical hits maximize one set of damage dice and roll the additional critical dice. Disabling the rule turns the setting off.
- ASI and a Feat: enabling the rule turns on SW5e `allowFeatsAndASI`; disabling it turns the setting off. SW5e marks this as reload-required.
- Simplified Forcecasting: enabling the rule turns on SW5e `simplifiedForcecasting`; disabling it turns the setting off. SW5e marks this as reload-required.
- Elevation: ranged attack rolls against one targeted token receive the SW5e dominance attack bonus when the attacker is sufficiently higher and horizontally distant. Target cover statuses reduce the dominance level unless the attacking actor has a detected Sharpshooter Mastery-style feat. The bonus is labeled in the attack formula and stored on the chat message flags for inspection.

## Reminder Only

- Bonus Action Consumables: item workflows differ, so the module reminds the GM when a consumable is used.
- Careful Checks: the module reminds the GM on ability checks.
- Saving Throw Checks: the module reminds the GM on ability checks.

## Manual or Not Mechanically Applicable

The remaining variant rules either change character advancement data, item compendium data, campaign structure, narrative state, or core roll workflows too deeply to safely enforce from a small world module. They are still present in the GM configuration panel so the table can enable, document, and review them.

## Known Limits

- Force Alignment depends on Foundry item provenance. SW5e/D&D5e spell items do not always preserve whether a known power came from class progression, a feat, species trait, equipment, or another source. The automation requires a detected class/subclass Forcecasting source on the actor and filters obvious non-class sources when the item source metadata exposes them, but ambiguous powers may need GM correction through the manual adjustment/deed log.
- Elevation currently automates the ranged attack-roll bonus only. The advantage/disadvantage escalation section is intentionally left to GM adjudication, and the AC/Dexterity-save portions are not applied because the requested implementation is attack-roll scoped.
