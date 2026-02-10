# Fitting Model Image Generation Prompt Template

> Source of truth: `apps/web/lib/prompts/image-prompts.ts` -- `buildFittingModelPrompt()`

## Narrative Template (with reference photo)

A professional e-commerce fashion catalog photograph of a person matching the reference image exactly. The model stands in a symmetrical forward-facing pose with arms relaxed at sides and feet together, wearing a white spaghetti strap crop top paired with black high-waisted legging shorts, barefoot. The face, skin tone, hair, and body proportions are a precise match to the reference photo with no idealization or modification. The setting is a pure white infinity cove studio backdrop with bright, high-key front-facing softbox lighting that creates a clean, cutout-ready image with no visible floor, ground, or shadows on the backdrop. Professional product photography standard with sharp detail and accurate skin tone reproduction. Portrait 3:4 format.

## Mystery Model Variant (no reference photo)

> Source: `buildMysteryModelPrompt()`

A professional e-commerce fashion catalog photograph of a young Thai woman with warm brown eyes, soft natural makeup, and shoulder-length straight black hair. She stands in a symmetrical forward-facing pose with arms relaxed at sides and feet together, wearing a white spaghetti strap crop top paired with black high-waisted legging shorts, barefoot. Her expression is friendly and confident with a natural, approachable beauty. The setting is a pure white infinity cove studio backdrop with bright, high-key front-facing softbox lighting that creates a clean, cutout-ready image with no visible floor, ground, or shadows on the backdrop. Professional product photography standard with sharp detail and accurate skin tone reproduction. Portrait 3:4 format.

## Key Design Decisions

- **Narrative paragraph** -- Single flowing description, no keyword lists or checklists.
- **Positive framing only** -- "no idealization or modification" is the only boundary, phrased as an attribute rather than a prohibition.
- **Standard outfit** -- White crop top + black shorts + barefoot is the canonical fitting-model base outfit.
- **Infinity cove backdrop** -- Ensures a clean, cutout-ready image for virtual try-on compositing.
- **Portrait 3:4** -- Optimised for full-body vertical framing.
