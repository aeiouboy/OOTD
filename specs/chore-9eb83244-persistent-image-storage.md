# Chore: Add Persistent Image Storage for LooksInspiration Generated Images

## Metadata
adw_id: `9eb83244`
prompt: `Add persistent image storage for LooksInspiration generated images. Save generated outfit images to frontend/public/generated-images/ folder with timestamp-based filenames. Update frontend/app/api/generate-image/route.ts to: 1) Create the generated-images directory if it doesn't exist, 2) Save the base64 image to disk as PNG file after successful generation, 3) Return both imageBase64 and imageUrl (public path) in the response. Also add a .gitignore entry for frontend/public/generated-images/*.png to avoid committing generated images.`

## Chore Description

Currently, LooksInspiration generated images are only returned as base64-encoded strings in the API response. This chore adds persistent storage by saving generated outfit images to the filesystem, making them accessible via static URLs. This improves performance (no need to re-encode large base64 strings) and enables caching, sharing, and future reference to generated images.

The implementation will:
1. Create a dedicated directory `frontend/public/generated-images/` for storing generated images
2. Save each generated image as a PNG file with a timestamp-based filename
3. Update the API route to handle filesystem operations (directory creation, file writing)
4. Return both the base64 data (for immediate display) and the public URL (for future reference)
5. Add gitignore rules to prevent committing generated images to version control

## Relevant Files

**Existing Files:**

- `frontend/app/api/generate-image/route.ts` (lines 1-272) - POST handler that generates images using OpenRouter API. Needs to be updated to save images to disk after successful generation and return both imageBase64 and imageUrl.

- `frontend/lib/services/image-generation-service.ts` (lines 180-193) - OpenRouterImageClient that returns ImageGenerationResponse. The response type already supports both imageBase64 and imageUrl fields, so no changes needed to the service layer.

- `frontend/components/chat/LooksInspiration.tsx` (lines 26-35, 39-40) - Component that displays generated images. Already supports both imageUrl and imageBase64 props, with preference for imageUrl over base64. No changes needed.

- `frontend/.gitignore` - Needs new entry for generated images.

### New Files

- `frontend/public/generated-images/.gitkeep` - Keep the directory in version control while ignoring its contents.

## Step by Step Tasks

### 1. Add Filesystem Utilities to API Route
- Import Node.js `fs` and `path` modules at the top of `route.ts`
- Add utility function `ensureDirectoryExists(dirPath: string)` to create directory if it doesn't exist
- Add utility function `saveBase64Image(base64Data: string, filename: string)` to write base64 image to disk as PNG
- Add utility function `generateImageFilename()` to create timestamp-based filename (e.g., `outfit-1732800000000.png`)

### 2. Create Generated Images Directory
- Create the `frontend/public/generated-images/` directory if it doesn't already exist
- Add a `.gitkeep` file to ensure the directory is tracked in git

### 3. Update Image Generation POST Handler
- After successful image generation (line 203, within the `if (result.success)` block):
  - Check if `result.imageBase64` exists
  - Generate a unique filename using timestamp
  - Ensure the `generated-images` directory exists
  - Save the base64 image to disk using the utility function
  - Construct the public URL path (e.g., `/generated-images/outfit-1732800000000.png`)
  - Add the `imageUrl` field to the result object before returning
- Handle potential filesystem errors gracefully (log error but still return base64 if save fails)

### 4. Update .gitignore
- Add entry `frontend/public/generated-images/*.png` to `frontend/.gitignore` to prevent committing generated images
- Ensure `.gitkeep` is not ignored (use `!frontend/public/generated-images/.gitkeep` if needed)

### 5. Update Response Type Documentation
- Update the JSDoc comment for the POST handler (lines 92-99) to reflect that `imageUrl` is now always returned on success
- Document the public URL format in the response documentation

## Validation Commands

Execute these commands to validate the chore is complete:

- `ls -la /Users/naruechon/Documents/Project/OOTDay_Anti/frontend/public/generated-images/` - Verify directory exists with .gitkeep file
- `cat /Users/naruechon/Documents/Project/OOTDay_Anti/frontend/.gitignore | grep "generated-images"` - Verify gitignore entry exists
- `grep -n "import.*fs" /Users/naruechon/Documents/Project/OOTDay_Anti/frontend/app/api/generate-image/route.ts` - Verify filesystem imports added
- `grep -n "imageUrl" /Users/naruechon/Documents/Project/OOTDay_Anti/frontend/app/api/generate-image/route.ts` - Verify imageUrl is being set in response
- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && pnpm build` - Verify TypeScript compilation succeeds
- Manual test: Generate an image through the API and verify:
  - Response includes both `imageBase64` and `imageUrl` fields
  - Image file is saved to `public/generated-images/` with timestamp filename
  - Image is accessible via the public URL (e.g., `http://localhost:3000/generated-images/outfit-*.png`)
  - Component displays the image correctly using the imageUrl

## Notes

- The timestamp-based filename format should be: `outfit-{timestamp}.png` (e.g., `outfit-1732800000000.png`)
- Use `Date.now()` for timestamp generation to ensure uniqueness
- The base64 data string format is typically `data:image/png;base64,{data}` - need to strip the prefix before saving
- Consider adding error handling for disk space issues, though this is unlikely in practice
- Future enhancement: Add cleanup job to delete old generated images after a certain period (not part of this chore)
- The public URL should be relative (e.g., `/generated-images/filename.png`) not absolute, so it works in all environments
