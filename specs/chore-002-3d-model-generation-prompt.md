# Chore: Create Photorealistic 3D Model Generation Prompt

## Metadata
adw_id: `002`
prompt: `create prompt to generate photorealistic 3D digital model from [will uploaded image] that full body and wear white top, black plants and no shoes. Pose naturally with hands relaxed, confident but soft expression. Background: Smooth neutral white, soft light, and bright tones. Style: Ultra-detailed, photorealistic, fashion lookbook photography. Output: 8K resolution and save result here '/Users/naruechon/Documents/Project/OOTDay/ootday_persona/prompt_gen/model'`

## Chore Description
Create a comprehensive AI prompt template for generating photorealistic 3D digital models from user-uploaded images. The prompt should guide AI image generation models (like Kling AI, Midjourney, or DALL-E) to create full-body, photorealistic renders suitable for the OOTDay virtual try-on feature.

The generated model should:
- Be based on an uploaded source image
- Show full body in natural, relaxed pose with hands relaxed
- Wear white top and black pants with no shoes
- Have confident but soft facial expression
- Be set against smooth neutral white background with soft, bright lighting
- Follow fashion lookbook photography style
- Output at 8K resolution for high-quality virtual try-on experiences

This prompt will be saved to `/Users/naruechon/Documents/Project/OOTDay/ootday_persona/prompt_gen/model` and serve as a reusable template for the OOTDay AI fashion assistant platform.

## Relevant Files
Use these files to complete the chore:

- `/Users/naruechon/Documents/Project/OOTDay/ootday_persona/prompt_gen/model` - Existing prompt template that needs to be updated with the new specifications
- `/Users/naruechon/Documents/Project/OOTDay/docs/OOTDay PRD.MD` - Product requirements document providing context on virtual try-on feature goals
- `/Users/naruechon/Documents/Project/OOTDay/docs/architecture.md` - Technical architecture including Kling AI integration details for image generation

### New Files
No new files needed - updating existing template file.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Review Existing Prompt Template
- Read the current `/Users/naruechon/Documents/Project/OOTDay/ootday_persona/prompt_gen/model` file
- Identify elements to preserve (8K resolution, photorealistic quality, body proportions)
- Identify elements to update (pose, outfit, background, expression, lighting style)

### 2. Update Model Pose and Expression Specifications
- Change pose from "relaxed, neutral, straight-on pose" to "natural pose with hands relaxed"
- Update expression to "confident but soft expression" instead of neutral
- Keep arms positioning that allows for garment rendering
- Maintain full-body requirement for virtual try-on compatibility

### 3. Update Outfit Specifications
- Change outfit from "white spaghetti strap crop top and black high-waisted shorts" to "white top and black pants"
- Keep "no shoes" / barefoot requirement
- Ensure outfit description is generic enough to work as base layer for virtual try-on

### 4. Update Background and Lighting Specifications
- Change background from "plain, solid, neutral color (e.g., light beige, pale gray, or off-white)" to "smooth neutral white"
- Update lighting from "soft, even, professional studio lighting" to "soft light and bright tones"
- Emphasize clean, minimal aesthetic suitable for fashion lookbook photography

### 5. Update Style and Quality Specifications
- Add "Ultra-detailed" to quality descriptors
- Change style from "High-resolution 3D render, photorealistic quality" to "photorealistic, fashion lookbook photography"
- Maintain 8K resolution output requirement
- Ensure compatibility with Kling AI and other image generation services

### 6. Enhance Prompt Structure for AI Generation
- Ensure prompt uses clear, directive language for AI models
- Add specific technical parameters (resolution, style, composition)
- Keep placeholder syntax `[PLACEHOLDER]` for dynamic values
- Organize prompt in logical sections for easy parsing

### 7. Validate Prompt Template
- Verify all requirements from the chore prompt are incorporated
- Check that prompt is compatible with OOTDay's AI integration (Kling AI, Langflow)
- Ensure prompt maintains flexibility for different source images
- Confirm output location is correct: `/Users/naruechon/Documents/Project/OOTDay/ootday_persona/prompt_gen/model`

## Validation Commands
Execute these commands to validate the chore is complete:

- `cat /Users/naruechon/Documents/Project/OOTDay/ootday_persona/prompt_gen/model` - Verify the updated prompt file contents
- `wc -l /Users/naruechon/Documents/Project/OOTDay/ootday_persona/prompt_gen/model` - Confirm file is not empty and has reasonable length
- `grep -i "8K resolution" /Users/naruechon/Documents/Project/OOTDay/ootday_persona/prompt_gen/model` - Verify 8K output requirement is present
- `grep -i "white top" /Users/naruechon/Documents/Project/OOTDay/ootday_persona/prompt_gen/model` - Verify outfit specifications are correct
- `grep -i "confident but soft" /Users/naruechon/Documents/Project/OOTDay/ootday_persona/prompt_gen/model` - Verify expression specification is present

## Notes

**Integration Context:**
- This prompt template will be used with Kling AI for virtual try-on generation (see `docs/architecture.md` External APIs section)
- The generated 3D models serve as base layers for the OOTDay fashion recommendation system
- Prompt should be optimized for consistency across different user-uploaded images

**AI Model Compatibility:**
- Primarily designed for Kling AI API (`POST /tryon/generate`)
- Should also work with other image generation models (Midjourney, DALL-E, Stable Diffusion)
- Consider adding model-specific parameters in future iterations

**Future Enhancements:**
- Add variations for different poses (sitting, walking, dynamic)
- Create outfit-specific templates (formal, casual, athletic)
- Add seasonal/occasion-based lighting variations
- Implement dynamic background options for different fashion contexts

**Related Files:**
- `/Users/naruechon/Documents/Project/OOTDay/ootday_persona/prompt_gen/lookbook` - Related lookbook prompt template
- `/Users/naruechon/Documents/Project/OOTDay/ootday_persona/prompt_gen/model_outfit` - Related outfit-specific model prompt