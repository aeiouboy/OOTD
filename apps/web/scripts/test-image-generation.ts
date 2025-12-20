/**
 * Image Generation Test Script
 * Tests the OpenRouter image generation service with Gemini 3 Pro Image Preview model
 * 
 * Usage:
 *   npx tsx scripts/test-image-generation.ts
 */

import { OpenRouterImageClient } from '../lib/services/image-generation-service';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testImageGeneration() {
    console.log('=== Image Generation Service Test ===\n');

    // 1. Check API Key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error('❌ OPENROUTER_API_KEY not found in environment');
        console.log('Please set OPENROUTER_API_KEY in .env.local');
        process.exit(1);
    }
    console.log('✅ API Key found');

    // 2. Create client
    let client: OpenRouterImageClient;
    try {
        client = new OpenRouterImageClient(apiKey);
        console.log('✅ OpenRouter client created successfully\n');
    } catch (error) {
        console.error('❌ Failed to create client:', error);
        process.exit(1);
    }

    // 3. Test image generation
    const testDescription = 'A white cotton t-shirt with blue jeans, casual style, flat lay composition';

    console.log('🎨 Generating image...');
    console.log(`Description: "${testDescription}"\n`);

    try {
        const startTime = Date.now();
        const response = await client.generateOutfitImage(testDescription, {
            photographyStyle: 'professional',
            composition: 'flat-lay',
            lighting: 'natural',
            aestheticContext: 'thai-contemporary',
        });
        const duration = Date.now() - startTime;

        console.log(`⏱️  Generation took ${duration}ms\n`);

        if (response.success) {
            console.log('✅ Image generated successfully!');
            console.log(`Model: ${response.metadata?.model}`);
            console.log(`Generated at: ${response.metadata?.generatedAt}`);

            // Save image to file
            if (response.imageBase64) {
                const base64Data = response.imageBase64.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const outputPath = path.join(__dirname, '..', 'public', 'test-output.png');

                fs.writeFileSync(outputPath, buffer);
                console.log(`💾 Image saved to: ${outputPath}`);
                console.log(`📊 Image size: ${(buffer.length / 1024).toFixed(2)} KB`);
            } else if (response.imageUrl) {
                console.log(`🔗 Image URL: ${response.imageUrl}`);
            } else {
                console.warn('⚠️  No image data in response');
            }

            console.log('\n✅ Test PASSED');
        } else {
            console.error('❌ Image generation failed');
            console.error(`Error code: ${response.error}`);
            console.error(`Message: ${response.message}`);
            console.log('\n❌ Test FAILED');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Unexpected error during generation:', error);
        console.log('\n❌ Test FAILED');
        process.exit(1);
    }
}

// Run test
testImageGeneration().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
