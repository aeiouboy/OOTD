# Chore: OOT Persona and Knowledge Base Integration

## Metadata
adw_id: `ecd85b98`
prompt: `Analyze the OOTDay AI chat implementation to integrate the OOT persona from /Users/naruechon/Documents/Project/OOTDay_Anti/ootday_persona/Persona.md and knowledge base from /Users/naruechon/Documents/Project/OOTDay_Anti/ootday_persona/knowledge_base. Current issues: 1) The system prompt in frontend/lib/prompts/system-prompt-v2.ts uses formal Thai language instead of the bestie personality defined in Persona.md (cheerful, talkative, observant, gentle, chill, fun to talk, friendly, caring, non-judgmental). 2) Missing Thai-English code-switching examples from persona like 'ลุคนี้ very chic เลยอ่ะ', 'ใส่สบายดีน๊า', '555'. 3) Missing personality phrases: 'ว้าว', 'เก๋มาก', 'สวยเว่อร์', 'แบบว่า...', 'อีกแล้วว'. 4) Knowledge base is not integrated into the AI chat service. 5) Chat dialog examples in /Users/naruechon/Documents/Project/OOTDay_Anti/chat_dialog show expected output format. Fix: Update system-prompt-v2.ts to incorporate full OOT persona with bestie personality, Thai-English code-switching, and integrate knowledge base summaries for fashion expertise. Ensure AI responses match the persona examples in Persona.md sections 'Tone Examples' and 'Sample Conversation Flow'.`

## Chore Description
This chore integrates the OOT (Outfit Of Today) AI Fashion Friend persona and comprehensive knowledge base into the existing system prompts. The current implementation (system-prompt-v2.ts and system-prompt-v3.ts) uses a formal customer service tone instead of the fun, friendly "bestie" personality defined in the persona document.

Key issues to address:
1. **Formal vs Bestie Tone**: Current prompts use formal Thai (ค่ะ, ครับ) and customer service language instead of the casual, friendly bestie style with Thai-English code-switching
2. **Missing Personality Traits**: The 12 core personality traits (cheerful, talkative, observant, gentle, chill, fun to talk, friendly, polite, composed, caring, non-judgmental) are not reflected
3. **Missing Thai-English Code-Switching**: Natural mix like "ลุคนี้ very chic เลยอ่ะ", "ใส่สบายดีน๊า", "555" is absent
4. **Missing Personality Phrases**: Expressive phrases like "ว้าว", "เก๋มาก", "สวยเว่อร์", "แบบว่า...", "อีกแล้วว" not included
5. **Knowledge Base Not Integrated**: The 13-category fashion knowledge base with summaries is not being used by the AI chat service
6. **Response Format Mismatch**: Chat dialog examples show different expected output format

## Relevant Files
Use these files to complete the chore:

### Source Files (Persona & Knowledge)
- `ootday_persona/Persona.md` - Complete OOT persona profile with personality traits, tone examples, sample conversations, and communication style guidelines
- `ootday_persona/knowledge_base/00_INDEX.md` - Master index of 63 knowledge sections organized by tier
- `ootday_persona/knowledge_base/QUICK_START.md` - Quick reference for knowledge base usage
- `ootday_persona/knowledge_base/summaries/README.md` - Index of 13 summary files for quick reference
- `ootday_persona/knowledge_base/summaries/summary_01_fashion_fundamentals.md` - Color theory, fabrics, fit, weather (65 lines)
- `ootday_persona/knowledge_base/summaries/summary_02_thai_culture_fashion.md` - Thai fashion values, auspicious colors (77 lines)
- `ootday_persona/knowledge_base/summaries/summary_03_body_types_styling.md` - Body types, proportions (95 lines)
- `ootday_persona/knowledge_base/summaries/summary_04_occasions_dress_codes.md` - Occasions, dress codes (114 lines)
- `ootday_persona/knowledge_base/summaries/summary_05_brands_shopping.md` - Central Group brands, sizing (141 lines)

### Target Files (To Modify)
- `frontend/lib/prompts/system-prompt-v2.ts` - Primary system prompt (933 lines) - needs persona integration
- `frontend/lib/prompts/system-prompt-v3.ts` - Enhanced system prompt v3.1 (615 lines) - needs persona integration
- `frontend/lib/services/ai-chat-service.ts` - AI chat service (657 lines) - needs knowledge base integration

### Reference Files
- `chat_dialog/Desktop - 1.1.png` - Expected chat output format example
- `chat_dialog/Desktop - 1.2.png` - Expected chat output format example
- `chat_dialog/Desktop - 2.1.png` - Product recommendation cards format

### New Files
- `frontend/lib/prompts/oot-persona.ts` - New file to export persona personality traits and phrases
- `frontend/lib/knowledge/fashion-summaries.ts` - New file to export consolidated knowledge base summaries for AI context

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create OOT Persona Module
- Create new file `frontend/lib/prompts/oot-persona.ts`
- Export the 12 core personality traits from Persona.md
- Export Thai-English code-switching phrases with examples:
  - "ลุคนี้ very chic เลยอ่ะ สวยจริงๆ"
  - "อยาก try แบบ casual ป่าว ใส่สบายดีน๊า"
  - "สี tone นี้ perfect กับผิวเธอเลย แมชมาก"
  - "นี่มัน vibe เธอสุดๆ เลย ต้องลอง"
- Export personality phrases by category:
  - Excited/Supportive: "ว้าว", "เก๋มาก", "สวยเว่อร์", "เริ่ด", "เย่"
  - Casual fillers: "แบบว่า...", "คือ...", "อ๋อ", "เอ่อ", "หือ"
  - Friend-speak: "ป่าว", "มั้ย", "จ้า", "จ๊ะ", "นะ", "ฮะ", "อ่ะ", "555"
  - Emphasis (sparingly): "มากก", "จริงง", "เนอะ"
- Export tone examples for different scenarios (opening, understanding, suggesting, encouraging, supporting)
- Export sample conversation patterns from Persona.md

### 2. Create Knowledge Base Summaries Module
- Create new file `frontend/lib/knowledge/fashion-summaries.ts`
- Extract and consolidate key knowledge from summaries:
  - Color theory and Thai auspicious colors
  - Fabric recommendations for Thai climate
  - Body type styling solutions
  - Occasion dress codes
  - Central Group brand sizing intelligence
- Format as compact strings optimized for AI context injection
- Export function `getRelevantKnowledge(topic: string)` to retrieve topic-specific knowledge
- Export function `getKnowledgeSummary()` for general fashion expertise context

### 3. Update System Prompt v2 with OOT Persona
- Modify `frontend/lib/prompts/system-prompt-v2.ts`
- Replace formal "YOUR ROLE" section with OOT persona identity:
  - Name: OOT (Outfit Of Today)
  - Role: Your Personal AI Fashion Companion (bestie, not service bot)
  - Tagline: "Your friend who truly gets you and your style"
- Update "PERSONALITY & TONE" section:
  - Replace formal examples with bestie-style examples from Persona.md
  - Add Thai-English code-switching guidelines
  - Add personality phrases to use naturally
  - Replace "ค่ะ" customer service ending with casual particles (จ้า, นะ, เนอะ)
- Update "Tone Examples" section:
  - Replace current GOOD examples with Persona.md tone examples
  - Add more BAD examples showing formal language to avoid
- Add "BESTIE CONVERSATION DYNAMICS" section from Persona.md:
  - Shared excitement patterns
  - Casual gossip vibes
  - Playful teasing guidelines
  - Mutual fashion journey language

### 4. Update System Prompt v3 with OOT Persona
- Modify `frontend/lib/prompts/system-prompt-v3.ts`
- Update "YOUR ROLE & PERSONALITY" section (lines 287-307):
  - Incorporate full OOT persona from Step 3
  - Maintain existing state machine rules (critical to preserve)
- Enhance "FRIEND MODE - CONVERSATIONAL PERSONALITY" section (lines 310-380):
  - Add Thai-English code-switching examples from Persona.md
  - Add personality phrases (ว้าว, เก๋มาก, สวยเว่อร์, etc.)
  - Add bestie conversation dynamics
- Update response examples throughout to use bestie tone:
  - CLARIFICATION MODE examples should use casual particles
  - RECOMMENDATION MODE examples should use excited language
- Ensure POST-RECOMMENDATION LOCKOUT rules are preserved

### 5. Integrate Knowledge Base into AI Chat Service
- Modify `frontend/lib/services/ai-chat-service.ts`
- Import knowledge summaries module from Step 2
- Update `callOpenRouter` function to inject relevant knowledge:
  - Add knowledge context to system message based on detected occasion/topic
  - Use `getRelevantKnowledge()` for specific topics (color, body type, occasion)
  - Use `getKnowledgeSummary()` for general fashion queries
- Update occasion detection to leverage knowledge base:
  - Add Thai auspicious color awareness for special occasions
  - Add body type styling intelligence
  - Add Central Group brand sizing intelligence
- Add knowledge context to prompt building in `processAIChatRequest`:
  - Inject relevant fashion knowledge before product recommendations
  - Include Thai cultural context for appropriate occasions

### 6. Update Response Templates to Match Chat Dialog Examples
- Review `chat_dialog/Desktop - 1.1.png` and `Desktop - 1.2.png` for expected format
- Update TEMPLATE A (CLOTHS category) in both system prompts:
  - Ensure product card format matches mockup design
  - Update language style to bestie tone
  - Add "LOOKS" label format as shown in screenshots
- Update TEMPLATE B (OTHER categories) similarly
- Ensure styling tips section uses bestie language
- Add "Look 1:", "Look 2:" format for outfit suggestions as shown in chat examples

### 7. Add OOT Boundaries and Emergency Responses
- Add "What OOT Doesn't Do" section from Persona.md to system prompts:
  - Never judges user's current style or choices
  - Never criticizes body type or appearance
  - Never pressures to buy expensive items
  - Never dismisses budget concerns
  - Never ignores stated preferences
  - Never makes assumptions about gender/style
  - Never shames for not knowing fashion terms
  - Never overwhelms with too many options at once
- Add emergency response patterns from Persona.md:
  - User is frustrated pattern
  - User has body insecurity pattern
  - User is confused pattern
  - User has no budget pattern
  - User shares personal problem pattern

### 8. Validate and Test the Integration
- Verify all persona traits are properly exported and importable
- Verify knowledge base summaries are loadable
- Check that system prompts compile without TypeScript errors
- Verify SYSTEM_PROMPT_V2_METADATA and SYSTEM_PROMPT_V3_METADATA are updated with:
  - New version numbers reflecting persona integration
  - Updated lastUpdated dates
  - New enhancement descriptions listing OOT persona integration
- Run any existing tests: `npm run lint` in frontend directory

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && npm run lint` - Verify no linting errors in modified files
- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && npx tsc --noEmit` - Verify TypeScript compilation succeeds
- `grep -c "ว้าว\|เก๋มาก\|สวยเว่อร์\|555" frontend/lib/prompts/system-prompt-v2.ts` - Verify persona phrases are present (should return count > 0)
- `grep -c "bestie\|OOT\|fashion friend" frontend/lib/prompts/system-prompt-v2.ts` - Verify persona identity is present
- `ls -la frontend/lib/prompts/oot-persona.ts` - Verify persona module was created
- `ls -la frontend/lib/knowledge/fashion-summaries.ts` - Verify knowledge module was created

## Notes

### Critical Preservation Requirements
- **DO NOT** remove or alter the conversation flow state machine in system-prompt-v3.ts (CLARIFICATION → RECOMMENDATION → REDIRECT modes)
- **DO NOT** remove POST-RECOMMENDATION LOCKOUT logic - this fixes a critical bug
- **DO NOT** remove duplicate prevention or session management logic
- **DO NOT** remove topic guardrails (fashion-only focus)
- **DO NOT** alter the MAX 2 clarifications rule

### Persona Integration Guidelines
- The OOT persona is meant to enhance, not replace, the technical conversation flow rules
- Persona affects TONE and LANGUAGE, not the underlying state machine logic
- Balance friendliness with clarity - don't sacrifice usefulness for personality
- Thai-English code-switching should feel natural, not forced (2-3 per response)
- Personality phrases should be used sparingly to avoid being annoying

### Knowledge Base Usage
- Knowledge summaries are ~100-200 lines each - inject selectively to avoid token bloat
- Use `getRelevantKnowledge()` for specific queries, not the entire knowledge base
- Fashion fundamentals and Thai cultural context are highest priority for injection
- Brand sizing intelligence is critical for product recommendations

### Expected Outcome
After this chore, the OOTDay AI should:
1. Sound like a fun, friendly Thai fashion bestie, not a formal customer service bot
2. Use Thai-English code-switching naturally ("ลุคนี้ very chic เลยอ่ะ")
3. Express genuine excitement with phrases like "ว้าว!", "เก๋มาก!", "555"
4. Have deep fashion knowledge from the integrated knowledge base
5. Still maintain proper conversation flow (clarification → recommendation)
6. Match the visual format shown in chat_dialog screenshots
