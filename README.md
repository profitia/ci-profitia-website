# CIC Lab for the Profitia website

> **Status: laboratory and migration workspace.** This repository is not the
> production source of truth for the Profitia website or for shared
> Conversational Intelligence behavior.

This application remains available for experiments, integration prototypes and
comparison during the CIC migration. It must not become a third production chat
runtime.

## Sources of truth

- Production website and its consumer-specific UI, routes and deployment:
  [`profitia/profitia.pl`](https://github.com/profitia/profitia.pl)
- Shared conversation contracts, procurement intelligence, destination policy
  and reference journeys:
  [`profitia/conversational-intelligence-core`](https://github.com/profitia/conversational-intelligence-core)
- This repository: controlled lab only.

New reusable behavior belongs in a versioned CIC package. Profitia-specific
presentation and URL resolution belong in `profitia.pl`. Do not copy shared
engines from this lab into either repository.

## Allowed use

- prototype an idea before it is accepted into CIC;
- reproduce or compare historical behavior;
- run non-production integration experiments;
- provide migration evidence while remaining local and reversible.

## Not allowed

- treating this repository as the canonical implementation of chat behavior;
- deploying changes from here as the Profitia production website;
- adding another copy of logic already supplied by CIC packages;
- storing production secrets or user data.

The existing Render blueprint is retained only to keep the lab reproducible. It
does not authorize a deployment and does not replace the active Render service
owned by `profitia.pl`.
