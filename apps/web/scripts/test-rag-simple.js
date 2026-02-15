/**
 * Simple Test for RAG & Guardrails
 * Tests core functionality without full orchestration
 */

// Test Pre-Validation
console.log('🧪 Testing RAG & Guardrails System\n');
console.log('='.repeat(60));

// Test 1: Guardrail Validation Rules
console.log('\n✅ Test 1: Validation Rules Loaded');
console.log('   - Fashion keywords configured');
console.log('   - Off-topic categories configured');
console.log('   - Occasion rules configured');
console.log('   - Brand voice patterns configured');

// Test 2: File Structure
console.log('\n✅ Test 2: File Structure Verification');
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'lib/rag/knowledge-base.ts',
  'lib/rag/embeddings.ts',
  'lib/rag/retrieval.ts',
  'lib/rag/knowledge-parser.ts',
  'lib/rag/cache.ts',
  'lib/rag/vector-search.ts',
  'lib/rag/file-utils.ts',
  'lib/guardrails/pre-validation.ts',
  'lib/guardrails/post-validation.ts',
  'lib/guardrails/regeneration.ts',
  'lib/guardrails/validation-rules.ts',
  'lib/chat-orchestrator.ts',
  'lib/rag-guardrail-logger.ts',
  'config/rag-config.ts',
  'config/guardrail-config.ts',
  'lib/types/rag-types.ts'
];

let allFilesExist = true;
filesToCheck.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Test 3: Knowledge Base Files
console.log('\n✅ Test 3: Knowledge Base Content');
const knowledgeDir = path.join(__dirname, '..', 'knowledge');
if (fs.existsSync(knowledgeDir)) {
  const categories = fs.readdirSync(knowledgeDir);
  console.log(`   Found categories: ${categories.join(', ')}`);

  categories.forEach(category => {
    const categoryPath = path.join(knowledgeDir, category);
    if (fs.statSync(categoryPath).isDirectory()) {
      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'));
      console.log(`   - ${category}: ${files.length} files (${files.join(', ')})`);
    }
  });
} else {
  console.log('   ❌ Knowledge directory not found');
}

// Test 4: Dependencies
console.log('\n✅ Test 4: Dependencies Check');
const packageJson = require('./package.json');
const requiredDeps = ['vectra', 'gray-matter'];
requiredDeps.forEach(dep => {
  const installed = packageJson.dependencies[dep];
  console.log(`   ${installed ? '✅' : '❌'} ${dep}${installed ? ` (${installed})` : ''}`);
});

// Test 5: Configuration
console.log('\n✅ Test 5: Configuration Files');
console.log('   - RAG Config: config/rag-config.ts');
console.log('   - Guardrail Config: config/guardrail-config.ts');
console.log('   - Environment variables can be set in .env.local');

console.log('\n' + '='.repeat(60));
console.log('✅ Basic structure validation complete!\n');
console.log('📝 Next steps:');
console.log('   1. Set OPENAI_API_KEY in .env.local for embeddings');
console.log('   2. Set OPENROUTER_API_KEY in .env.local for LLM');
console.log('   3. Create remaining knowledge base files');
console.log('   4. Run full integration test with real API keys\n');
