# Chore: Create System Prompt v4 for Conversation-Aligned Chat Response

## Metadata
adw_id: `new`
prompt: `system`

## Chore Description
Create a new System Prompt v4 that aligns with the expected conversation flow analyzed from the conversation screenshots at `data/personas/expected_result/conversasion/`. The new prompt should implement:

1. **Direct Recommendation Flow** - AI provides 2 looks immediately without clarifying questions when sufficient context exists
2. **Look Presentation Format** - Each look has style name, Thai description, and flat-lay visual card
3. **Product List (ดูลุค / Shop this look)** - Dynamic product list matching outfit items with "Buy Now" buttons and find similar items
4. **Thai Bestie Personality** - Natural, casual communication style
5. **Post-Recommendation Follow-ups** - Handle "show more", "other colors", "lower budget" requests
6. **Keep Current Outfit Card Design** - Flat-lay image + ดูลุค/ลองใส่ buttons (already separate)

### Key Differences from v3.3:
- **Skip clarifying questions** when user provides enough context (work + occasion)
- **Always 2 looks minimum** with distinct style names
- **Keep current outfit card design** - Flat-lay + ดูลุค/ลองใส่ buttons (already separate)
- **Product list (Shop this look)** - Keep current format
- **Find Similar feature** for product alternatives

## Relevant Files
Use these files to complete the chore:

### Existing System Prompt Files
- `apps/web/lib/prompts/system-prompt-v2.ts` - Current production prompt (v2.5.0), reference for Thai personality
- `apps/web/lib/prompts/system-prompt-v3.ts` - State machine version (v3.3.0), reference for mode enforcement
- `apps/web/lib/prompts/oot-persona.ts` - OOT personality definitions, phrases, and dynamics
- `apps/web/lib/prompts/prompt-version.ts` - Version management for system prompts
- `apps/web/lib/prompts/system-prompt-loader.ts` - Loader to switch between prompt versions

### Reference Files
- `data/personas/expected_result/conversasion/*.png` - Expected conversation screenshots (analyzed)
- `data/personas/Persona.md` - OOT persona definition source
- `apps/web/lib/services/ai-chat-service.ts` - Where system prompt is imported and used (line 36)

### New Files
- `apps/web/lib/prompts/system-prompt-v4.ts` - New system prompt implementing conversation-aligned behavior

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create System Prompt v4 File Structure
- Create `apps/web/lib/prompts/system-prompt-v4.ts`
- Set up version metadata: `v4.0.0`
- Document base: `DialogTemplate14-2.md + Persona.md + Conversation Screenshots Analysis`

### 2. Define Conversation Flow Decision Logic
- Implement **Context Sufficiency Check** that determines if user provided enough info
- Define rules for when to skip clarifications:
  - User mentions occasion (งานบวช, ทำงาน, เที่ยว) → sufficient context
  - User mentions gender + occasion → definitely sufficient
  - User provides vague request ("หาชุด") → may need 1 clarification max
- Add **1 clarification maximum** rule (reduced from 2 in v3)

### 3. Implement Look Presentation Format
- Define **LOOKs section** structure:
  ```
  • **Look 1: [Style Name]** (e.g., OVERFIT Layer Look)
    [Thai style description - engaging vibe description]
    - [Product 1] - [Brand] ราคา [Price] บาท 🔗 [link]
    - [Product 2] - [Brand] ราคา [Price] บาท 🔗 [link]
    💡 [Styling tip]
    **Total: ฿[Sum]**
  ```
- Require **minimum 2 looks** per response
- Require **style name in header** for each look
- Each look links to **flat-lay visual** via "ดูลุค" button (NOT model photo)

### 4. Define Product List Behavior (ดูลุค / Shop this look)
- **Current implementation** - Keep existing "Shop this look" list format
- Header: "Shop this look (X items)" with item count
- Subtitle: "Products featured in the outfit above"
- **Dynamic product count** - List shows items from the recommended look
- Define product row format:
  - Product image (thumbnail)
  - Product name
  - Brand name
  - Price in Thai Baht (฿X,XXX)
  - "Buy Now" button
- Products listed vertically in card rows
- Add **"Find Similar"** functionality for alternatives (optional enhancement)

### 5. Implement Find Similar Feature
- When user clicks "Find Similar" on a product, AI should:
  - Search for 2-3 alternative products
  - Present alternatives inline below the original
  - Include price comparison
  - Keep same product category

### 6. Enhance Thai Bestie Communication
- Import and integrate OOT persona phrases from `oot-persona.ts`
- Define response style:
  - Stock excitement intro phrases
  - Casual Thai particles (นะ, จ้า, เนอะ)
  - Friend-speak shortcuts (ป่าว, มั้ย, 555)
  - Thai-English code-switching patterns
- Add example good/bad responses

### 7. Define Post-Recommendation Follow-ups
- Handle follow-up requests without clarifications:
  - "ขอดูอีก" / "มีอื่นมั้ย" → Show 2 more looks
  - "สีอื่น" / "เปลี่ยนสี" → Same styles, different colors
  - "งบน้อยกว่า" / "ถูกกว่า" → Lower-priced alternatives
  - "กีสีอะไรถูก" → List available colors
- Maintain **POST-RECOMMENDATION LOCKOUT** - never ask clarifications after showing products

### 8. Keep Current Outfit Card Design (Flat-Lay + Action Buttons)
- **Keep existing outfit card layout**:
  - Flat-lay image (products arranged on white background)
  - Style name in Thai (e.g., "ทำงานแบบมืออาชีพ")
  - Total price (e.g., ฿1,940)
  - Action buttons row: 👁 ดูลุค | 👗 ลองใส่ | ❤️ | 🔗
- **ดูลุค button** → Opens product list (Shop this look)
- **ลองใส่ button** → Opens virtual try-on with model
- These are **already separate features** in current UI - keep as-is

### 9. Add Style Categories
- Define style categories for look naming:
  - OVERFIT / Layer styles
  - Feminine / Basic Mix
  - Smart Casual Modern
  - Minimal Clean
  - Vintage Layer Office
  - Classic / Timeless
- Link styles to user preferences when available

### 10. Update Prompt Version Manager
- Add v4 to `prompt-version.ts` version enum
- Update `system-prompt-loader.ts` to support v4
- Document v4 features in metadata

### 11. Validate Implementation
- Run TypeScript compilation check
- Verify prompt exports correctly
- Test prompt length and structure
- Compare against expected conversation flow

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm tsc --noEmit` - Verify TypeScript compilation
- `cd apps/web && pnpm lint` - Run ESLint on new files
- `grep -n "SYSTEM_PROMPT_V4" apps/web/lib/prompts/*.ts` - Verify v4 is exported
- `wc -l apps/web/lib/prompts/system-prompt-v4.ts` - Check file length (should be 800-1200 lines)

## Notes

### Key Insights from Conversation Screenshots Analysis:

1. **Screenshot 1 (Desktop - 1.1)**: User asks for work+evening look → AI provides 2 looks immediately with OVERFIT and Feminine styles, flat-lay visual cards

2. **Screenshot 2-3 (Desktop - 2.1, 3)**: Product list (ดูลุค / Shop this look) shows outfit items:
   - Current implementation: "Shop this look (X items)" header
   - Product rows with: image, name, brand, price, "Buy Now" button
   - Dynamic product count based on outfit items
   - Find Similar can expand inline showing alternatives (optional)

3. **Screenshot 4 (Desktop - 4)**: Follow-up conversation:
   - User asks for more → AI provides new Look 1 & Look 2
   - User asks about colors → AI responds with options
   - User compliments → AI responds warmly with personalized styling

4. **Screenshot 5 (Desktop - 5)**: Style refinement:
   - AI identifies style preferences: Feminine, Classic, Timeless
   - Shows 2 new looks with flat-lay visuals
   - Model photos are separate "ลองใส่" feature

5. **Screenshot 6 (Desktop - 6)**: Different product set for alternative look

### Visual Features Clarification (Keep Current Design):
**Outfit Card Layout:**
```
┌─────────────────────────────────────┐
│      [Flat-lay Image]               │
│  (Products arranged on white bg)    │
├─────────────────────────────────────┤
│  ทำงานแบบมืออาชีพ                    │
│  ฿1,940                             │
├─────────────────────────────────────┤
│  👁 ดูลุค | 👗 ลองใส่ | ❤️ | 🔗     │
└─────────────────────────────────────┘
```
- **ดูลุค**: Opens product list (Shop this look) with item rows
- **ลองใส่**: Opens virtual try-on with model wearing outfit
- These are **already separate** in current UI - keep as-is

### Critical Behavioral Changes from v3:
- **Reduced clarifications**: Max 1 question (v3 had max 2)
- **Context sufficiency**: More aggressive in recognizing sufficient context
- **Always 2 looks**: Never provide single recommendations
- **Keep current UI**: Outfit card with flat-lay + ดูลุค/ลองใส่ buttons (already separate)
- **Product list (Shop this look)**: Keep current format
- **Find Similar**: For product alternatives
