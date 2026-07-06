# Mortgage Empire

> *Build your neighborhood. Own the block.*

**A Cozy Tycoon Game** — a 2D isometric management game where you guide real, memorable people (not loan numbers) through the journey of buying a home. Grow from a single desk in Old Town into a thriving multi-branch mortgage company across the Meadowbrook Region by keeping customers happy, your team healthy, and your pipeline flowing.

| | |
|---|---|
| **Genre** | Cozy 2D isometric management / tycoon |
| **Platform** | Browser (desktop-first, 1440×900 design canvas) |
| **Audience** | Casual players 16+ — no mortgage knowledge required |
| **Session length** | 10–30 minutes (one to a few in-game days) |
| **Status** | Design locked (mockup set v1, 10 screens) · implementation not started |

## The idea

A player who finishes the tutorial and a few days of play should be able to describe the home-loan journey in plain language — without ever reading jargon. Loans move through a seven-stage pipeline that mirrors the real process:

```
Lead → Application → Documents → Review → Approval → Closing → Completed 🏠
```

In-game, those stages wear friendlier names ("Hello!", "Papers", "Yes/No", "Home!"), and every document has a plain-language name — "Proof of Job" instead of employment verification, "Money in the Bank" instead of asset statements.

## Design pillars

1. **People, not paperwork.** Every loan is a character with a face, traits, and a dream home.
2. **Plain language everywhere.** "Papers," not "documentation." "Yes/No," not "underwriting decision."
3. **Cozy, never punishing.** Setbacks create gentle pressure and choices — no failure screens, no hard game over.
4. **Simplified but truthful.** The loan journey is close enough to the real process to be genuinely educational.

## Core systems

- **Pipeline** — a 7-column Kanban board of active loans across four loan types (First Home, Home Purchase, Refinance, Investment), each with its own amounts, pace, and customer temperament.
- **Customers** — personality traits, a happiness meter, a slower-moving trust level, and a Dream Home card that quietly teaches how price, down payment, and monthly payment relate.
- **Employees** — four hireable roles (Loan Officer, Processor, Reviewer, Closer) mapped to pipeline stages. More loans mean more revenue, but overworked people make mistakes and eventually quit — the core tension.
- **Random events** — positive and negative, from early document uploads to a customer buying a car right before closing. Every negative event has a clear player response; nothing silently ruins a run.
- **Upgrades** — 25 upgrades across five categories (Office, Staff Training, Marketing, Technology, Customer Experience).
- **Economy** — coins from closings and servicing, gems earned in play only (**no real-money purchases, ever**), research for tech unlocks, plus a drifting global interest rate that shifts lead volume and mix.
- **World map** — six neighborhoods in the Meadowbrook Region to scout, unlock, and open branches in.
- **Progression** — player level = career title, from Loan Officer to Mortgage Mogul, gating features as the game opens up. Day ratings, XP, badges, and an end-of-day summary close each loop.

## Look & voice

Cozy, warm, cheerful, educational. Warm sunset primaries with soft accents, never pure black, never sharp corners. Headings in Fraunces, body in Inter. Confetti bursts when a loan closes — the game's signature payoff moment.

The writing rule: *"We write like a friendly coworker. Short sentences, no jargon. Celebrate small wins. When something goes wrong, offer a next step — never blame the player."*

## Repository contents

| File | What it is |
|---|---|
| [GAME_DESIGN_DOCUMENT.md](GAME_DESIGN_DOCUMENT.md) | **Source of truth** for all gameplay, content, and UI decisions. If code and this document disagree, the document wins — or gets updated first. |
| [mortgage game design](mortgage%20game%20design) | Pencil mockup source (10 screens, 233 design tokens) covering every screen in the game, exported as JSON. |

A `TECHNICAL_DESIGN_DOCUMENT.md` (architecture — React + Phaser + TypeScript, folder structure, save format, milestone plan) is planned next.
