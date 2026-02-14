/**
 * Real API Integration Test for Chat v5 Flow
 *
 * @vitest-environment node
 *
 * NO MOCKS — calls the real OpenRouter API with real products.
 * Requires OPENROUTER_API_KEY in .env.local
 *
 * Tests the full v5 pipeline:
 * 1. Load real products from JSON files
 * 2. Call processAIChatRequest (which delegates to processAIChatRequestV5)
 * 3. Verify structured ---LOOKS_DATA--- output is parsed
 * 4. Verify catalog validation (anti-hallucination)
 */

import { describe, it, expect, beforeAll } from 'vitest'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local for real API keys BEFORE importing modules that use them
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

import { processAIChatRequest, type ChatRequest } from '../services/ai-chat-service'
import { loadProductsServerSide } from '../server-product-loader'
import type { EnhancedProduct } from '../types/product-types'

// Increase timeout for real API calls (60 seconds per test)
const API_TIMEOUT = 60_000

describe('Chat v5 Real API Integration', () => {
  let products: EnhancedProduct[]

  beforeAll(async () => {
    // Skip if no API key
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('Skipping real API tests: OPENROUTER_API_KEY not set')
      return
    }

    // Load real products from filesystem
    products = await loadProductsServerSide()
    console.log(`[Real API Test] Loaded ${products.length} real products`)
  }, API_TIMEOUT)

  it('should have OPENROUTER_API_KEY configured', () => {
    expect(process.env.OPENROUTER_API_KEY).toBeDefined()
    expect(process.env.OPENROUTER_API_KEY!.length).toBeGreaterThan(10)
  })

  it('should load real products from filesystem', () => {
    expect(products).toBeDefined()
    expect(products.length).toBeGreaterThan(0)
    console.log(`[Real API Test] Product count: ${products.length}`)

    // Verify products have required fields
    const sample = products[0]
    expect(sample.id).toBeDefined()
    expect(sample.sku).toBeDefined()
    expect(sample.brand).toBeDefined()
  })

  it('should return structured looks for a casual outfit request', async () => {
    if (!process.env.OPENROUTER_API_KEY || !products?.length) return

    const request: ChatRequest = {
      message: 'แนะนำชุดผู้หญิงไปเที่ยวคาเฟ่หน่อย สบายๆ ไม่เกิน 5000 บาท',
      conversationHistory: [],
      userPreferences: { gender: 'women' },
    }

    const response = await processAIChatRequest(request, products)

    console.log('[Real API Test] Response message (first 200 chars):', response.message?.substring(0, 200))
    console.log('[Real API Test] Looks count:', response.looks?.length || 0)
    console.log('[Real API Test] Session context:', {
      recommendedCount: response.sessionContext?.recommendedProductIds?.length,
    })

    // Basic response structure
    expect(response.message).toBeDefined()
    expect(typeof response.message).toBe('string')
    expect(response.message.length).toBeGreaterThan(10)

    // Should have session context
    expect(response.sessionContext).toBeDefined()

    // v5: Should have looks array
    expect(response.looks).toBeDefined()
    expect(Array.isArray(response.looks)).toBe(true)

    if (response.looks && response.looks.length > 0) {
      const firstLook = response.looks[0]
      console.log('[Real API Test] First look:', {
        lookNumber: firstLook.lookNumber,
        styleName: firstLook.styleName,
        itemCount: firstLook.items.length,
        totalPrice: firstLook.totalPrice,
      })

      // Verify look structure
      expect(firstLook.lookNumber).toBeGreaterThanOrEqual(1)
      expect(firstLook.styleName).toBeDefined()
      expect(firstLook.items).toBeDefined()
      expect(Array.isArray(firstLook.items)).toBe(true)

      // Verify items have catalog-validated fields
      if (firstLook.items.length > 0) {
        const firstItem = firstLook.items[0]
        console.log('[Real API Test] First item:', firstItem)

        expect(firstItem.name).toBeDefined()
        expect(firstItem.sku).toBeDefined()
        expect(firstItem.price).toBeGreaterThan(0)
        // URL should be from catalog (anti-hallucination)
        expect(firstItem.url).toBeDefined()
      }
    }
  }, API_TIMEOUT)

  it('should return structured looks for a work outfit request', async () => {
    if (!process.env.OPENROUTER_API_KEY || !products?.length) return

    const request: ChatRequest = {
      message: 'ชุดใส่ไปทำงานออฟฟิศ ดูดีหน่อย ผู้หญิง',
      conversationHistory: [],
    }

    const response = await processAIChatRequest(request, products)

    console.log('[Real API Test] Work outfit - Looks:', response.looks?.length || 0)
    console.log('[Real API Test] Work outfit - Message length:', response.message?.length)

    expect(response.message).toBeDefined()
    expect(response.looks).toBeDefined()

    // Log all looks for inspection
    if (response.looks) {
      response.looks.forEach((look, i) => {
        console.log(`[Real API Test] Look ${i + 1}: "${look.styleName}" - ${look.items.length} items - ฿${look.totalPrice}`)
        look.items.forEach(item => {
          console.log(`  - ${item.name} (${item.brand}) ฿${item.price} SKU:${item.sku}`)
        })
      })
    }
  }, API_TIMEOUT)

  it('should handle guardrails for off-topic questions', async () => {
    if (!process.env.OPENROUTER_API_KEY || !products?.length) return

    const request: ChatRequest = {
      message: 'วิธีทำข้าวผัดยังไง',
      conversationHistory: [],
    }

    const response = await processAIChatRequest(request, products)

    console.log('[Real API Test] Off-topic response:', response.message?.substring(0, 100))

    // Should get redirected by guardrails
    expect(response.message).toBeDefined()
    // Guardrails should redirect to fashion topic
    expect(response.looks?.length || 0).toBe(0)
  }, API_TIMEOUT)

  it('should ask clarification for vague requests', async () => {
    if (!process.env.OPENROUTER_API_KEY || !products?.length) return

    const request: ChatRequest = {
      message: 'แนะนำชุดหน่อย',
      conversationHistory: [],
    }

    const response = await processAIChatRequest(request, products)

    console.log('[Real API Test] Vague request response:', response.message?.substring(0, 200))

    // Should either ask clarification or provide generic looks
    expect(response.message).toBeDefined()
    expect(response.message.length).toBeGreaterThan(10)
  }, API_TIMEOUT)

  it('should handle multi-turn conversation with session context', async () => {
    if (!process.env.OPENROUTER_API_KEY || !products?.length) return

    // Turn 1: Initial request with all info to skip clarification
    const request1: ChatRequest = {
      message: 'อยากได้ชุดผู้หญิงไปเดท งบ 5000 บาท',
      conversationHistory: [],
      userPreferences: { gender: 'women' },
    }

    const response1 = await processAIChatRequest(request1, products)
    console.log('[Real API Test] Turn 1 response:', response1.message?.substring(0, 150))
    console.log('[Real API Test] Turn 1 looks:', response1.looks?.length || 0)

    expect(response1.message).toBeDefined()
    expect(response1.sessionContext).toBeDefined()

    // Turn 2: Follow-up with session context
    const request2: ChatRequest = {
      message: 'มีแบบถูกกว่านี้ไหม งบ 3000',
      conversationHistory: [
        { role: 'user', content: request1.message },
        { role: 'assistant', content: response1.message },
      ],
      sessionContext: response1.sessionContext,
    }

    const response2 = await processAIChatRequest(request2, products)
    console.log('[Real API Test] Turn 2 response:', response2.message?.substring(0, 150))
    console.log('[Real API Test] Turn 2 looks:', response2.looks?.length || 0)

    expect(response2.message).toBeDefined()
    expect(response2.sessionContext).toBeDefined()
  }, API_TIMEOUT)

  it('should not fabricate URLs (anti-hallucination check)', async () => {
    if (!process.env.OPENROUTER_API_KEY || !products?.length) return

    const request: ChatRequest = {
      message: 'แนะนำชุดเดรสสวยๆ ผู้หญิงไปงานแต่งงาน งบ 10000 บาท',
      conversationHistory: [],
      userPreferences: { gender: 'women' },
    }

    const response = await processAIChatRequest(request, products)

    if (response.looks && response.looks.length > 0) {
      // Build set of valid catalog URLs
      const catalogUrls = new Set<string>()
      for (const product of products) {
        if (product.centralIntegration?.productUrl) {
          catalogUrls.add(product.centralIntegration.productUrl)
        }
      }

      // Every look item URL should be from the catalog
      for (const look of response.looks) {
        for (const item of look.items) {
          if (item.url && item.url.length > 0) {
            const urlInCatalog = catalogUrls.has(item.url)
            console.log(`[Real API Test] Anti-hallucination: SKU=${item.sku} URL=${item.url.substring(0, 60)}... inCatalog=${urlInCatalog}`)
            expect(urlInCatalog).toBe(true)
          }
        }
      }
    }
  }, API_TIMEOUT)
})
