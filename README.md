# SW5e Variant Rules

A Foundry VTT module for enabling, tracking, and automating selected [SW5e Variant Rules](https://sw5e.com/rules/variantRules) in SW5e games.

This module is intended for GMs who want table-level control over variant rule options while automating rules that can be handled reliably in Foundry.

## Compatibility

- Foundry VTT: v13 minimum
- D&D5e System: 5.2.5 minimum
- Required module: SW5e module 1.3.8 minimum
- Optional integration: Midi-QOL v13

When Midi-QOL is active, the SWVR configuration window displays a compatibility report. Each active conflict lets the GM choose SWVR or Midi-QOL as the provider. Choosing SWVR backs up and disables only the competing Midi setting; choosing Midi-QOL disables the corresponding SWVR rule and restores its backed-up Midi values. SWVR does not silently change either configuration.

## Installation

Use this manifest URL in Foundry's **Install Module** dialog:

```text
https://github.com/DeviousFate/SW5e-Variant-Rules/releases/latest/download/module.json
```

## Current Automation

- **Wounds**: Tracks wounded levels, escalating save DCs, and death save failures.
- **Alternative Armor**: Displays calculated Alternative AC/DR on the SWVR Actor Sheet, adjusts single-target attack rolls to resolve against Alternative AC, and applies passive DR to tagged attack-activity damage.
- **Strenuous Combat**: Rolls post-combat Constitution saves for exhaustion.
- **Tactical Initiative**: Allows selected combatants to share the lowest initiative.
- **Hunted**: Tracks persistent user-based Force power disturbance pools, resolves d100 Hunted checks at combat end, reduces pools by character level on long rests, and displays GM-only pool and escalation logs.
- **Milestone Leveling**: Syncs D&D5e leveling mode between XP and no-XP advancement.
- **Force Alignment**: Tracks class-sourced light/dark Force power use, tier thresholds, GM adjustments, traits, and deed logs.
- **Crueler Criticals**: Syncs D&D5e critical max dice behavior.
- **ASI and a Feat**: Syncs the SW5e module's ASI and Feat setting.
- **Simplified Forcecasting**: Syncs the SW5e module's Simplified Forcecasting setting.
- **Elevation**: Applies relational attack, AC, and Dexterity-save adjustments from dominance, superdominance, and hyperdominance.
- **Dismemberment**: Detects critical hits with lightweapons and vibroweapons, accounts for simple damage immunity and resistance, rolls confirmation and location dice, requests a GM eligibility ruling, and posts themed results to chat.

## Assisted Character Building

- **Gestalt and Dichotomous Characters**: Adds SWVR Actor Sheet configuration, actor scanning, hit die and XP guidance, ASI/multiclass warnings, archetype tracking, and a GM-reviewed progression notes feature.

To configure a Gestalt character, enable **Gestalt and Dichotomous Characters** and **Use SWVR Actor Sheet**, add both class items to the actor, open the sheet's **Progression** panel, set **Progression Mode** to **Gestalt**, choose the class sources for saving throws, skills, equipment, and ASI handling, then select **Save and Scan**.

Both Gestalt classes should remain real class items so Foundry can keep their class features and archetype data available. SWVR corrects prepared character level, proficiency, HP max, and hit dice so the actor uses the Gestalt level instead of the summed class levels. Use **Sync Gestalt Class Hit Dice** to persist the averaged hit-die denomination on the primary class and zero the secondary class's hit-dice contribution for rest and hit-die workflows.

For **Gestalt + Dichotomous**, set **Progression Mode** to **Gestalt + Dichotomous** and choose four total archetypes: two under each Gestalt class track. SW5e/D&D5e only allows one native archetype on a class, so add additional archetypes by dropping them onto the matching class track in the SWVR Progression window or by pasting the archetype UUID into that class track's import field.

## Reminder Support

Some rules are surfaced as GM reminders because they require table judgment:

- Bonus Action Consumables
- Careful Checks
- Saving Throw Checks

## Manual Rules

Variant rules that require narrative adjudication, character rebuilds, compendium changes, or deep workflow replacement are included in the configuration and report UI, but are not mechanically automated.

See [docs/APPLICABILITY.md](docs/APPLICABILITY.md) for the current rule-by-rule implementation notes.

## Configuration

After enabling the module in a world, open:

**Game Settings > Configure Settings > Module Settings > SW5e Variant Rules**

From there, GMs can enable or disable individual variant rules, open the applicability report, and review the Hunted log.

### Midi-QOL Compatibility

- Elevation queries Midi's configured cover provider and compensates for Midi's later token-origin attack and Dexterity-save cover processing. Template-origin cover can differ and remains subject to GM review.
- Midi workflow IDs are used to resolve the source of automated Dexterity saves and deduplicate Hunted/Force Alignment casts.
- Alternative Armor DR runs through Midi's post-calculation hook and remains idempotent when the normal D&D5e hook also fires.
- Alternative Armor automation pauses while Midi Challenge Mode Armor is active.
- The compatibility action can disable Challenge Mode Armor, custom Midi critical damage, Midi Critical Saves, and Midi's percentage-based Wounded status when the corresponding SWVR rules require ownership of those mechanics.
- Midi Active Defence can remain enabled as the mechanical provider for SWVR's otherwise manual Defense Rolls option.

## Bug Reports

Please report bugs through GitHub Issues:

https://github.com/DeviousFate/SW5e-Variant-Rules/issues

Include your Foundry version, D&D5e system version, SW5e module version, this module's version, active modules, steps to reproduce, and any console errors.

## Notes

This module is not an official SW5e product. It is a Foundry automation layer for tables using SW5e content and variant rules.

Some automations depend on Foundry item metadata. If a power, feat, or class feature does not expose enough source information, the GM may need to correct or adjudicate the result manually.
