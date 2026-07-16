# SW5e Variant Rules

A Foundry VTT module for enabling, tracking, and automating selected [SW5e Variant Rules](https://sw5e.com/rules/variantRules) in SW5e games.

This module is intended for GMs who want table-level control over variant rule options while automating rules that can be handled reliably in Foundry.

## Compatibility

- Foundry VTT: v13 minimum
- D&D5e System: 5.2.5 minimum
- Required module: SW5e module 1.3.8 minimum

## Installation

Use this manifest URL in Foundry's **Install Module** dialog:

```text
https://raw.githubusercontent.com/DeviousFate/SW5e-Variant-Rules/main/module.json
```

## Current Automation

- **Wounds**: Tracks wounded levels, escalating save DCs, and death save failures.
- **Strenuous Combat**: Rolls post-combat Constitution saves for exhaustion.
- **Tactical Initiative**: Allows selected combatants to share the lowest initiative.
- **Hunted**: Tracks combat-only Force power disturbance pools, resolves d100 Hunted checks at combat end, and displays GM-only hunter escalation logs.
- **Milestone Leveling**: Syncs D&D5e leveling mode between XP and no-XP advancement.
- **Force Alignment**: Tracks class-sourced light/dark Force power use, tier thresholds, GM adjustments, traits, and deed logs.
- **Crueler Criticals**: Syncs D&D5e critical max dice behavior.
- **ASI and a Feat**: Syncs the SW5e module's ASI and Feat setting.
- **Simplified Forcecasting**: Syncs the SW5e module's Simplified Forcecasting setting.
- **Elevation**: Applies ranged attack-roll bonuses from dominance, superdominance, and hyperdominance.

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

## Notes

This module is not an official SW5e product. It is a Foundry automation layer for tables using SW5e content and variant rules.

Some automations depend on Foundry item metadata. If a power, feat, or class feature does not expose enough source information, the GM may need to correct or adjudicate the result manually.
