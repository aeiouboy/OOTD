/**
 * Chat Types for System Prompt Enhancement
 *
 * TypeScript interfaces for session management, clarification logic,
 * and conversation context tracking.
 *
 * Related PRD: 0006-prd-system-prompt-enhancement-guardrails.md
 */

/**
 * Dialogue Phase
 * Tracks current phase of conversation to prevent loops
 * Related: tasks-0006-prd-system-prompt-enhancement-guardrails-LOOP-FIX.md (Sub-task 9.9)
 */
export type DialoguePhase = 'clarification' | 'recommendation' | 'follow-up';

/**
 * Clarification Type
 * Types of clarifications that can be asked
 */
export type ClarificationType = 'gender' | 'occasion' | 'destination' | 'budget';

/**
 * User Profile for Personalized Recommendations (v3.0 - RAG Integration)
 * Captures user preferences for RAG-based retrieval filtering
 */
export interface UserProfile {
  /** User's style preferences (e.g., 'minimal', 'casual', 'elegant') */
  stylePreferences?: string[];
  /** User's body type for styling advice */
  bodyType?: 'hourglass' | 'pear' | 'apple' | 'rectangle' | 'invertedTriangle';
  /** Preferred colors */
  colorPreferences?: string[];
  /** Budget tier for recommendations */
  budgetTier?: 'budget' | 'mid-range' | 'premium' | 'luxury';
}

/**
 * Session Context for Duplicate Prevention
 * Tracks products recommended during the current chat session
 * Enhanced with loop prevention tracking (v2.1)
 * Enhanced with RAG integration (v3.0)
 */
export interface SessionContext {
  /** Array of product SKUs/IDs already recommended in this session */
  recommendedProductIds: string[];
  /** Optional session identifier for tracking */
  sessionId?: string;
  /** Timestamp when session was created */
  createdAt?: Date;
  /** Track which clarifications have been asked to prevent loops (Array for JSON serialization) */
  askedClarifications: ClarificationType[];
  /** Extracted information from conversation history */
  conversationContext: {
    gender?: 'men' | 'women';
    occasion?: string;
    destination?: string;
    budget?: number;
    colors?: string[];
  };
  /**
   * Current dialogue phase (v2.1 - Loop Prevention)
   * - 'clarification': Asking questions (max 2)
   * - 'recommendation': Providing outfit/tips
   * - 'follow-up': Handling adjustments/refinements
   */
  dialoguePhase?: DialoguePhase;
  /**
   * Count of clarification turns (v2.1 - Loop Prevention)
   * Used to enforce MAX 2 clarifications rule
   */
  clarificationTurnCount?: number;
  /**
   * Flag indicating recommendations have been provided (v2.2 - Step 3 & 4)
   * Critical for POST-RECOMMENDATION LOCKOUT enforcement
   * Once true, NO clarifications can be asked (Step 4)
   */
  hasProvidedRecommendations?: boolean;
  /**
   * Count of recommendation rounds (v2.2 - Step 3 & 4)
   * Tracks how many times recommendations have been given
   * 0 = not yet, 1 = initial recommendations (Step 3), 2+ = follow-up (Step 4)
   */
  recommendationCount?: number;
  /**
   * Retrieved knowledge document IDs from RAG (v3.0 - RAG Integration)
   * Caches IDs of documents retrieved in this session to avoid redundant retrievals
   * and track which knowledge was used for recommendations
   */
  retrievedKnowledgeIds?: string[];
  /**
   * User profile for personalized RAG retrieval (v3.0 - RAG Integration)
   * Used to filter and personalize knowledge retrieval based on user characteristics
   */
  userProfile?: UserProfile;
}

/**
 * Conversation Memory
 * Stores user context extracted from conversation history
 */
export interface ConversationMemory {
  /** User's gender preference (if specified) */
  gender?: 'men' | 'women';
  /** User's budget range */
  budget?: number;
  /** Occasion for outfit (work, wedding, date, etc.) */
  occasion?: string;
  /** Travel destination (for travel-related queries) */
  destination?: string;
  /** Climate/season context */
  climate?: string;
  /** User's style preferences */
  stylePreferences?: string[];
  /** Session context for duplicate tracking */
  sessionContext: SessionContext;
}

/**
 * Clarification Needed
 * Represents a clarification question that should be asked
 */
export interface ClarificationNeeded {
  /** Type of clarification needed */
  type: 'gender' | 'occasion' | 'destination' | 'budget';
  /** The question to ask the user */
  question: string;
  /** Priority level (1 = highest) */
  priority: number;
}

/**
 * User Query
 * Parsed user query with detected information
 */
export interface UserQuery {
  /** Original user message */
  message: string;
  /** Whether gender was specified or can be inferred */
  hasGender: boolean;
  /** Whether occasion was specified or can be inferred */
  hasOccasion: boolean;
  /** Whether budget was mentioned */
  hasBudget: boolean;
  /** Whether colors were mentioned */
  hasColors: boolean;
  /** Whether destination was mentioned (for travel queries) */
  hasDestination: boolean;
  /** Whether this is a travel-related query */
  isTravelQuery: boolean;
  /** Detected gender (if any) */
  detectedGender?: 'men' | 'women';
  /** Detected occasion (if any) */
  detectedOccasion?: string;
  /** Detected budget (if any) */
  detectedBudget?: number;
  /** Detected destination (if any) */
  detectedDestination?: string;
  /** Detected preferred colors (canonical English names) */
  detectedColors?: string[];
}

/**
 * Guardrail Category
 * Categories of off-topic queries
 */
export type GuardrailCategory =
  | 'health'
  | 'technology'
  | 'food'
  | 'general'
  | 'travel'
  | 'inappropriate'
  | 'default';

/**
 * Redirect Message Map
 * Maps guardrail categories to redirect messages
 */
export interface RedirectMessageMap {
  health: string;
  technology: string;
  food: string;
  general: string;
  travel: string;
  inappropriate: string;
  default: string;
}

/**
 * System Prompt Version
 * Supported system prompt versions
 */
export type SystemPromptVersion = 'v1' | 'v2';

/**
 * Prompt Version (v3.0 - for A/B testing)
 * Available prompt versions for switching between v2.1 and v3.0
 * Related PRD: 0007-prd-system-prompt-v3-clarification-fix.md
 */
export type PromptVersion = 'v2.1' | 'v3.0';

/**
 * System Prompt Metadata
 * Metadata about the system prompt
 */
export interface SystemPromptMetadata {
  version: SystemPromptVersion;
  createdAt: string;
  lastUpdated: string;
  description: string;
  enhancements?: string[];
}

// ============================================================================
// v5.0: Chat Look Types for Per-Look Flat-Lay Generation
// ============================================================================

/**
 * Individual item within a chat look (v5.0)
 * Represents a product recommended by the AI, validated against the catalog
 */
export interface ChatLookItem {
  name: string;
  brand: string;
  category: string;
  color: string;
  description: string;
  sku: string;
  price: number;
  url: string;
  imageUrl?: string;
  colors?: string[];
  sizes?: string[];
}

/**
 * A styling suggestion from fashion knowledge (not a catalog product).
 * Used only for flat-lay image generation -- NOT shown in "Shop this look".
 */
export interface ChatLookStyling {
  /** Descriptive text, e.g. "Structured black leather tote bag" */
  description: string;
  /** Category, e.g. "Bag", "Hat", "Jewelry", "Belt", "Scarf" */
  category: string;
}

/**
 * A complete look recommended by the AI (v5.0)
 * Contains items, styling tip, and total price
 */
export interface ChatLook {
  lookNumber: number;
  styleName: string;
  items: ChatLookItem[];
  /** Styling accessories from fashion knowledge -- for flat-lay image only, not purchasable */
  stylingItems?: ChatLookStyling[];
  tip?: string;
  totalPrice: number;
  /** Flat-lay image (populated async after initial response) */
  imageBase64?: string;
  imageUrl?: string;
  imageStatus?: 'pending' | 'generating' | 'done' | 'error';
}

/**
 * Parsed result from AI response containing looks data (v5.0)
 */
export interface ParsedLooksResponse {
  /** Conversational text (Thai) before the structured block */
  text: string;
  /** Parsed looks from the ---LOOKS_DATA--- block */
  looks: ChatLook[];
}
