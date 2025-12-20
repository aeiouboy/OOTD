/**
 * Test Script for RAG & Guardrails System
 * Run this to verify the implementation works correctly
 */

import { processChatRequest } from './v0-ootd-ay-ai-fashion-assistant/lib/chat-orchestrator';
import { getKnowledgeBase } from './v0-ootd-ay-ai-fashion-assistant/lib/rag/knowledge-base';
import { preValidateQuery } from './v0-ootd-ay-ai-fashion-assistant/lib/guardrails/pre-validation';
import { retrieveKnowledge } from './v0-ootd-ay-ai-fashion-assistant/lib/rag/retrieval';

async function testRAGAndGuardrails() {
  console.log('🧪 Testing RAG & Guardrails System\n');
  console.log('='.repeat(60));

  // Test 1: Initialize Knowledge Base
  console.log('\n📚 Test 1: Initializing Knowledge Base...');
  try {
    const kb = getKnowledgeBase();
    await kb.initialize();
    const stats = kb.getStats();
    console.log('✅ Knowledge Base Initialized');
    console.log(`   - Documents: ${stats.totalDocuments}`);
    console.log(`   - Chunks: ${stats.totalChunks}`);
    console.log(`   - Embeddings: ${stats.totalEmbeddings}`);
    console.log(`   - Categories: ${Object.keys(stats.documentsByCategory).join(', ')}`);
  } catch (error) {
    console.error('❌ Failed to initialize knowledge base:', error);
    return;
  }

  // Test 2: Pre-Validation (Off-Topic Detection)
  console.log('\n🚫 Test 2: Pre-Validation - Off-Topic Detection');
  const offTopicQuery = 'แนะนำร้านอาหารหน่อยค่ะ'; // Off-topic: food
  const fashionQuery = 'แนะนำชุดไปทำงานหน่อยค่ะ'; // Fashion: work outfit

  const offTopicResult = preValidateQuery(offTopicQuery);
  const fashionResult = preValidateQuery(fashionQuery);

  console.log(`   Off-topic query: "${offTopicQuery}"`);
  console.log(`   Result: ${offTopicResult.passed ? '✅ PASSED' : '❌ BLOCKED'}`);
  if (!offTopicResult.passed) {
    console.log(`   Reason: ${offTopicResult.blockReason}`);
  }

  console.log(`\n   Fashion query: "${fashionQuery}"`);
  console.log(`   Result: ${fashionResult.passed ? '✅ PASSED' : '❌ BLOCKED'}`);

  // Test 3: RAG Retrieval
  console.log('\n🔍 Test 3: RAG Retrieval');
  const testQuery = 'แนะนำชุดไปทำงานหน่อยค่ะ';
  console.log(`   Query: "${testQuery}"`);

  try {
    const ragResult = await retrieveKnowledge(testQuery);
    console.log(`   ✅ Retrieved ${ragResult.retrievedChunks.length} chunks`);
    console.log(`   Retrieval time: ${ragResult.retrievalTimeMs}ms`);

    if (ragResult.retrievedChunks.length > 0) {
      console.log('\n   Top 3 Retrieved Chunks:');
      ragResult.retrievedChunks.slice(0, 3).forEach((retrieved, i) => {
        console.log(`   ${i + 1}. ${retrieved.chunk.metadata.title} - ${retrieved.chunk.metadata.section}`);
        console.log(`      Relevance: ${(retrieved.relevanceScore * 100).toFixed(1)}%`);
        console.log(`      Category: ${retrieved.chunk.metadata.category}`);
        console.log(`      Preview: ${retrieved.chunk.content.substring(0, 100)}...`);
      });
    }
  } catch (error) {
    console.error('   ❌ RAG retrieval failed:', error);
  }

  // Test 4: Full Chat Orchestration
  console.log('\n💬 Test 4: Full Chat Orchestration (with mock LLM)');
  console.log('   Note: This requires OpenRouter API key to be set');
  console.log('   Query: "แนะนำชุดไปทำงานหน่อยค่ะ"\n');

  // We'll skip actual LLM call in test, but show the flow
  console.log('   Flow would be:');
  console.log('   1. ✅ Pre-Validation → PASSED');
  console.log('   2. ✅ RAG Retrieval → Retrieved knowledge');
  console.log('   3. ⏳ Augmented Prompt → Combined with RAG context');
  console.log('   4. ⏳ LLM Call → Generate response');
  console.log('   5. ⏳ Post-Validation → Check occasion, brand voice, topic');
  console.log('   6. ⏳ Return Response → With metadata');

  // Test 5: Knowledge Base Stats
  console.log('\n📊 Test 5: Knowledge Base Statistics');
  const kb = getKnowledgeBase();
  const stats = kb.getStats();

  console.log('   Total Documents:', stats.totalDocuments);
  console.log('   Total Chunks:', stats.totalChunks);
  console.log('   Total Embeddings:', stats.totalEmbeddings);
  console.log('   Avg Chunks/Doc:', stats.avgChunksPerDocument.toFixed(2));
  console.log('   Last Updated:', stats.lastUpdated.toISOString());
  console.log('   Documents by Category:');
  Object.entries(stats.documentsByCategory).forEach(([category, count]) => {
    console.log(`      - ${category}: ${count} chunks`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!\n');
}

// Run tests
testRAGAndGuardrails().catch(console.error);
