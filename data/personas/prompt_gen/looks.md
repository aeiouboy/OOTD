# Flat-Lay Image Generation Prompt Template

> Source of truth: `apps/web/lib/prompts/image-prompts.ts` -- `buildFlatLayPrompt()`

## Narrative Template (example output for 3 items, occasion "work outfit")

A high-resolution, studio-lit flat-lay photograph showing 3 fashion items arranged as a single coordinated outfit on a pristine white surface. The items are: a navy blue dress, a black shoes, a beige bag. The composition uses balanced spacing with each piece clearly visible and proportionally sized. Photographed from directly overhead with soft, diffused three-point lighting that eliminates harsh shadows and preserves accurate colours. Professional e-commerce product photography quality with sharp focus across all items. Clean, minimal styling typical of luxury fashion editorial flat-lay. Styled for work outfit. Square 1:1 format.

## Key Design Decisions

- **Narrative paragraph style** -- Gemini 2.5 Flash responds best to flowing descriptive prose rather than keyword bullet lists.
- **Positive framing only** -- No "DO NOT" or "AVOID" instructions; the model is told what to produce, not what to avoid.
- **Generic item descriptions** -- Uses category + colour only (never product names or SKUs) to prevent the AI from rendering text labels on the image.
- **Commercial safety context** -- Phrases like "e-commerce product photography" and "fashion editorial flat-lay" anchor the output in a safe commercial domain.
- **Aspect ratio hint** -- Ends with "Square 1:1 format" to guide the output dimensions.
