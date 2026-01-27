# Chore: Fix red border frame to fit the Women's Fashion image

## Metadata
adw_id: `cf7fd1ae`
prompt: `Fix red border frame to fit the Women's Fashion image. In apps/web/components/onboarding/OnboardingDepartment.tsx: The border container is wider than the image. Change the container div (line 43) from 'relative rounded-2xl overflow-hidden border-4 border-[var(--onboarding-primary)] cursor-pointer' to 'relative rounded-2xl overflow-hidden border-4 border-[var(--onboarding-primary)] cursor-pointer inline-block'. Also wrap this container in a flex div with 'flex justify-center' to center it. The Image component should have className='block' instead of 'h-auto object-contain mx-auto' since inline-block on parent will handle sizing. This makes the border shrink-wrap around the image.`

## Chore Description
The red border frame around the Women's Fashion image in the OnboardingDepartment component is currently wider than the actual image, creating an unwanted visual gap. This occurs because the container div is using default block display, which spans the full width of its parent container.

The fix involves:
1. Adding `inline-block` to the border container div so it shrinks to fit the image width
2. Wrapping the border container in a flex container with `justify-center` to center the image
3. Updating the Image component className from `h-auto object-contain mx-auto` to `block` since the inline-block parent will handle sizing

This will make the border frame tightly wrap around the image with no extra space.

## Relevant Files
Use these files to complete the chore:

- `apps/web/components/onboarding/OnboardingDepartment.tsx` (line 43-52) - Contains the department card with the border container that needs to be modified. The border div needs `inline-block` added to its className, wrapped in a centering flex container, and the Image className needs to be simplified to `block`.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update the border container div
- Locate the border container div at line 43
- Add `inline-block` to the className to make it shrink-wrap the image: `relative rounded-2xl overflow-hidden border-4 border-[var(--onboarding-primary)] cursor-pointer inline-block`

### 2. Wrap the border container in a centering flex div
- Add a wrapper div around the border container with className `flex justify-center`
- This will center the inline-block border container horizontally

### 3. Update the Image component className
- Change the Image component className from `h-auto object-contain mx-auto` to `block`
- The `inline-block` on the parent container now handles the sizing, so the simpler `block` display is sufficient

### 4. Validate the changes
- Review the modified component to ensure proper nesting and className changes
- Verify the syntax is correct and all closing tags are properly maintained

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm build` - Ensure the TypeScript code compiles without errors
- `cd apps/web && pnpm lint` - Verify no linting issues were introduced
- Visual inspection: Run `cd apps/web && pnpm dev` and navigate to the onboarding department step to confirm the border now tightly wraps the image

## Notes
- The change is purely visual and does not affect functionality
- The `inline-block` display mode on the container makes it shrink to fit its content (the image)
- The flex wrapper with `justify-center` maintains horizontal centering of the entire card
- The Image component's `block` display works correctly with the inline-block parent
