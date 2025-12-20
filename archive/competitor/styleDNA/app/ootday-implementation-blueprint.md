# OOTDay Implementation Blueprint
## Based on StyleDNA App Analysis

**Document Purpose:** Actionable implementation guide for OOTDay development team
**Date:** October 31, 2025
**Analyst:** Mary - Business Analyst

---

## 🎯 Executive Summary

StyleDNA's success lies in three core pillars:
1. **Progressive Personalization**: Building detailed profiles without friction
2. **Contextual Intelligence**: Maintaining conversation state and learning from interactions
3. **Visual-First Experience**: Showing outfits visually with clear actions

For OOTDay to compete and excel, we must implement these foundations while adding Thai market-specific advantages.

---

## 🏗️ Technical Architecture Blueprint

### System Architecture Overview
```
┌─────────────────────────────────────────────┐
│             Frontend (Mobile/Web)            │
├─────────────────────────────────────────────┤
│                API Gateway                   │
├────────────┬────────────┬───────────────────┤
│  Profile   │    Chat    │  Recommendation   │
│  Service   │   Service  │     Service       │
├────────────┴────────────┴───────────────────┤
│          Data Persistence Layer              │
├─────────────────────────────────────────────┤
│     PostgreSQL  │  Redis  │  S3 Storage     │
└─────────────────────────────────────────────┘
```

### Core Services to Implement

#### 1. Profile Service
```typescript
// Profile Service API
interface ProfileService {
    // Profile Creation
    createProfile(userId: string, selfie: Buffer): Promise<StyleProfile>;

    // Progressive Updates
    updatePreferences(userId: string, preferences: Partial<Preferences>): void;
    updateFromInteractions(userId: string, interactions: Interaction[]): void;

    // Retrieval
    getProfile(userId: string): Promise<StyleProfile>;
    getStyleFormula(userId: string): Promise<StyleFormula>;
}

// Data Models
interface StyleProfile {
    userId: string;
    styleFormula: {
        colorAnalysis: {
            season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
            palette: string[]; // Hex colors
            skinTone: string;
            thaiSpecific: {
                undertone: string;
                climateSuitability: string[];
            };
        };
        bodyAnalysis: {
            shape: string;
            proportions: object;
            fitPreferences: string[];
        };
        stylePersonality: {
            primary: string;
            secondary: string;
            avoidStyles: string[];
        };
    };
    preferences: {
        goals: string[];
        occasions: string[];
        budget: {
            min: number;
            max: number;
            sweet_spot: number;
        };
        brands: {
            preferred: string[];
            avoided: string[];
        };
    };
    metadata: {
        createdAt: Date;
        lastUpdated: Date;
        completionLevel: number; // 0-100%
        confidenceScores: object;
    };
}
```

#### 2. Chat Service
```typescript
// Chat Service Implementation
class ChatService {
    private contextManager: ContextManager;
    private nlpProcessor: NLPProcessor;
    private responseGenerator: ResponseGenerator;

    async processMessage(
        sessionId: string,
        message: string,
        userId: string
    ): Promise<ChatResponse> {
        // 1. Load context
        const context = await this.contextManager.getContext(sessionId);
        const profile = await this.profileService.getProfile(userId);

        // 2. Process input
        const intent = await this.nlpProcessor.detectIntent(message);
        const entities = await this.nlpProcessor.extractEntities(message);

        // 3. Generate response
        const response = await this.responseGenerator.generate({
            intent,
            entities,
            context,
            profile
        });

        // 4. Update context
        await this.contextManager.updateContext(sessionId, {
            lastMessage: message,
            lastResponse: response,
            entities,
            intent
        });

        // 5. Track interaction
        await this.analyticsService.trackInteraction({
            sessionId,
            userId,
            message,
            response,
            timestamp: new Date()
        });

        return response;
    }
}

// Context Management
class ContextManager {
    private redis: Redis;
    private ttl = 3600; // 1 hour

    async getContext(sessionId: string): Promise<SessionContext> {
        const cached = await this.redis.get(`session:${sessionId}`);
        return cached ? JSON.parse(cached) : this.createNewContext(sessionId);
    }

    async updateContext(
        sessionId: string,
        updates: Partial<SessionContext>
    ): Promise<void> {
        const current = await this.getContext(sessionId);
        const updated = { ...current, ...updates };

        await this.redis.setex(
            `session:${sessionId}`,
            this.ttl,
            JSON.stringify(updated)
        );
    }
}
```

#### 3. Recommendation Service
```typescript
// Recommendation Engine
class RecommendationService {
    async generateOutfit(
        userId: string,
        occasion: string,
        constraints?: OutfitConstraints
    ): Promise<Outfit> {
        const profile = await this.profileService.getProfile(userId);

        // Apply Thai-specific logic
        const weatherAdjusted = await this.adjustForWeather(occasion);
        const culturallyAppropriate = this.checkCulturalFit(occasion);

        // Generate outfit
        const outfit = await this.outfitComposer.compose({
            profile,
            occasion: weatherAdjusted,
            constraints: {
                ...constraints,
                cultural: culturallyAppropriate
            }
        });

        // Add Central Group products
        const products = await this.productMatcher.match(outfit, {
            inventory: 'central_group',
            inStock: true,
            priceRange: profile.preferences.budget
        });

        return {
            ...outfit,
            products,
            alternatives: await this.generateAlternatives(outfit)
        };
    }
}
```

---

## 📱 Frontend Implementation Guide

### State Management (Redux/Zustand)
```typescript
// Global App State
interface AppState {
    user: {
        isAuthenticated: boolean;
        profile: StyleProfile | null;
        preferences: UserPreferences;
    };

    chat: {
        sessions: Map<string, ChatSession>;
        activeSessionId: string | null;
        messages: ChatMessage[];
        isTyping: boolean;
    };

    recommendations: {
        current: Outfit | null;
        history: Outfit[];
        saved: SavedOutfit[];
    };

    wardrobe: {
        items: WardrobeItem[];
        outfits: Outfit[];
        analytics: WardrobeAnalytics;
    };

    ui: {
        isLoading: boolean;
        activeTab: 'DNA' | 'Shop' | 'AI' | 'Closet' | 'Profile';
        modals: {
            outfit: boolean;
            product: boolean;
            camera: boolean;
        };
    };
}
```

### Key UI Components
```typescript
// Progressive Onboarding Flow
const OnboardingFlow = () => {
    const [step, setStep] = useState(0);
    const steps = [
        <StyleGoalSelector />,      // What's your main style goal?
        <ShoppingExperience />,      // Tell us about shopping
        <WardrobeChallenges />,      // Clothes you can't style?
        <SelfieCapture />,          // Take selfie for analysis
        <ProcessingAnimation />,     // Generating Style Formula
        <StyleFormulaReveal />      // Show results
    ];

    return (
        <OnboardingContainer>
            <ProgressBar current={step} total={steps.length} />
            <AnimatePresence mode="wait">
                {steps[step]}
            </AnimatePresence>
            <NavigationButtons
                onNext={() => setStep(s => s + 1)}
                onBack={() => setStep(s => s - 1)}
            />
        </OnboardingContainer>
    );
};

// AI Chat Interface
const AIChatInterface = () => {
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { messages, sendMessage } = useChat();

    return (
        <ChatContainer>
            <QuickActions>
                <Button onClick={() => sendMessage("Generate Outfits")}>
                    Generate Outfits
                </Button>
                {QUICK_OCCASIONS.map(occasion => (
                    <Chip
                        key={occasion}
                        onClick={() => sendMessage(occasion)}
                    >
                        {occasion}
                    </Chip>
                ))}
            </QuickActions>

            <MessageList>
                {messages.map(msg => (
                    <Message key={msg.id}>
                        {msg.type === 'outfit' ?
                            <OutfitCard outfit={msg.outfit} /> :
                            <TextMessage>{msg.text}</TextMessage>
                        }
                    </Message>
                ))}
                {isGenerating && <TypingIndicator />}
            </MessageList>

            <InputArea>
                <TextInput
                    value={input}
                    onChange={setInput}
                    placeholder="Ask me any Style question"
                />
                <SendButton onClick={() => sendMessage(input)} />
            </InputArea>
        </ChatContainer>
    );
};
```

---

## 🗄️ Database Schema

### PostgreSQL Schema
```sql
-- Users and Profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE style_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    color_analysis JSONB,
    body_analysis JSONB,
    style_personality JSONB,
    thai_specific JSONB, -- Thai-specific adaptations
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    goals TEXT[],
    occasions TEXT[],
    budget_range INT4RANGE,
    preferred_brands TEXT[],
    avoided_brands TEXT[],
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat and Recommendations
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    started_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW(),
    context JSONB,
    status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id),
    role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES chat_sessions(id),
    occasion VARCHAR(100),
    outfit JSONB,
    products JSONB,
    interaction_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics
CREATE TABLE user_interactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    target_type VARCHAR(50), -- 'product', 'outfit', 'recommendation'
    target_id VARCHAR(255),
    action VARCHAR(50), -- 'view', 'save', 'share', 'purchase'
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_recommendations_user ON recommendations(user_id);
CREATE INDEX idx_interactions_user_date ON user_interactions(user_id, created_at DESC);
```

### Redis Cache Structure
```redis
# Session Context (TTL: 1 hour)
session:{sessionId} -> {
    userId: string,
    startTime: timestamp,
    lastActivity: timestamp,
    context: object,
    currentTopic: string
}

# User Profile Cache (TTL: 24 hours)
profile:{userId} -> {
    styleFormula: object,
    preferences: object,
    lastUpdated: timestamp
}

# Recommendation Cache (TTL: 1 hour)
rec:{userId}:{occasion} -> {
    outfit: object,
    products: array,
    generated: timestamp
}

# Trending Cache (TTL: 6 hours)
trending:{category} -> {
    items: array,
    updated: timestamp
}
```

---

## 🚀 Implementation Timeline

### Phase 1: MVP Foundation (Weeks 1-4)
**Week 1-2: Core Infrastructure**
- [ ] Set up backend services architecture
- [ ] Implement basic profile service
- [ ] Create database schema
- [ ] Set up Redis cache

**Week 3-4: Basic Features**
- [ ] Onboarding flow UI
- [ ] Simple color analysis (mock initially)
- [ ] Basic chat interface
- [ ] Central product integration (subset)

### Phase 2: AI Integration (Weeks 5-8)
**Week 5-6: Intelligence Layer**
- [ ] Integrate LLM for chat (Claude/GPT)
- [ ] Implement recommendation algorithm
- [ ] Add context management
- [ ] Build outfit composition logic

**Week 7-8: Personalization**
- [ ] Real selfie analysis integration
- [ ] Preference learning system
- [ ] Thai-specific adaptations
- [ ] Weather integration

### Phase 3: Polish & Scale (Weeks 9-12)
**Week 9-10: Enhanced Features**
- [ ] Digital wardrobe
- [ ] Social sharing
- [ ] Advanced recommendations
- [ ] Analytics dashboard

**Week 11-12: Production Ready**
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Load testing
- [ ] Deployment pipeline

---

## 🎨 Thai Market Adaptations

### Essential Localizations
1. **Color Analysis**
   - Thai skin tone classifications (12 types vs 4 Western)
   - Tropical climate color recommendations
   - Buddhist color significance

2. **Occasion Library**
   - Thai festivals (Songkran, Loy Krathong)
   - Temple visits (modest options)
   - Government office dress codes
   - Thai wedding styles

3. **Cultural Intelligence**
   ```typescript
   const ThaiCulturalRules = {
       temple: {
           required: ['covered_shoulders', 'knee_length'],
           forbidden: ['sleeveless', 'shorts', 'tight_fitting']
       },
       government: {
           required: ['formal', 'conservative'],
           preferred: ['thai_fabric', 'modest_colors']
       },
       royal_events: {
           required: ['yellow_monday', 'pink_tuesday'],
           special: ['blue_friday', 'purple_saturday']
       }
   };
   ```

4. **Language Support**
   - Thai language NLP
   - Bilingual interface
   - Local fashion terminology

---

## 📊 Success Metrics

### Technical KPIs
- API response time < 2s
- Cache hit rate > 70%
- Uptime > 99.9%
- Error rate < 0.1%

### Business KPIs
- User activation rate > 60%
- Profile completion > 80%
- Daily active users growth > 10% MoM
- Recommendation acceptance > 40%

### User Experience KPIs
- Onboarding completion > 70%
- Session duration > 5 minutes
- Return rate (7-day) > 40%
- NPS score > 50

---

## 🔑 Critical Success Factors

### Technical Must-Haves
✅ Reliable state management
✅ Fast response times
✅ Scalable architecture
✅ Robust error handling
✅ Comprehensive logging

### Product Must-Haves
✅ Frictionless onboarding
✅ Accurate personalization
✅ Visual-first interface
✅ Clear value proposition
✅ Thai market fit

### Competitive Advantages
✅ Central Group integration
✅ Thai cultural intelligence
✅ The1 card benefits
✅ Omnichannel experience
✅ Local language support

---

## 🎬 Next Steps

1. **Immediate Actions** (This Week)
   - [ ] Review and approve architecture
   - [ ] Assign development teams
   - [ ] Set up development environment
   - [ ] Begin API design

2. **Short-term Goals** (Month 1)
   - [ ] Complete MVP backend
   - [ ] Launch alpha testing
   - [ ] Gather initial feedback
   - [ ] Iterate on UX

3. **Medium-term Goals** (Quarter 1)
   - [ ] Beta launch (1000 users)
   - [ ] Refine AI recommendations
   - [ ] Optimize performance
   - [ ] Prepare for scale

---

*Blueprint prepared by: Mary, Business Analyst*
*For: OOTDay Development Team*
*Status: Ready for Implementation*