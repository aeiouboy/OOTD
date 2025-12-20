# System Prompt v2.0 - Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Quality
- [x] All new files created successfully
- [x] All modified files updated properly
- [x] TypeScript compilation successful (no errors)
- [x] ESLint checks passed
- [x] Unit tests written and passing
- [x] Integration points verified

### ✅ Feature Completeness
- [x] **Friendly Tone**: System Prompt v2.0 with personality
- [x] **Duplicate Prevention**: Session context management
- [x] **Smart Clarification**: Priority-based question logic
- [x] **Topic Guardrails**: Off-topic detection and redirects
- [x] **DialogTemplate14-2**: Full compliance

### ✅ Documentation
- [x] Implementation guide created (SYSTEM_PROMPT_V2_IMPLEMENTATION.md)
- [x] .env.example updated with new variables
- [x] Inline code comments added
- [x] Type definitions documented
- [x] API contract documented

---

## Files Verification

### New Files Created (16 files)
```
✅ lib/types/chat-types.ts
✅ lib/prompts/system-prompt-v2.ts
✅ lib/prompts/tone-examples.ts
✅ lib/prompts/guardrail-responses.ts
✅ lib/prompts/clarification-acknowledgments.ts
✅ lib/prompts/system-prompt-loader.ts
✅ lib/utils/session-context.ts
✅ lib/utils/duplicate-filter.ts
✅ lib/utils/clarification-detector.ts
✅ lib/utils/guardrail-detector.ts
✅ lib/utils/__tests__/session-context.test.ts
✅ lib/utils/__tests__/duplicate-filter.test.ts
✅ SYSTEM_PROMPT_V2_IMPLEMENTATION.md
✅ DEPLOYMENT_CHECKLIST.md
✅ .env.example
```

### Modified Files (4 files)
```
✅ lib/services/ai-chat-service.ts
✅ lib/openrouter-client.ts
✅ app/api/chat/route.ts
✅ components/chat/ChatInterface.tsx
```

---

## Configuration Verification

### Environment Variables

1. **Check `.env.local` exists**
   ```bash
   ls -la .env.local
   ```

2. **Verify required variables**
   ```bash
   # Required
   OPENROUTER_API_KEY=sk-or-v1-xxx

   # Recommended
   NEXT_PUBLIC_SYSTEM_PROMPT_VERSION=v2
   NEXT_PUBLIC_SITE_URL=https://ootday.app
   ```

3. **Optional variables**
   ```bash
   # For testing
   NEXT_PUBLIC_ENABLE_TEST_MODE=true
   ```

---

## Build & Test

### 1. Install Dependencies
```bash
cd /Users/naruechon/Documents/Project/OOTDay/frontend
pnpm install
```

### 2. Run TypeScript Check
```bash
pnpm tsc --noEmit
```
Expected: No errors

### 3. Run Linter
```bash
pnpm lint
```
Expected: No errors or only warnings

### 4. Run Tests
```bash
pnpm test
```
Expected: All tests passing

### 5. Build Production
```bash
pnpm build
```
Expected: Build successful

### 6. Test Production Build
```bash
pnpm start
```
Expected: Server starts on port 3000

---

## Manual Testing

### Test 1: Duplicate Prevention
1. Open chat interface
2. Send: "แนะนำชุดทำงานหน่อยค่ะ" (recommend work outfit)
3. Note the products suggested
4. Send: "มีอะไรอีกมั้ยคะ" (any more options?)
5. **Verify**: No duplicate products appear
6. Keep requesting until "insufficient products" message
7. **Expected**: Message saying "เราแนะนำสินค้าในหมวดนี้ไปค่อนข้างครบแล้ว..."

### Test 2: Smart Clarification
1. Send vague message: "แนะนำชุดหน่อย" (recommend outfit)
2. **Expected**: System asks "อยากหาชุดผู้หญิงหรือผู้ชายคะ?" (women or men?)
3. Reply: "ผู้หญิงค่ะ" (women)
4. **Expected**: System asks about occasion or proceeds with recommendations
5. **Verify**: Only one question asked at a time

### Test 3: Topic Guardrails
1. Send off-topic: "แนะนำร้านอาหารหน่อย" (recommend restaurant)
2. **Expected**: Polite redirect like "ฉันแนะนำเรื่องแฟชั่นนะคะ ร้านอาหารไม่ค่อยรู้เรื่อง 😊"
3. Send fashion-adjacent: "ใส่ชุดอะไรไปร้านอาหารหรูๆ ดีคะ" (what to wear to fancy restaurant)
4. **Expected**: System helps with outfit suggestions
5. **Verify**: Fashion-adjacent queries are allowed

### Test 4: Friendly Tone
1. Send any fashion query
2. **Check responses for**:
   - Thai particles: ค่ะ, นะคะ, เลย, จ้า
   - Enthusiasm: มากกก, สุดๆ, แน่นอน
   - Emojis: 👗, 💼, ✨, 😊
3. **Verify no formal phrases**:
   - ❌ "ขอแนะนำสินค้า"
   - ❌ "คุณสามารถพิจารณา"
   - ❌ "ครับ/ค่ะ"

### Test 5: Session Persistence
1. Send multiple requests in same conversation
2. **Verify**: Session context persists across messages
3. Open DevTools console
4. **Check logs**:
   - `[Chat] Session updated: X total products recommended`
   - `[AI Chat] Recommended X new products. Total in session: Y`
5. Refresh page
6. **Expected**: Session resets (new recommendations allowed)

---

## Deployment Steps

### Option A: Vercel Deployment

1. **Connect Repository**
   ```bash
   # Commit all changes first
   git add .
   git commit -m "feat: implement system prompt v2.0 with all enhancements"
   git push origin main
   ```

2. **Configure Vercel**
   - Go to vercel.com
   - Import project from GitHub
   - Set environment variables:
     - `OPENROUTER_API_KEY`
     - `NEXT_PUBLIC_SYSTEM_PROMPT_VERSION=v2`
     - `NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app`

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

4. **Verify Deployment**
   - Visit deployed URL
   - Run manual tests above

### Option B: Azure Deployment

1. **Build Docker Image** (if using containers)
   ```bash
   docker build -t ootday-frontend .
   docker tag ootday-frontend youracr.azurecr.io/ootday-frontend:v2
   docker push youracr.azurecr.io/ootday-frontend:v2
   ```

2. **Configure App Service**
   - Set environment variables in Azure Portal
   - Update deployment settings

3. **Deploy**
   ```bash
   az webapp deployment source config-zip \
     --resource-group ootday-rg \
     --name ootday-app \
     --src ./build.zip
   ```

4. **Verify Deployment**
   - Check application logs
   - Run manual tests

### Option C: Manual Deployment

1. **Build Production**
   ```bash
   pnpm build
   ```

2. **Copy Build Files**
   ```bash
   # Copy .next folder to server
   scp -r .next user@server:/path/to/app/
   scp -r public user@server:/path/to/app/
   scp package.json user@server:/path/to/app/
   ```

3. **Install Dependencies on Server**
   ```bash
   ssh user@server
   cd /path/to/app
   pnpm install --production
   ```

4. **Set Environment Variables**
   ```bash
   nano .env.local
   # Add OPENROUTER_API_KEY and other variables
   ```

5. **Start Application**
   ```bash
   pnpm start
   ```

---

## Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-domain.com/api/health
```
Expected: 200 OK

### 2. Chat API Test
```bash
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "แนะนำชุดทำงานหน่อยค่ะ"}'
```
Expected: JSON response with message and outfits

### 3. System Prompt Version Check
```typescript
// In browser console
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'test' })
})
  .then(r => r.json())
  .then(console.log);
```
Check response uses friendly tone

### 4. Monitor Logs

**Look for success indicators:**
```
[AI Chat] Using System Prompt v2.0
[AI Chat] Session has X previously recommended products
[AI Chat] Recommended Y new products. Total in session: Z
```

**Look for errors:**
```
[AI Chat] Error:
OpenRouter API error:
Invalid session context:
```

### 5. Performance Check

**Response Times:**
- Chat API: < 3 seconds
- Product filtering: < 100ms
- Duplicate detection: < 50ms

**Memory Usage:**
- Monitor server memory
- Check for memory leaks
- Verify session context cleanup

---

## Rollback Plan

### If Issues Occur

1. **Quick Rollback to v1**
   ```bash
   # Set environment variable
   NEXT_PUBLIC_SYSTEM_PROMPT_VERSION=v1

   # Redeploy
   ```

2. **Disable Specific Features**
   ```typescript
   // In ai-chat-service.ts, comment out features:

   // Disable guardrails
   // const guardrailMessage = checkGuardrails(request.message);

   // Disable clarifications
   // const clarificationsNeeded = getClarificationsNeeded(userQuery);

   // Disable duplicate filter
   // const { products: uniqueProducts } = filterAndValidateProducts(...);
   ```

3. **Full Rollback**
   ```bash
   git revert HEAD
   git push origin main
   # Redeploy
   ```

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Conversation Metrics**
   - Average messages per conversation
   - Clarification question frequency
   - Off-topic query percentage
   - Duplicate product encounters

2. **Performance Metrics**
   - API response time
   - Duplicate filter performance
   - Session context size
   - Memory usage

3. **Error Metrics**
   - OpenRouter API errors
   - Invalid session context errors
   - Filter errors
   - Timeout errors

### Logging

**Enable detailed logging:**
```typescript
// In production, monitor these logs:
console.log('[AI Chat] Processing message:', message);
console.log('[AI Chat] Off-topic query detected');
console.log('[AI Chat] Clarification needed:', type);
console.log('[AI Chat] Session updated:', sessionContext);
```

---

## Success Criteria

### ✅ Deployment is successful if:

1. **All manual tests pass** (5/5 tests above)
2. **No console errors** in browser
3. **API responds within** < 3 seconds
4. **Duplicate prevention works** (no duplicate products)
5. **Clarifications asked** when info missing
6. **Off-topic redirects** work properly
7. **Friendly tone** present in all responses
8. **Session persists** across conversation
9. **No memory leaks** after extended use
10. **Logs show** v2.0 features active

---

## Post-Deployment Tasks

### Week 1
- [ ] Monitor error rates daily
- [ ] Collect user feedback
- [ ] Review conversation logs
- [ ] Check duplicate prevention effectiveness
- [ ] Verify clarification question quality

### Week 2-4
- [ ] Analyze metrics
- [ ] A/B test v1 vs v2 (if needed)
- [ ] Fine-tune clarification triggers
- [ ] Update guardrail patterns based on usage
- [ ] Optimize system prompt based on feedback

### Ongoing
- [ ] Monthly review of tone examples
- [ ] Quarterly system prompt updates
- [ ] Regular performance optimization
- [ ] Feature enhancement based on data

---

## Support & Troubleshooting

### Common Issues

See `SYSTEM_PROMPT_V2_IMPLEMENTATION.md` → Troubleshooting section

### Contact

- **Technical Issues**: Development Team
- **Product Questions**: Product Management
- **Emergency**: On-call engineer

---

## Completion Checklist

Before marking deployment complete:

- [ ] All files committed to repository
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Tests passing
- [ ] Manual tests completed
- [ ] Deployed to production
- [ ] Post-deployment verification done
- [ ] Monitoring configured
- [ ] Team notified
- [ ] Documentation updated
- [ ] Rollback plan tested

---

## Sign-off

**Deployed By:** _________________
**Date:** _________________
**Environment:** Production / Staging
**Version:** v2.0.0
**Git Commit:** _________________

**Verified By:** _________________
**Date:** _________________

---

**Deployment Status:** ✅ READY FOR DEPLOYMENT
