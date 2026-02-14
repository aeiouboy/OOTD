# Dual-Reference Try-On Prompt Template

> Source of truth: `apps/web/lib/prompts/image-prompts.ts` -- `buildDualReferenceTryOnPrompt()`

## Narrative Template (example with items)

Transfer all fashion items from IMAGE 2 onto the person shown in IMAGE 1, creating a professional e-commerce fashion catalog photograph. The person's face, skin tone, hair, and body proportions from IMAGE 1 are preserved exactly. The model fills 90-95% of the vertical frame in a centred full-body standing pose. Every garment, accessory, and footwear piece visible in IMAGE 2 appears on the model with accurate colours, natural fabric draping, realistic shadows, and proper layering depth. Set against a pure white infinity cove studio backdrop with matching high-key softbox lighting and no visible floor or backdrop shadows. Items being shown: white blouse, black tailored pants, nude heels, structured tote bag (Office Chic). Portrait 3:4 format.

## Single-Reference Variant

> Source: `buildTryOnPrompt()`

A professional e-commerce fashion catalog photograph of the person from the reference image wearing white blouse, black tailored pants, nude heels (Office Chic). The model's face, skin tone, hair, and body proportions are preserved exactly from the reference. The model stands in a confident forward-facing pose with feet together, filling 90-95% of the vertical frame. The outfit drapes naturally on the body with realistic fabric behavior, accurate colours, and proper layering. Set against a pure white infinity cove studio backdrop with high-key softbox lighting and no visible floor, ground, or backdrop shadows. Clean, cutout-ready product photo quality. Portrait 3:4 format.

## Key Design Decisions

- **"Transfer" directive** -- The dual-reference prompt opens with an explicit transfer instruction ("Transfer all fashion items from IMAGE 2 onto the person shown in IMAGE 1") which Gemini responds to better than a passive description.
- **Frame fill mandate** -- "fills 90-95% of the vertical frame" prevents the common failure mode of tiny models with excessive whitespace.
- **Layering depth** -- Explicitly calls for "proper layering depth" to ensure multi-piece outfits render correctly.
- **No checklists or rejection criteria** -- The old prompt used emoji checklists and "REJECT IF MISSING" blocks; these are removed in favour of positive, narrative instructions.
- **Portrait 3:4** -- Consistent with fitting-model output for seamless compositing in the UI.
