# OOTDay AI Frontend Generation Prompt

## Master Prompt for AI-Powered Fashion Assistant MVP

Copy and paste the following prompt into your preferred AI frontend generation tool (v0, Lovable, Cursor, etc.):

```
=== BEGIN PROMPT ===

## HIGH-LEVEL GOAL
Create a mobile-first, AI-powered fashion assistant web application called "OOTDay" that helps users discover personalized outfits through natural language chat, connects them to Central Group's retail inventory, and provides seamless purchase paths for both online and in-store shopping experiences.

## PROJECT CONTEXT
- **Purpose**: Fashion discovery platform solving "What should I wear today?" with AI-powered recommendations
- **Tech Stack**: Next.js 14+, TypeScript, Tailwind CSS, Vercel hosting, Azure backend integration
- **Design Style**: Modern, playful yet professional, fashion-forward with Central Group brand alignment
- **Color Palette**: Primary: Fashion-forward neutrals (black, white, gray), Accent: Central Group brand colors, Supporting: Soft pastels for categories
- **Typography**: Clean sans-serif (Inter or similar) for UI, elegant serif for fashion content
- **Target Users**: Fashion-curious youth (15-28), busy professionals (25-45), mobile-first shoppers

## DETAILED STEP-BY-STEP INSTRUCTIONS

### 1. Create the Main Chat Interface Component
Build a conversational AI chat interface with these specific features:

1. Create file: `components/chat/ChatInterface.tsx`
2. Implement a mobile-first chat bubble design similar to WhatsApp/Messenger
3. Add a floating input bar at the bottom with:
   - Text input field with placeholder "Ask me what to wear..."
   - Camera icon button for future photo upload (disabled for MVP)
   - Send button with animated state changes
4. Display chat messages with:
   - User messages aligned right with light background
   - AI assistant messages aligned left with brand-colored background
   - Typing indicator animation when AI is processing
   - Timestamp for each message group
5. Add quick action buttons above the input:
   - "Today's Outfit"
   - "Special Occasion"
   - "Work Look"
   - "Casual Weekend"
6. Include conversation starters on first load:
   - "What should I wear to a business meeting?"
   - "Show me trendy casual outfits"
   - "I need a dinner date look"

### 2. Build the Outfit Results Component
Create a product showcase component for AI-recommended outfits:

1. Create file: `components/outfit/OutfitCard.tsx`
2. Design a card-based layout showing:
   - Hero image of the complete outfit (AI-generated or stock)
   - Individual product items in a horizontal scroll
   - Price range indicator
   - "Shop this look" CTA button
3. Each product item must display:
   - Product image (150x150 minimum)
   - Brand name
   - Product name
   - Price in THB (฿)
   - Availability indicator (In Stock/Low Stock/Out of Stock)
   - Quick "Add to Cart" button
4. Implement swipe gestures for mobile:
   - Swipe left to see next outfit option
   - Swipe right to go back
   - Pull down to refresh recommendations

### 3. Create the Product Detail Modal
Build a modal/drawer for individual product details:

1. Create file: `components/product/ProductModal.tsx`
2. Design a full-screen modal on mobile, centered modal on desktop
3. Include these sections:
   - Image carousel with pinch-to-zoom
   - Product title, brand, and price
   - Size selector (S, M, L, XL, XXL)
   - Color variants (if available)
   - "Find in Store" button with store locator
   - "Buy Online" button
   - Product description accordion
   - Related items carousel at bottom
4. Add smooth animations:
   - Slide up from bottom on mobile
   - Fade in with scale on desktop
   - Smooth close with swipe down gesture

### 4. Implement the Home Screen Layout
Create the main application shell:

1. Create/modify file: `app/page.tsx`
2. Structure the layout:
   - Sticky header with OOTDay logo and menu icon
   - Main chat area (70% of viewport height)
   - Bottom navigation with icons:
     - Chat (active)
     - Saved Looks
     - Profile
     - Store Locator
3. Add these responsive breakpoints:
   - Mobile: < 640px (single column, full width)
   - Tablet: 640px - 1024px (chat centered, max-width 600px)
   - Desktop: > 1024px (chat on left, results on right split view)

### 5. Create Loading and Empty States
Design engaging states for better UX:

1. Create file: `components/ui/LoadingStates.tsx`
2. Build these states:
   - Initial loading: Animated fashion icons or outfit sketches
   - AI thinking: Pulsing dots with fashion-related loading messages
   - No results: Friendly illustration with "Let's try something else!" message
   - Error state: Apologetic message with retry button
3. Add micro-animations using Framer Motion or CSS animations

## CODE EXAMPLES, DATA STRUCTURES & CONSTRAINTS

### API Contract Structure:
```typescript
// Request to AI Backend
interface OutfitRequest {
  query: string;
  userId?: string;
  context?: {
    occasion?: string;
    weather?: string;
    preferences?: string[];
  };
}

// Response from Backend
interface OutfitResponse {
  outfits: Outfit[];
  conversationId: string;
  suggestions: string[];
}

interface Outfit {
  id: string;
  title: string;
  description: string;
  totalPrice: number;
  items: Product[];
  imageUrl?: string;
}

interface Product {
  sku: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  storeLocations?: string[];
  onlineUrl?: string;
}
```

### Styling Guidelines:
- Use Tailwind CSS exclusively for styling
- Mobile-first approach: Start with mobile styles, add responsive modifiers
- Follow Central Group's brand guidelines where applicable
- Ensure WCAG AA accessibility standards
- Support both light and dark modes (prepare structure, light mode default for MVP)

### Technical Constraints:
- DO NOT use any external UI libraries except Tailwind CSS
- DO NOT implement actual API calls (use mock data for now)
- DO NOT add authentication/login for MVP
- DO NOT create admin panels or dashboards
- ONLY create user-facing components
- Ensure all components are TypeScript strict mode compatible
- Use React Server Components where appropriate
- Implement proper error boundaries

## STRICT SCOPE DEFINITION

You should ONLY create these files:
- `/components/chat/ChatInterface.tsx`
- `/components/outfit/OutfitCard.tsx`
- `/components/product/ProductModal.tsx`
- `/components/ui/LoadingStates.tsx`
- `/app/page.tsx`
- `/app/layout.tsx` (modify if exists)
- `/lib/types.ts` (for TypeScript interfaces)
- `/lib/mock-data.ts` (for demo data)

DO NOT create or modify:
- Any backend/API files
- Authentication components
- Admin interfaces
- Database schemas
- Deployment configurations
- Test files (for initial generation)

Start with the mobile experience and ensure it's perfect before considering desktop layouts. The app should feel native-like on mobile devices with smooth animations and intuitive gestures.

=== END PROMPT ===
```

## How to Use This Prompt

### With v0 (Recommended for Component-by-Component):
1. Start with individual components by extracting relevant sections
2. First generate the ChatInterface, then OutfitCard, then combine
3. Iterate on each component based on the results

### With Lovable.ai:
1. Paste the entire prompt to generate the full application structure
2. Review and refine each component
3. Add Central Group branding elements

### With Cursor:
1. Use the prompt with Cursor's AI composer
2. Generate files one by one for better control
3. Use Cursor's chat to refine specific components

## Important Notes

- **This prompt generates the UI structure only** - Backend integration will require separate implementation
- **All generated code requires review** - AI-generated code needs human validation for production use
- **Mock data is included** - Replace with actual Central Group API endpoints
- **Mobile-first is crucial** - Your target users are primarily mobile users
- **Iterate and refine** - Use this as a starting point and refine based on user testing

## Next Steps After Generation

1. Review all generated components for brand alignment
2. Replace mock data with actual API integrations
3. Add proper error handling and loading states
4. Implement analytics tracking
5. Conduct accessibility audit
6. Test on actual mobile devices
7. Add PWA capabilities for app-like experience