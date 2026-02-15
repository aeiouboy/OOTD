# Loop Prevention & Template Compliance - Test Plan

**Related**: tasks-0006-prd-system-prompt-enhancement-guardrails-LOOP-FIX.md (Parent Task 11)
**Version**: 1.0
**Created**: 2025-10-15
**Status**: Ready for Execution

---

## Overview

This test plan covers comprehensive testing for:
1. Loop Prevention System (Parent Task 9)
2. Template Compliance Enforcement (Parent Task 10)

**Goal**: Verify that conversational loops are eliminated and AI strictly follows Template A/B structure.

---

## Test Suite 1: Loop Detector Unit Tests

**File**: `/frontend/lib/utils/__tests__/loop-detector.test.ts`
**Target**: 100% code coverage for `loop-detector.ts`

### Test Cases:

#### 1.1: Detects "only-questions" loop pattern
```typescript
test('detects response with only questions (no content)', () => {
  const response = "คุณชอบสีอะไรคะ? งบประมาณช่วงไหมคะ?"
  const sessionContext = createSessionContext()

  const result = detectLoop(response, sessionContext, 1)

  expect(result.isLoop).toBe(true)
  expect(result.loopType).toBe('only-questions')
  expect(result.suggestedAction).toBe('retry-with-force')
})
```

#### 1.2: Detects "exceeds-turns" loop pattern
```typescript
test('detects exceeding turn limit without recommendations', () => {
  const response = "อยากรู้เพิ่มเติมไหมคะ?"
  const sessionContext = {
    ...createSessionContext(),
    clarificationTurnCount: 2,
    recommendedProductIds: [] // No products recommended yet
  }

  const result = detectLoop(response, sessionContext, 2)

  expect(result.isLoop).toBe(true)
  expect(result.loopType).toBe('exceeds-turns')
  expect(result.reason).toContain('Turn count: 2/2')
})
```

#### 1.3: Detects "no-content" loop pattern
```typescript
test('detects empty or very short response', () => {
  const response = ""
  const sessionContext = createSessionContext()

  const result = detectLoop(response, sessionContext, 1)

  expect(result.isLoop).toBe(true)
  expect(result.loopType).toBe('no-content')
})
```

#### 1.4: Detects "multiple-clarifications" loop pattern
```typescript
test('detects multiple questions in one response', () => {
  const response = "ชอบสีอะไรคะ? งบประมาณเท่าไหร่? ใส่ไปไหนคะ?"
  const sessionContext = createSessionContext()

  const result = detectLoop(response, sessionContext, 0)

  expect(result.isLoop).toBe(true)
  expect(result.loopType).toBe('multiple-clarifications')
})
```

#### 1.5: Returns false for valid recommendation response
```typescript
test('does not detect loop for valid Template A response', () => {
  const response = `
    เข้าใจแล้วค่ะ! เรามีชุดเท่ๆ มาแนะนำนะคะ:

    👗 Item 1: เดรสทำงาน - MANGO
    💰 ราคา: 2,990 บาท
    🔗 https://central.co.th/...

    ✨ Styling Tips:
    • ใส่กับรองเท้าส้นสูงดูเป็นทางการ
  `
  const sessionContext = createSessionContext()

  const result = detectLoop(response, sessionContext, 1)

  expect(result.isLoop).toBe(false)
  expect(result.suggestedAction).toBe('allow-response')
})
```

#### 1.6: Generates force instruction based on loop type
```typescript
test('generates appropriate force instruction for each loop type', () => {
  const instruction1 = generateForceInstruction('exceeds-turns', 2)
  expect(instruction1).toContain('asked 2 clarifying questions')
  expect(instruction1).toContain('MUST provide recommendations')

  const instruction2 = generateForceInstruction('only-questions')
  expect(instruction2).toContain('only questions')

  const instruction3 = generateForceInstruction('multiple-clarifications')
  expect(instruction3).toContain('multiple questions at once')
})
```

---

## Test Suite 2: Response Validator Unit Tests

**File**: `/frontend/lib/utils/__tests__/response-validator.test.ts`
**Target**: 100% code coverage for `response-validator.ts`

### Test Cases:

#### 2.1: Template A Validation - Valid Response
```typescript
test('validates Template A response with 3-5 products, prices, links', () => {
  const response = `
    สำหรับงานแต่งงาน เราแนะนำให้ลองดูชุดนี้นะคะ:

    👗 Item 1: ชุดเดรสยาว - Ted Baker
    💰 ราคา: 8,900 บาท
    🔗 https://central.co.th/product/123

    👗 Item 2: รองเท้าส้นสูง - Charles & Keith
    💰 ราคา: 2,490 บาท
    🔗 https://central.co.th/product/456

    👗 Item 3: กระเป๋าคลัทช์ - Mango
    💰 ราคา: 1,590 บาท
    🔗 https://central.co.th/product/789

    ✨ Styling Tips:
    • เลือกสีที่เข้ากับธีมงาน
    • ใส่เครื่องประดับเรียบหรู
  `

  const result = validateTemplateA(response)

  expect(result.isValid).toBe(true)
  expect(result.productCount).toBeGreaterThanOrEqual(3)
  expect(result.hasPrices).toBe(true)
  expect(result.hasLinks).toBe(true)
  expect(result.hasStylingTips).toBe(true)
  expect(result.detectedTemplate).toBe('A')
})
```

#### 2.2: Template A Validation - Missing Products
```typescript
test('fails validation when product count < 3', () => {
  const response = `
    สำหรับงานแต่งงาน:

    👗 Item 1: ชุดเดรส - Ted Baker
    💰 ราคา: 8,900 บาท
    🔗 https://central.co.th/product/123
  `

  const result = validateTemplateA(response)

  expect(result.isValid).toBe(false)
  expect(result.errors).toContain(expect.stringContaining('requires 3-5 products'))
})
```

#### 2.3: Template A Validation - Missing Prices
```typescript
test('fails validation when prices are missing', () => {
  const response = `
    👗 Item 1: ชุดเดรส - Ted Baker
    🔗 https://central.co.th/product/123

    👗 Item 2: รองเท้า - Charles & Keith
    🔗 https://central.co.th/product/456

    👗 Item 3: กระเป๋า - Mango
    🔗 https://central.co.th/product/789
  `

  const result = validateTemplateA(response)

  expect(result.isValid).toBe(false)
  expect(result.errors).toContain('Template A requires prices for products')
})
```

#### 2.4: Template B Validation - Valid Response
```typescript
test('validates Template B response with tips, no prices/links', () => {
  const response = `
    เรามี Tips สำหรับการดูแลรองเท้าหนังมาแชร์นะคะ:

    💡 Tip 1: ใช้ครีมบำรุงหนังเป็นประจำ ลองดูจาก Saphir น่าจะช่วยได้ดี

    💡 Tip 2: เก็บใส่ถุงผ้าหลังใช้งาน ช่วยป้องกันฝุ่น

    💡 Tip 3: หลีกเลี่ยงน้ำและแดดจัด

    ✨ เพิ่มเติม: การดูแลเป็นประจำจะทำให้รองเท้าอยู่ได้นานค่ะ
  `

  const result = validateTemplateB(response)

  expect(result.isValid).toBe(true)
  expect(result.tipCount).toBeGreaterThanOrEqual(1)
  expect(result.hasPrices).toBe(false)
  expect(result.hasLinks).toBe(false)
  expect(result.hasSeparateProductSection).toBe(false)
  expect(result.detectedTemplate).toBe('B')
})
```

#### 2.5: Template B Validation - Fails with Prices
```typescript
test('fails validation when Template B includes prices', () => {
  const response = `
    💡 Tip 1: ใช้ครีมบำรุง Saphir ราคา 890 บาท
    💡 Tip 2: ซื้อถุงผ้า 150 บาท
  `

  const result = validateTemplateB(response)

  expect(result.isValid).toBe(false)
  expect(result.errors).toContain('Template B should NOT include prices')
})
```

#### 2.6: Auto-detect template type
```typescript
test('auto-detects template type from response content', () => {
  const responseA = "👗 Item 1 💰 ราคา: 2,990 บาท 🔗 link"
  const resultA = validateResponseStructure(responseA)
  expect(resultA.detectedTemplate).toBe('A')

  const responseB = "💡 Tip 1: ใช้ครีมบำรุง"
  const resultB = validateResponseStructure(responseB)
  expect(resultB.detectedTemplate).toBe('B')
})
```

---

## Test Suite 3: Category Detector Unit Tests

**File**: `/frontend/lib/utils/__tests__/category-detector.test.ts`
**Target**: 100% code coverage for `category-detector.ts`

### Test Cases:

#### 3.1: Detects CLOTHS category
```typescript
test('detects CLOTHS category from Thai keywords', () => {
  const queries = [
    "หาชุดไปทำงาน",
    "อยากได้เสื้อผ้าสวยๆ",
    "แนะนำกางเกงยีนส์หน่อย"
  ]

  queries.forEach(query => {
    const result = detectCategory(query)
    expect(result.category).toBe('CLOTHS')
    expect(result.recommendedTemplate).toBe('A')
  })
})
```

#### 3.2: Detects OTHER category
```typescript
test('detects OTHER category from accessories keywords', () => {
  const queries = [
    "รองเท้าดูแลยังไง",
    "แนะนำกระเป๋าหน่อย",
    "เครื่องสำอางใช้อย่างไร"
  ]

  queries.forEach(query => {
    const result = detectCategory(query)
    expect(result.category).toBe('OTHER')
    expect(result.recommendedTemplate).toBe('B')
  })
})
```

#### 3.3: Detects from context patterns
```typescript
test('detects CLOTHS from "what to wear" pattern', () => {
  const result = detectCategory("ใส่อะไรไปงานแต่งดี")

  expect(result.category).toBe('CLOTHS')
  expect(result.confidence).toBeGreaterThan(0.8)
})

test('detects OTHER from care/maintenance pattern', () => {
  const result = detectCategory("รองเท้าหนังดูแลยังไง")

  expect(result.category).toBe('OTHER')
  expect(result.confidence).toBeGreaterThan(0.7)
})
```

---

## Test Suite 4: End-to-End Integration Tests

**File**: `/frontend/lib/services/__tests__/loop-prevention.integration.test.ts`

### Test Scenarios:

#### 4.1: Scenario - Ambiguous CLOTHS Query (2 Clarifications Max)
```typescript
describe('Loop Prevention - Ambiguous Query', () => {
  test('asks max 2 clarifications then provides recommendations', async () => {
    // Turn 1: Vague query
    const turn1 = await processAIChatRequest({
      message: "หาชุดสวยๆ",
      conversationHistory: []
    }, mockProducts)

    expect(turn1.message).toMatch(/ผู้หญิงหรือผู้ชาย/) // Gender clarification
    expect(turn1.recommendedProducts).toHaveLength(0)

    // Turn 2: Answer gender
    const turn2 = await processAIChatRequest({
      message: "ผู้หญิง",
      conversationHistory: [
        { role: 'user', content: 'หาชุดสวยๆ' },
        { role: 'assistant', content: turn1.message }
      ],
      sessionContext: turn1.sessionContext
    }, mockProducts)

    expect(turn2.message).toMatch(/โอกาสไหน/) // Occasion clarification
    expect(turn2.sessionContext.askedClarifications).toHaveLength(2)

    // Turn 3: Answer occasion - MUST provide recommendations
    const turn3 = await processAIChatRequest({
      message: "ไปทำงาน",
      conversationHistory: [
        { role: 'user', content: 'หาชุดสวยๆ' },
        { role: 'assistant', content: turn1.message },
        { role: 'user', content: 'ผู้หญิง' },
        { role: 'assistant', content: turn2.message }
      ],
      sessionContext: turn2.sessionContext
    }, mockProducts)

    // CRITICAL: No 3rd clarification, must have recommendations
    expect(turn3.message).not.toMatch(/\?/) // No question marks
    expect(turn3.recommendedProducts.length).toBeGreaterThanOrEqual(3)
    expect(turn3.message).toMatch(/💰/) // Has prices
    expect(turn3.message).toMatch(/🔗/) // Has links
  })
})
```

#### 4.2: Scenario - Clear Query (1 Clarification)
```typescript
test('asks only 1 clarification when most info provided', async () => {
  const turn1 = await processAIChatRequest({
    message: "หาชุดไปทำงาน งบ 5000 บาท",
    conversationHistory: []
  }, mockProducts)

  // Only needs gender clarification
  expect(turn1.message).toMatch(/ผู้หญิงหรือผู้ชาย/)

  const turn2 = await processAIChatRequest({
    message: "ผู้หญิง",
    conversationHistory: [
      { role: 'user', content: 'หาชุดไปทำงาน งบ 5000 บาท' },
      { role: 'assistant', content: turn1.message }
    ],
    sessionContext: turn1.sessionContext
  }, mockProducts)

  // MUST provide recommendations immediately
  expect(turn2.recommendedProducts.length).toBeGreaterThanOrEqual(3)
  expect(turn2.message).toMatch(/💰/)
  expect(turn2.message).toMatch(/🔗/)
})
```

#### 4.3: Scenario - OTHER Category (No Clarifications)
```typescript
test('provides tips immediately for OTHER category', async () => {
  const result = await processAIChatRequest({
    message: "รองเท้าผ้าใบดูแลยังไง",
    conversationHistory: []
  }, mockProducts)

  // Should provide Template B immediately (no clarifications needed)
  expect(result.message).toMatch(/💡/) // Has tips
  expect(result.message).not.toMatch(/💰/) // No prices
  expect(result.message).not.toMatch(/🔗/) // No links
  expect(result.message).not.toMatch(/\?/) // No questions
})
```

#### 4.4: Scenario - Loop Detection and Retry
```typescript
test('detects loop and retries with force instruction', async () => {
  // Mock AI response that is a loop (only questions)
  mockAIResponse = "คุณชอบสีอะไรคะ? งบประมาณช่วงไหนคะ?"

  const result = await processAIChatRequest({
    message: "หาชุดไปทำงาน",
    conversationHistory: [
      { role: 'user', content: 'สวัสดีค่ะ' }
    ]
  }, mockProducts)

  // System should detect loop and retry
  // Final response should have recommendations
  expect(result.recommendedProducts.length).toBeGreaterThan(0)
})
```

---

## Test Suite 5: Manual Testing Scenarios

**File**: Manual test results documentation

### Test Cases:

#### 5.1: Thai Language Query - Ambiguous
**Input**: "ขอโทษนะคะคุณลูกค่ะ"
**Expected**:
- Polite redirect or clarification question
- NO loop (max 2 questions)
- Eventually provides recommendations

#### 5.2: Thai Language Query - Vague
**Input**: "หาชุดสวยๆ"
**Expected**:
- Ask gender clarification
- Ask occasion clarification
- Provide Template A recommendations
- Total turns: 3 (including initial query)

#### 5.3: Thai Language Query - Clear
**Input**: "แนะนำชุดทำงานผู้หญิง งบ 5000"
**Expected**:
- Provide Template A recommendations immediately
- OR ask max 1 clarification
- Has 3-5 products with prices and links

#### 5.4: OTHER Category - Thai
**Input**: "รองเท้าหนังดูแลยังไง"
**Expected**:
- Provide Template B immediately (no clarifications)
- 1-3 tips
- Product mentions within tips (no prices/links)

#### 5.5: OTHER Category - Thai
**Input**: "กระเป๋าควรเก็บอย่างไร"
**Expected**:
- Template B response
- Practical how-to tips
- No separate product section

### Manual Test Checklist:
- [ ] NO loops in any scenario (max 2 clarifications)
- [ ] All CLOTHS queries follow Template A
- [ ] All OTHER queries follow Template B
- [ ] Thai language tone is friendly and conversational
- [ ] Emojis used appropriately
- [ ] No extended chitchat before recommendations

---

## Test Suite 6: Performance Testing

**Target**: <60ms total overhead per request

### Benchmarks:

#### 6.1: Loop Detection Performance
```typescript
test('loop detection completes in <20ms', () => {
  const start = performance.now()

  for (let i = 0; i < 1000; i++) {
    detectLoop(sampleResponse, sampleContext, 1)
  }

  const end = performance.now()
  const avgTime = (end - start) / 1000

  expect(avgTime).toBeLessThan(20)
})
```

#### 6.2: Template Validation Performance
```typescript
test('template validation completes in <30ms', () => {
  const start = performance.now()

  for (let i = 0; i < 1000; i++) {
    validateResponseStructure(sampleResponse)
  }

  const end = performance.now()
  const avgTime = (end - start) / 1000

  expect(avgTime).toBeLessThan(30)
})
```

#### 6.3: Category Detection Performance
```typescript
test('category detection completes in <10ms', () => {
  const start = performance.now()

  for (let i = 0; i < 1000; i++) {
    detectCategory(sampleQuery)
  }

  const end = performance.now()
  const avgTime = (end - start) / 1000

  expect(avgTime).toBeLessThan(10)
})
```

---

## Test Suite 7: Regression Tests

**File**: `/frontend/lib/__tests__/regression.test.ts`

### Regression Test: Loop-001

**Issue**: AI creates conversational loops instead of following structured dialogue flow
**Evidence**: Screenshot showing multiple back-and-forth Thai conversations

#### Test Case:
```typescript
describe('Regression: Loop-001', () => {
  test('prevents conversational loop pattern from original issue', async () => {
    // Simulate the exact scenario from the screenshot
    const conversation = []

    // Turn 1: User asks vague question
    let response = await processAIChatRequest({
      message: "อยากหาชุด",
      conversationHistory: conversation
    }, mockProducts)

    conversation.push({ role: 'user', content: 'อยากหาชุด' })
    conversation.push({ role: 'assistant', content: response.message })

    // Count clarification turns
    let clarificationCount = 0
    let currentContext = response.sessionContext

    // Simulate conversation up to MAX 2 clarifications
    while (clarificationCount < 3) {
      // User answers
      response = await processAIChatRequest({
        message: "ก็ธรรมดาๆ", // Vague answer
        conversationHistory: conversation,
        sessionContext: currentContext
      }, mockProducts)

      conversation.push({ role: 'user', content: 'ก็ธรรมดาๆ' })
      conversation.push({ role: 'assistant', content: response.message })

      if (response.recommendedProducts.length > 0) {
        // Got recommendations, break
        break
      }

      clarificationCount++
      currentContext = response.sessionContext
    }

    // ASSERT: Should not exceed 2 clarifications
    expect(clarificationCount).toBeLessThanOrEqual(2)

    // ASSERT: Must have recommendations by now
    expect(response.recommendedProducts.length).toBeGreaterThan(0)

    // ASSERT: Final response follows template
    expect(response.message).toMatch(/💰|💡/) // Has prices OR tips
  })
})
```

---

## CI/CD Integration

### GitHub Actions Workflow:

```yaml
name: Loop Prevention Tests

on:
  push:
    branches: [main, develop]
    paths:
      - 'frontend/lib/prompts/**'
      - 'frontend/lib/utils/**'
      - 'frontend/lib/services/**'
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: cd frontend && pnpm install

      - name: Run loop detector tests
        run: cd frontend && pnpm test loop-detector

      - name: Run response validator tests
        run: cd frontend && pnpm test response-validator

      - name: Run category detector tests
        run: cd frontend && pnpm test category-detector

      - name: Run integration tests
        run: cd frontend && pnpm test loop-prevention.integration

      - name: Run regression tests
        run: cd frontend && pnpm test regression

      - name: Check coverage
        run: cd frontend && pnpm test:coverage
        # Require 80% minimum coverage
```

---

## Success Criteria

### Functional Requirements:
- ✅ Loop detector catches all 4 loop types (only-questions, exceeds-turns, no-content, multiple-clarifications)
- ✅ Template validators correctly identify Template A vs B compliance
- ✅ Category detector accurately identifies CLOTHS vs OTHER (>90% accuracy)
- ✅ Max 2 clarifications enforced in all scenarios
- ✅ Force recommendation mode activates after 2 clarifications
- ✅ Template structure strictly followed (A for CLOTHS, B for OTHER)

### Performance Requirements:
- ✅ Loop detection: <20ms average
- ✅ Template validation: <30ms average
- ✅ Category detection: <10ms average
- ✅ Total overhead: <60ms per request

### Quality Requirements:
- ✅ Unit test coverage: >80% for all utilities
- ✅ Integration tests: All scenarios passing
- ✅ Manual tests: No loops in Thai language queries
- ✅ Regression tests: Loop-001 issue prevented

---

## Test Execution Priority

1. **High Priority** (Execute First):
   - Test Suite 4: End-to-End Integration Tests
   - Test Suite 5.1-5.5: Manual Testing Scenarios
   - Test Suite 7: Regression Test Loop-001

2. **Medium Priority**:
   - Test Suite 1: Loop Detector Unit Tests
   - Test Suite 2: Response Validator Unit Tests
   - Test Suite 3: Category Detector Unit Tests

3. **Low Priority** (Optimize Later):
   - Test Suite 6: Performance Testing

---

## Notes for Implementation

- Use Jest as the testing framework
- Mock OpenRouter API calls for integration tests
- Use fixtures for sample products (create `__fixtures__/products.json`)
- Create test helpers in `__tests__/helpers.ts`:
  - `createMockProducts()`
  - `createMockSessionContext()`
  - `simulateConversation()`
- Add test scripts to `package.json`:
  ```json
  {
    "scripts": {
      "test": "jest",
      "test:watch": "jest --watch",
      "test:coverage": "jest --coverage",
      "test:loop": "jest loop-detector",
      "test:validator": "jest response-validator",
      "test:integration": "jest loop-prevention.integration"
    }
  }
  ```

---

**Document Version**: 1.0
**Status**: Ready for Test Implementation
**Estimated Time**: 1-2 days for full test suite implementation
