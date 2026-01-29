# Chore: Fix Women's Fashion Image Visual Size

## Metadata
adw_id: `a19fbbe6`
prompt: `Fix Women's Fashion image visual size. In apps/web/components/onboarding/OnboardingDepartment.tsx: The image still fills the container due to 'w-full' class. Change className from 'w-full h-auto object-contain' to just 'h-auto object-contain' to respect the width={260} height={348} dimensions. Also add 'mx-auto' to center the image in the container. The Image component should have className='h-auto object-contain mx-auto' to display at 260px width centered in the card.`

## Chore Description
The Women's Fashion image in the OnboardingDepartment component is currently filling the full width of its container due to the `w-full` Tailwind CSS class. This causes the image to stretch beyond its intended 260px width. The fix involves removing the `w-full` class and adding `mx-auto` to center the image, allowing it to display at its natural 260px width as specified in the Next.js Image component props.

## Relevant Files

- **apps/web/components/onboarding/OnboardingDepartment.tsx** (Line 51) - Contains the Image component that needs className adjustment. Currently has `className="w-full h-auto object-contain"` which needs to be changed to `className="h-auto object-contain mx-auto"`.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Image className
- Open `apps/web/components/onboarding/OnboardingDepartment.tsx`
- Locate the Image component on line 51
- Change the className from `"w-full h-auto object-contain"` to `"h-auto object-contain mx-auto"`
- Verify the width and height props remain `width={260}` and `height={348}`

### 2. Validate the Change
- Run the development server to visually confirm the image displays at 260px width
- Verify the image is centered within its container
- Ensure the image maintains proper aspect ratio with `object-contain`
- Confirm the border and selected badge still display correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm dev` - Start development server and visually verify the image displays at 260px width and is centered
- `cd apps/web && pnpm build` - Ensure the build completes successfully with no errors
- `cd apps/web && pnpm lint` - Run linting to ensure code quality standards are met

## Notes
- The `w-full` class forces the image to fill 100% of its container width, overriding the Next.js Image component's width prop
- Removing `w-full` allows the image to respect its intrinsic width (260px)
- Adding `mx-auto` (margin-left: auto; margin-right: auto) centers the image horizontally within its container
- The `h-auto` class ensures the height scales proportionally
- The `object-contain` class ensures the image fits within its dimensions without cropping
