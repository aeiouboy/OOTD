/**
 * Product Image Processor
 * Handles fetching, background removal, and processing of product images
 * for hybrid flat-lay composition.
 *
 * Pipeline: Fetch → Background Removal (rembg) → Auto-crop → Return base64
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import type { FlatLayItem, ProcessedProductImage } from '@/lib/types/image-types';

/**
 * Configuration for product image processing
 */
const PROCESSOR_CONFIG = {
  /** Maximum concurrent image processing operations */
  maxConcurrency: 5,
  /** Timeout for fetching a single image (ms) */
  fetchTimeout: 10000,
  /** Timeout for background removal (ms) */
  bgRemovalTimeout: 30000,
  /** Minimum image dimension (skip if smaller) */
  minDimension: 50,
  /** Target dimension for processed images */
  targetDimension: 512,
};

/**
 * Fetches a product image from URL and returns it as a buffer
 *
 * @param url - URL of the product image
 * @returns Promise resolving to image buffer
 */
export async function fetchProductImage(url: string): Promise<Buffer> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROCESSOR_CONFIG.fetchTimeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'OOTDay-Fashion-Assistant/1.0',
        Accept: 'image/*',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Image fetch timeout after ${PROCESSOR_CONFIG.fetchTimeout}ms`);
    }
    throw error;
  }
}

/**
 * Removes background from an image using the Python rembg script
 *
 * @param inputBuffer - Image buffer to process
 * @returns Promise resolving to image buffer with transparent background
 */
export async function removeProductBackground(inputBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Create temp files for input/output
    const tempDir = os.tmpdir();
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const inputPath = path.join(tempDir, `product-input-${timestamp}-${randomSuffix}.png`);
    const outputPath = path.join(tempDir, `product-output-${timestamp}-${randomSuffix}.png`);

    // Write input buffer to temp file
    fs.writeFileSync(inputPath, inputBuffer);

    // Path to the rembg script (relative to apps/web)
    const scriptPath = path.join(process.cwd(), '..', '..', 'scripts', 'image_processing', 'remove_bg_rembg.py');

    console.log('[ProductImageProcessor] Running background removal:', {
      inputPath,
      outputPath,
      scriptPath,
    });

    const python = spawn('python3', [scriptPath, inputPath, outputPath]);

    let stderr = '';
    const timeout = setTimeout(() => {
      python.kill();
      cleanup();
      reject(new Error(`Background removal timeout after ${PROCESSOR_CONFIG.bgRemovalTimeout}ms`));
    }, PROCESSOR_CONFIG.bgRemovalTimeout);

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const cleanup = () => {
      // Clean up temp files
      try {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } catch {
        // Ignore cleanup errors
      }
    };

    python.on('close', (code) => {
      clearTimeout(timeout);

      if (code === 0 && fs.existsSync(outputPath)) {
        const outputBuffer = fs.readFileSync(outputPath);
        cleanup();
        console.log('[ProductImageProcessor] Background removal completed successfully');
        resolve(outputBuffer);
      } else {
        cleanup();
        console.error('[ProductImageProcessor] Background removal failed:', stderr);
        reject(new Error(`Background removal failed with code ${code}: ${stderr}`));
      }
    });

    python.on('error', (err) => {
      clearTimeout(timeout);
      cleanup();
      console.error('[ProductImageProcessor] Failed to spawn background removal process:', err);
      reject(err);
    });
  });
}

/**
 * Auto-crops an image to the bounding box of non-transparent pixels
 *
 * @param inputBuffer - Image buffer with transparent background
 * @returns Promise resolving to cropped image buffer
 */
export async function autoCropToSubject(inputBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir();
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const inputPath = path.join(tempDir, `crop-input-${timestamp}-${randomSuffix}.png`);
    const outputPath = path.join(tempDir, `crop-output-${timestamp}-${randomSuffix}.png`);

    fs.writeFileSync(inputPath, inputBuffer);

    const scriptPath = path.join(process.cwd(), '..', '..', 'scripts', 'image_processing', 'auto_crop_subject.py');

    console.log('[ProductImageProcessor] Running auto-crop:', { inputPath, outputPath });

    const python = spawn('python3', [scriptPath, inputPath, outputPath]);

    let stderr = '';
    const timeout = setTimeout(() => {
      python.kill();
      cleanup();
      // Return original buffer if crop times out
      resolve(inputBuffer);
    }, 10000);

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const cleanup = () => {
      try {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } catch {
        // Ignore cleanup errors
      }
    };

    python.on('close', (code) => {
      clearTimeout(timeout);

      if (code === 0 && fs.existsSync(outputPath)) {
        const outputBuffer = fs.readFileSync(outputPath);
        cleanup();
        console.log('[ProductImageProcessor] Auto-crop completed successfully');
        resolve(outputBuffer);
      } else {
        cleanup();
        console.warn('[ProductImageProcessor] Auto-crop failed, using original:', stderr);
        // Return original buffer if crop fails
        resolve(inputBuffer);
      }
    });

    python.on('error', (err) => {
      clearTimeout(timeout);
      cleanup();
      console.warn('[ProductImageProcessor] Auto-crop process error, using original:', err);
      resolve(inputBuffer);
    });
  });
}

/**
 * Processes a single product image through the full pipeline
 *
 * @param item - Flat-lay item with thumbnail URL
 * @returns Promise resolving to processed product image
 */
export async function processProductImage(item: FlatLayItem): Promise<ProcessedProductImage> {
  const result: ProcessedProductImage = {
    sku: item.sku || 'unknown',
    name: item.name,
    category: item.category,
    imageBase64: '',
    originalDimensions: { width: 0, height: 0 },
    success: false,
  };

  if (!item.thumbnailUrl) {
    result.error = 'No thumbnail URL provided';
    return result;
  }

  try {
    console.log(`[ProductImageProcessor] Processing: ${item.name} (${item.sku})`);

    // Step 1: Fetch the product image
    const imageBuffer = await fetchProductImage(item.thumbnailUrl);
    console.log(`[ProductImageProcessor] Fetched ${imageBuffer.length} bytes`);

    // Step 2: Remove background
    const bgRemovedBuffer = await removeProductBackground(imageBuffer);
    console.log(`[ProductImageProcessor] Background removed, ${bgRemovedBuffer.length} bytes`);

    // Step 3: Auto-crop to subject
    const croppedBuffer = await autoCropToSubject(bgRemovedBuffer);
    console.log(`[ProductImageProcessor] Cropped, ${croppedBuffer.length} bytes`);

    // Convert to base64
    result.imageBase64 = `data:image/png;base64,${croppedBuffer.toString('base64')}`;
    result.success = true;

    // Get dimensions using Sharp (if available) or estimate
    try {
      const sharp = await import('sharp');
      const metadata = await sharp.default(croppedBuffer).metadata();
      result.originalDimensions = {
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch {
      // Sharp not available or failed, use default dimensions
      result.originalDimensions = { width: 512, height: 512 };
    }

    console.log(`[ProductImageProcessor] Success: ${item.name}`, result.originalDimensions);
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown processing error';
    console.error(`[ProductImageProcessor] Failed: ${item.name}`, result.error);
  }

  return result;
}

/**
 * Processes multiple product images in parallel with concurrency control
 *
 * @param items - Array of flat-lay items to process
 * @returns Promise resolving to array of processed images
 */
export async function processProductImagesParallel(
  items: FlatLayItem[]
): Promise<ProcessedProductImage[]> {
  const results: ProcessedProductImage[] = [];
  const queue = [...items];
  const inProgress: Promise<void>[] = [];

  console.log(`[ProductImageProcessor] Processing ${items.length} items with concurrency ${PROCESSOR_CONFIG.maxConcurrency}`);

  const processNext = async (): Promise<void> => {
    const item = queue.shift();
    if (!item) return;

    const result = await processProductImage(item);
    results.push(result);

    // Process next item if queue not empty
    if (queue.length > 0) {
      await processNext();
    }
  };

  // Start initial batch of concurrent operations
  const initialBatch = Math.min(PROCESSOR_CONFIG.maxConcurrency, items.length);
  for (let i = 0; i < initialBatch; i++) {
    inProgress.push(processNext());
  }

  // Wait for all operations to complete
  await Promise.all(inProgress);

  // Sort results to match input order
  const orderedResults: ProcessedProductImage[] = [];
  for (const item of items) {
    const result = results.find((r) => r.sku === (item.sku || 'unknown'));
    if (result) {
      orderedResults.push(result);
    }
  }

  const successCount = orderedResults.filter((r) => r.success).length;
  console.log(`[ProductImageProcessor] Completed: ${successCount}/${items.length} successful`);

  return orderedResults;
}

/**
 * Fetches image and returns as base64 without background removal
 * Useful for fallback when rembg is not available
 *
 * @param url - Image URL
 * @returns Promise resolving to base64 image string
 */
export async function fetchImageAsBase64(url: string): Promise<string> {
  const buffer = await fetchProductImage(url);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}
