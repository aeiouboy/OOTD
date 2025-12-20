# Chore: Extract and Structure Occasion-Based Fashion Knowledge

## Metadata
adw_id: `001`
prompt: `summary occasion base on sammary /Users/naruechon/Documents/Project/OOTDay/ootday_persona/knowledge/achive/MASTER_Knowledge_Base.md save result to /Users/naruechon/Documents/Project/OOTDay/ootday_persona/knowledge/Occasion.md with creating better stucture format to make it readable`

## Chore Description
This chore involves extracting all occasion-related fashion knowledge from the MASTER_Knowledge_Base.md file and reorganizing it into a dedicated, well-structured Occasion.md document. The task requires:
1. Identifying all occasion-related content scattered throughout the 13,861-line knowledge base
2. Categorizing occasions by type (Thai cultural, professional, social, international)
3. Creating a readable, hierarchical structure with clear formatting
4. Ensuring comprehensive coverage of dress codes, color guidelines, and cultural considerations
5. Maintaining practical, actionable fashion advice for each occasion

## Relevant Files
Use these files to complete the chore:

**Existing Files:**
- `/Users/naruechon/Documents/Project/OOTDay/ootday_persona/knowledge/achive/MASTER_Knowledge_Base.md` - Source file containing all fashion knowledge including occasions (13,861 lines)
- `/Users/naruechon/Documents/Project/OOTDay/ootday_persona/knowledge/` - Target directory for the new structured file

### New Files
- `/Users/naruechon/Documents/Project/OOTDay/ootday_persona/knowledge/Occasion.md` - New structured occasion guide to be created

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Extract All Occasion Content
- Read the complete MASTER_Knowledge_Base.md file
- Search for all occasion-related sections using keywords: "occasion", "dress code", "wedding", "funeral", "temple", "festival", "celebration", "holiday", "royal", "event"
- Extract content from identified sections:
  - Section 4: Occasions & Dress Codes (lines ~687-826)
  - Section 17: Occasion Secrets & Insider Tips
  - Category 40: Thai Celebrations & Special Occasions (lines ~6981+)
  - Thai Shopping Occasions (lines ~798-824)
  - Professional Occasions references
  - International festivals sections
  - Any occasion-outfit mapping content

### 2. Categorize and Group Occasions
- Group extracted content into main categories:
  - **Thai Royal & National Occasions** (Royal birthdays, National days)
  - **Thai Traditional Festivals** (Songkran, Loy Krathong, etc.)
  - **Thai Social Events** (Weddings, Funerals, Temple visits, House warming)
  - **Professional Occasions** (Corporate, Business Casual, Smart Casual, Casual)
  - **International Dress Codes** (Black Tie, Cocktail, etc.)
  - **Shopping & Lifestyle Occasions** (Mall, Market, Night market)
  - **Religious & Cultural Events** (Buddhist ceremonies, Temple visits)

### 3. Create Hierarchical Document Structure
- Design a clear markdown structure with:
  - Table of Contents with links
  - Main sections with clear headers (##)
  - Subsections for specific occasions (###)
  - Consistent formatting for dress codes
  - Visual separators between major sections
  - Quick reference guides/summary boxes

### 4. Format Content for Readability
- Use consistent formatting patterns:
  - ✅ for DO's / recommended items
  - ❌ for DON'T's / items to avoid
  - Color coding with emoji indicators (🟡 Yellow, 🔵 Blue, etc.)
  - Clear subsections for Men/Women where applicable
  - Price indicators (฿ symbols)
  - "Where to Buy" sections for specific items
  - Cultural notes in highlighted boxes

### 5. Enhance with Practical Information
- Add for each occasion:
  - Quick Overview box with key details
  - Dress code level (Formal/Semi-formal/Casual)
  - Color requirements or recommendations
  - Specific brand/store suggestions from Central Group
  - Common mistakes to avoid
  - Alternative options for different budgets
  - Seasonal considerations
  - Cultural sensitivity notes

### 6. Create Quick Reference Sections
- Add summary tables:
  - Occasion-Color Quick Guide
  - Formality Level Chart
  - Thai Cultural Calendar with dress codes
  - Emergency Outfit Formulas
  - Shopping Location Guide by Occasion

### 7. Write the Structured Document
- Create the new Occasion.md file with:
  - Professional header with metadata
  - Comprehensive Table of Contents
  - All categorized and formatted content
  - Cross-references where relevant
  - Footer with update date and version

### 8. Validate and Review
- Check that all occasion types are covered
- Verify cultural accuracy and sensitivity
- Ensure practical actionability of advice
- Confirm formatting consistency throughout
- Test navigation links in Table of Contents
- Validate markdown syntax

## Validation Commands
Execute these commands to validate the chore is complete:

- `ls -la /Users/naruechon/Documents/Project/OOTDay/ootday_persona/knowledge/Occasion.md` - Verify file creation
- `wc -l /Users/naruechon/Documents/Project/OOTDay/ootday_persona/knowledge/Occasion.md` - Check file has substantial content (should be 500+ lines)
- `head -50 /Users/naruechon/Documents/Project/OOTDay/ootday_persona/knowledge/Occasion.md` - Verify proper header and structure
- `grep -c "##" /Users/naruechon/Documents/Project/OOTDay/ootday_persona/knowledge/Occasion.md` - Count main sections (should have 6+ sections)
- `grep -E "(Thai|Wedding|Funeral|Temple|Professional|Cocktail)" /Users/naruechon/Documents/Project/OOTDay/ootday_persona/knowledge/Occasion.md | wc -l` - Verify key occasions are included

## Notes
- The source file is very large (13,861 lines) so extraction needs to be thorough
- Thai cultural sensitivity is crucial - maintain respectful tone especially for Royal occasions
- Focus on practical, actionable advice that OOTDay users can immediately apply
- Include Central Group brand references where relevant for shopping guidance
- Consider creating emoji-based visual cues for quick scanning
- The document should serve as both a reference guide and educational resource