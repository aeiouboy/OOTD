# Chore: Fix Image Generation Service Configuration

## Metadata
adw_id: `da34d783`
prompt: `Fix image generation service configuration issue. The OPENROUTER_API_KEY environment variable is missing which causes the error 'Image generation service is not configured'.`

## Chore Description
The image generation API route at `apps/web/app/api/generate-image/route.ts` requires an `OPENROUTER_API_KEY` environment variable to function. When this key is missing, the API returns a 503 error with the message "Image generation service is not configured. Please contact support."

This chore adds proper documentation and configuration structure for the `OPENROUTER_API_KEY`:
1. Document the environment variable in `.env.sample` at the project root
2. Improve the error message in the API route to be more user-friendly in Thai
3. Verify Next.js configuration (no changes needed as server-side env vars work by default)

## Relevant Files
Use these files to complete the chore:

- **`.env.sample`** - Root environment sample file. Currently only documents `ANTHROPIC_API_KEY`, `CLAUDE_CODE_PATH`, and `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR`. Needs `OPENROUTER_API_KEY` added.
- **`apps/web/app/api/generate-image/route.ts`** - The API route that reads `process.env.OPENROUTER_API_KEY` at line 192. The error message at lines 198-199 should be updated to be more user-friendly in Thai.
- **`apps/web/next.config.mjs`** - Next.js configuration file. No changes needed as server-side environment variables are automatically available without explicit configuration.

### Files Verified - No Changes Needed
- **`apps/web/.env*`** - Does not exist. The project uses a single `.env.sample` at the root level.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Root .env.sample
- Add `OPENROUTER_API_KEY` with a documentation comment explaining its purpose
- Place it after the Anthropic configuration section
- Include a comment noting it's required for the AI image generation feature

### 2. Update Error Message in API Route
- Modify the error message at `apps/web/app/api/generate-image/route.ts:199`
- Change from: `'Image generation service is not configured. Please contact support.'`
- Change to: `'ขออภัยค่ะ ระบบสร้างภาพยังไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่ภายหลังนะคะ'`
- This provides a user-friendly Thai message: "Sorry, the image generation system is not available at this time. Please try again later."

### 3. Validate Configuration
- Verify the `.env.sample` file includes the new variable with proper documentation
- Verify the API route error message is updated
- Run linting to ensure no syntax errors were introduced

## Validation Commands
Execute these commands to validate the chore is complete:

- `cat .env.sample | grep -A1 OPENROUTER` - Verify OPENROUTER_API_KEY is documented in .env.sample
- `grep -n "ระบบสร้างภาพ" apps/web/app/api/generate-image/route.ts` - Verify Thai error message is present
- `cd apps/web && pnpm lint` - Run linting to ensure no errors were introduced

## Notes
- The actual `OPENROUTER_API_KEY` value must be obtained by the user from OpenRouter and added to their local `.env` file
- Server-side environment variables in Next.js are automatically available via `process.env` without needing to be explicitly configured in `next.config.mjs`
- The `apps/web/` directory does not have its own `.env.example` file - all environment configuration is centralized at the project root
- OpenRouter is used to access the Gemini 2.5 Flash Preview model for outfit image generation
