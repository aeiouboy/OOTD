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
  /** Reject likely model/person shots to keep item-only flat-lay */
  rejectLikelyModelShots: true,
  /** Skin ratio threshold for model-shot rejection (lower = stricter) */
  modelShotSkinRatioThreshold: (() => {
    const parsed = Number(process.env.PRODUCT_IMAGE_MODEL_SKIN_THRESHOLD || '0.016');
    if (!Number.isFinite(parsed)) return 0.016;
    // Keep strict by default. Higher values allow too many on-model images.
    return Math.min(Math.max(parsed, 0.006), 0.03);
  })(),
  /** Additional ratio checks in upper regions where faces/arms usually appear */
  modelShotUpperSkinRatioThreshold: (() => {
    const parsed = Number(process.env.PRODUCT_IMAGE_MODEL_UPPER_SKIN_THRESHOLD || '0.04');
    if (!Number.isFinite(parsed)) return 0.04;
    return Math.min(Math.max(parsed, 0.01), 0.12);
  })(),
  modelShotCenterUpperSkinRatioThreshold: (() => {
    const parsed = Number(process.env.PRODUCT_IMAGE_MODEL_CENTER_SKIN_THRESHOLD || '0.06');
    if (!Number.isFinite(parsed)) return 0.06;
    return Math.min(Math.max(parsed, 0.015), 0.18);
  })(),
  modelShotTopSkinRatioThreshold: (() => {
    const parsed = Number(process.env.PRODUCT_IMAGE_MODEL_TOP_SKIN_THRESHOLD || '0.08');
    if (!Number.isFinite(parsed)) return 0.08;
    return Math.min(Math.max(parsed, 0.02), 0.25);
  })(),
  /** Ignore tiny skin-like noise blobs */
  modelShotMinSkinPixels: (() => {
    const parsed = Number(process.env.PRODUCT_IMAGE_MODEL_MIN_SKIN_PIXELS || '140');
    if (!Number.isFinite(parsed)) return 140;
    return Math.min(Math.max(Math.round(parsed), 40), 2500);
  })(),
};

/**
 * Background removal is optional.
 * If rembg is not installed, we auto-disable it for this process and continue
 * with original product images so hybrid generation still works.
 */
const DISABLE_PRODUCT_BG_REMOVAL = process.env.DISABLE_PRODUCT_BG_REMOVAL === 'true';
let isBackgroundRemovalEnabled = !DISABLE_PRODUCT_BG_REMOVAL;
let hasLoggedBackgroundRemovalDisabled = false;

/**
 * Prefer a project-local Python venv for image scripts so rembg/pillow
 * do not depend on the system-wide python3 environment.
 */
const PROJECT_ROOT = path.join(process.cwd(), '..', '..');
const IMAGE_PROCESSING_DIR = path.join(PROJECT_ROOT, 'scripts', 'image_processing');

function resolvePythonBinary(): string {
  const configured = process.env.PRODUCT_IMAGE_PYTHON_BIN?.trim();
  if (configured) {
    return configured;
  }

  const candidates = process.platform === 'win32'
    ? [path.join(IMAGE_PROCESSING_DIR, '.venv', 'Scripts', 'python.exe')]
    : [
      path.join(IMAGE_PROCESSING_DIR, '.venv', 'bin', 'python3'),
      path.join(IMAGE_PROCESSING_DIR, '.venv', 'bin', 'python'),
    ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return 'python3';
}

const PYTHON_BINARY = resolvePythonBinary();

function isRembgMissingError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("no module named 'rembg'") ||
    lower.includes('required library not found') ||
    lower.includes('install required libraries with: pip install rembg')
  );
}

function isClothingCategory(category: string): boolean {
  const c = (category || '').toLowerCase();
  return (
    c.includes('dress') ||
    c.includes('shirt') ||
    c.includes('blouse') ||
    c.includes('top') ||
    c.includes('pants') ||
    c.includes('trouser') ||
    c.includes('skirt') ||
    c.includes('jeans') ||
    c.includes('jumpsuit') ||
    c.includes('romper') ||
    c.includes('clothing') ||
    c.includes('shoe') ||
    c.includes('footwear') ||
    c.includes('sandal') ||
    c.includes('heel') ||
    c.includes('boot') ||
    c.includes('sneaker')
  );
}

function isLightColorLabel(color?: string): boolean {
  if (!color) return false;
  const c = color.toLowerCase();
  return (
    c.includes('white') ||
    c.includes('ivory') ||
    c.includes('cream') ||
    c.includes('off white') ||
    c.includes('off-white') ||
    c.includes('beige') ||
    c.includes('nude') ||
    c.includes('champagne')
  );
}

function isLikelySkinPixel(r: number, g: number, b: number): boolean {
  // Conservative skin heuristic in RGB + YCbCr space.
  // Tight bounds reduce false positives on beige garments.
  if (!(r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15)) {
    return false;
  }
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return cb >= 80 && cb <= 123 && cr >= 136 && cr <= 173;
}

type ModelShotDetectionResult = {
  likelyModelShot: boolean;
  skinRatio: number;
  upperSkinRatio: number;
  centerUpperSkinRatio: number;
  topSkinRatio: number;
  reason: string;
};

async function detectLikelyModelShot(inputBuffer: Buffer): Promise<ModelShotDetectionResult> {
  try {
    const sharpModule = await import('sharp');
    const sharp = sharpModule.default;
    const { data, info } = await sharp(inputBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = info.width * info.height;
    if (!pixels) {
      return {
        likelyModelShot: false,
        skinRatio: 0,
        upperSkinRatio: 0,
        centerUpperSkinRatio: 0,
        topSkinRatio: 0,
        reason: 'empty-image',
      };
    }

    let opaque = 0;
    let skin = 0;
    let upperOpaque = 0;
    let upperSkin = 0;
    let centerUpperOpaque = 0;
    let centerUpperSkin = 0;
    let topOpaque = 0;
    let topSkin = 0;

    const upperBandEndY = Math.max(1, Math.floor(info.height * 0.45));
    const topBandEndY = Math.max(1, Math.floor(info.height * 0.22));
    const centerStartX = Math.floor(info.width * 0.2);
    const centerEndX = Math.ceil(info.width * 0.8);

    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const i = y * info.width + x;
        const idx = i * 4;
        const a = data[idx + 3];
        if (a < 20) continue;

        opaque++;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const isSkin = isLikelySkinPixel(r, g, b);

        if (isSkin) skin++;

        if (y < upperBandEndY) {
          upperOpaque++;
          if (isSkin) upperSkin++;
        }

        if (y < upperBandEndY && x >= centerStartX && x <= centerEndX) {
          centerUpperOpaque++;
          if (isSkin) centerUpperSkin++;
        }

        if (y < topBandEndY) {
          topOpaque++;
          if (isSkin) topSkin++;
        }
      }
    }

    if (!opaque) {
      return {
        likelyModelShot: false,
        skinRatio: 0,
        upperSkinRatio: 0,
        centerUpperSkinRatio: 0,
        topSkinRatio: 0,
        reason: 'fully-transparent',
      };
    }

    const skinRatio = skin / opaque;
    const upperSkinRatio = upperOpaque > 0 ? upperSkin / upperOpaque : 0;
    const centerUpperSkinRatio = centerUpperOpaque > 0 ? centerUpperSkin / centerUpperOpaque : 0;
    const topSkinRatio = topOpaque > 0 ? topSkin / topOpaque : 0;

    const minSkinPixels = PROCESSOR_CONFIG.modelShotMinSkinPixels;
    const minUpperSkinPixels = Math.max(40, Math.floor(minSkinPixels * 0.35));
    const minCenterUpperSkinPixels = Math.max(24, Math.floor(minSkinPixels * 0.22));
    const minTopSkinPixels = Math.max(18, Math.floor(minSkinPixels * 0.16));

    const globalHit =
      skin >= minSkinPixels &&
      skinRatio > PROCESSOR_CONFIG.modelShotSkinRatioThreshold;
    const upperHit =
      upperSkin >= minUpperSkinPixels &&
      upperSkinRatio > PROCESSOR_CONFIG.modelShotUpperSkinRatioThreshold;
    const centerUpperHit =
      centerUpperSkin >= minCenterUpperSkinPixels &&
      centerUpperSkinRatio > PROCESSOR_CONFIG.modelShotCenterUpperSkinRatioThreshold;
    const topHit =
      topSkin >= minTopSkinPixels &&
      topSkinRatio > PROCESSOR_CONFIG.modelShotTopSkinRatioThreshold;

    let reason = 'none';
    if (centerUpperHit) reason = 'center-upper-skin';
    else if (topHit) reason = 'top-skin';
    else if (upperHit) reason = 'upper-skin';
    else if (globalHit) reason = 'global-skin';

    return {
      likelyModelShot: globalHit || upperHit || centerUpperHit || topHit,
      skinRatio,
      upperSkinRatio,
      centerUpperSkinRatio,
      topSkinRatio,
      reason,
    };
  } catch {
    return {
      likelyModelShot: false,
      skinRatio: 0,
      upperSkinRatio: 0,
      centerUpperSkinRatio: 0,
      topSkinRatio: 0,
      reason: 'detection-failed',
    };
  }
}

/**
 * Fetches a product image from URL and returns it as a buffer
 *
 * @param url - URL of the product image
 * @returns Promise resolving to image buffer
 */
export async function fetchProductImage(url: string): Promise<Buffer> {
  const normalizeProductImageUrl = (inputUrl: string): string => {
    try {
      const parsed = new URL(inputUrl);
      if (!parsed.pathname.includes('/_next/image')) return inputUrl;

      const rawSource = parsed.searchParams.get('url');
      if (!rawSource) return inputUrl;

      let decoded = rawSource;
      try {
        decoded = decodeURIComponent(rawSource);
      } catch {
        // keep rawSource
      }

      if (decoded.startsWith('//')) return `https:${decoded}`;
      if (decoded.startsWith('/')) return `${parsed.origin}${decoded}`;
      if (/^https?:\/\//i.test(decoded)) return decoded;
      return inputUrl;
    } catch {
      return inputUrl;
    }
  };

  const sourceUrl = normalizeProductImageUrl(url);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROCESSOR_CONFIG.fetchTimeout);

  try {
    let response = await fetch(sourceUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'OOTDay-Fashion-Assistant/1.0',
        Accept: 'image/*',
      },
    });

    // Fallback to original URL if normalized source fails.
    if (!response.ok && sourceUrl !== url) {
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'OOTDay-Fashion-Assistant/1.0',
          Accept: 'image/*',
        },
      });
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText} (${sourceUrl})`);
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

    const scriptPath = path.join(IMAGE_PROCESSING_DIR, 'remove_bg_rembg.py');

    console.log('[ProductImageProcessor] Running background removal:', {
      inputPath,
      outputPath,
      scriptPath,
      python: PYTHON_BINARY,
    });

    const python = spawn(PYTHON_BINARY, [scriptPath, inputPath, outputPath]);

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
        const errorMessage = `Background removal failed with code ${code}: ${stderr}`;
        if (isRembgMissingError(errorMessage)) {
          // Avoid spamming full traceback logs when rembg is missing.
          if (!hasLoggedBackgroundRemovalDisabled) {
            console.warn(
              '[ProductImageProcessor] rembg dependency is missing. ' +
              'Background removal will be skipped and original product images will be used.'
            );
          }
        } else {
          console.error('[ProductImageProcessor] Background removal failed:', stderr);
        }
        reject(new Error(errorMessage));
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

    const scriptPath = path.join(IMAGE_PROCESSING_DIR, 'auto_crop_subject.py');

    console.log('[ProductImageProcessor] Running auto-crop:', {
      inputPath,
      outputPath,
      python: PYTHON_BINARY,
    });

    const python = spawn(PYTHON_BINARY, [scriptPath, inputPath, outputPath]);

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
 * Trims uniform white-ish outer borders when background removal is unavailable.
 * This reduces card-like white margins from catalog images.
 */
async function trimUniformBorders(inputBuffer: Buffer): Promise<Buffer> {
  try {
    const sharpModule = await import('sharp');
    const sharp = sharpModule.default;

    const originalMeta = await sharp(inputBuffer).metadata();
    if (!originalMeta.width || !originalMeta.height) return inputBuffer;

    const trimmedBuffer = await sharp(inputBuffer)
      .trim({
        background: { r: 255, g: 255, b: 255 },
        threshold: 12,
      })
      .png()
      .toBuffer();

    const trimmedMeta = await sharp(trimmedBuffer).metadata();
    if (!trimmedMeta.width || !trimmedMeta.height) return inputBuffer;

    const originalArea = originalMeta.width * originalMeta.height;
    const trimmedArea = trimmedMeta.width * trimmedMeta.height;
    const areaRatio = trimmedArea / originalArea;

    // Keep conservative bounds to avoid over-trimming white garments.
    if (areaRatio > 0.98 || areaRatio < 0.2) {
      return inputBuffer;
    }

    return trimmedBuffer;
  } catch {
    return inputBuffer;
  }
}

/**
 * Measures how much of the image is already transparent.
 */
async function getTransparencyRatio(inputBuffer: Buffer): Promise<number> {
  try {
    const sharpModule = await import('sharp');
    const sharp = sharpModule.default;
    const { data, info } = await sharp(inputBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const totalPixels = info.width * info.height;
    if (!totalPixels) return 0;

    let transparent = 0;
    for (let i = 0; i < totalPixels; i++) {
      if (data[i * 4 + 3] < 20) transparent++;
    }
    return transparent / totalPixels;
  } catch {
    return 0;
  }
}

/**
 * Removes light edge background via flood-fill from borders.
 * Helps when rembg keeps a full white/gray card around the product.
 */
async function removeEdgeBackgroundByFloodFill(inputBuffer: Buffer): Promise<Buffer> {
  try {
    const sharpModule = await import('sharp');
    const sharp = sharpModule.default;

    const { data, info } = await sharp(inputBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;
    if (!width || !height) return inputBuffer;

    const pixelCount = width * height;
    const visited = new Uint8Array(pixelCount);

    const patchSize = Math.max(4, Math.min(14, Math.floor(Math.min(width, height) / 24)));
    const samplePatch = (startX: number, startY: number) => {
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (let y = startY; y < Math.min(startY + patchSize, height); y++) {
        for (let x = startX; x < Math.min(startX + patchSize, width); x++) {
          const idx = (y * width + x) * 4;
          if (data[idx + 3] < 20) continue;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          count++;
        }
      }
      if (!count) return { r: 240, g: 240, b: 240 };
      return { r: r / count, g: g / count, b: b / count };
    };

    const cornerMeans = [
      samplePatch(0, 0),
      samplePatch(Math.max(0, width - patchSize), 0),
      samplePatch(0, Math.max(0, height - patchSize)),
      samplePatch(Math.max(0, width - patchSize), Math.max(0, height - patchSize)),
    ];

    const colorDistanceSq = (r: number, g: number, b: number, c: { r: number; g: number; b: number }) => {
      const dr = r - c.r;
      const dg = g - c.g;
      const db = b - c.b;
      return dr * dr + dg * dg + db * db;
    };

    const isBackgroundLike = (idx: number): boolean => {
      const a = data[idx + 3];
      if (a < 20) return false;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const brightness = (r + g + b) / 3;

      if (brightness < 165) return false;
      if (maxC - minC > 42) return false;

      let minDistanceSq = Infinity;
      for (const c of cornerMeans) {
        const d = colorDistanceSq(r, g, b, c);
        if (d < minDistanceSq) minDistanceSq = d;
      }

      return minDistanceSq <= 52 * 52;
    };

    const queue: number[] = [];
    const enqueue = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const index = y * width + x;
      if (visited[index]) return;
      const idx = index * 4;
      if (!isBackgroundLike(idx)) return;
      visited[index] = 1;
      queue.push(index);
    };

    for (let x = 0; x < width; x++) {
      enqueue(x, 0);
      enqueue(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      enqueue(0, y);
      enqueue(width - 1, y);
    }

    // Seed detached "paper/card" regions: scan from each border to first opaque
    // pixel and test that pixel as potential removable background.
    const rayStep = Math.max(1, Math.floor(Math.min(width, height) / 128));
    for (let x = 0; x < width; x += rayStep) {
      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * 4;
        if (data[idx + 3] >= 20) {
          enqueue(x, y);
          break;
        }
      }
      for (let y = height - 1; y >= 0; y--) {
        const idx = (y * width + x) * 4;
        if (data[idx + 3] >= 20) {
          enqueue(x, y);
          break;
        }
      }
    }
    for (let y = 0; y < height; y += rayStep) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (data[idx + 3] >= 20) {
          enqueue(x, y);
          break;
        }
      }
      for (let x = width - 1; x >= 0; x--) {
        const idx = (y * width + x) * 4;
        if (data[idx + 3] >= 20) {
          enqueue(x, y);
          break;
        }
      }
    }

    let removed = 0;
    while (queue.length > 0) {
      const index = queue.pop() as number;
      const idx = index * 4;
      if (data[idx + 3] >= 20) {
        data[idx + 3] = 0;
        removed++;
      }

      const x = index % width;
      const y = Math.floor(index / width);
      enqueue(x - 1, y);
      enqueue(x + 1, y);
      enqueue(x, y - 1);
      enqueue(x, y + 1);
    }

    if (removed < pixelCount * 0.01) {
      return inputBuffer;
    }

    return await sharp(data, {
      raw: {
        width,
        height,
        channels: 4,
      },
    }).png().toBuffer();
  } catch {
    return inputBuffer;
  }
}

/**
 * Processes a single product image through the full pipeline
 *
 * @param item - Flat-lay item with thumbnail URL
 * @returns Promise resolving to processed product image
 */
export async function processProductImage(item: FlatLayItem): Promise<ProcessedProductImage> {
  return processProductImageInternal(item, { skipModelShotCheck: false });
}

async function processProductImageInternal(
  item: FlatLayItem,
  options: { skipModelShotCheck: boolean }
): Promise<ProcessedProductImage> {
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

    // Step 2: Remove background (optional, fallback to original image if unavailable)
    let bgRemovedBuffer = imageBuffer;
    let usedBackgroundRemoval = false;
    if (isBackgroundRemovalEnabled) {
      try {
        bgRemovedBuffer = await removeProductBackground(imageBuffer);
        usedBackgroundRemoval = true;
        console.log(`[ProductImageProcessor] Background removed, ${bgRemovedBuffer.length} bytes`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (isRembgMissingError(errorMessage)) {
          isBackgroundRemovalEnabled = false;
          if (!hasLoggedBackgroundRemovalDisabled) {
            console.warn(
              '[ProductImageProcessor] rembg is not installed; background removal disabled for this run. ' +
              'Using original product images instead.'
            );
            hasLoggedBackgroundRemovalDisabled = true;
          }
        } else {
          console.warn(
            `[ProductImageProcessor] Background removal failed for "${item.name}", using original image: ${errorMessage}`
          );
        }
      }
    }

    // Step 3: If no alpha mask is available, trim white-ish borders first.
    const preparedBuffer = usedBackgroundRemoval
      ? bgRemovedBuffer
      : await trimUniformBorders(bgRemovedBuffer);

    // If image is still mostly opaque, we can optionally try an extra border
    // flood-fill pass to remove white/gray catalog cards.
    // Guardrails are strict for light garments to avoid erasing white clothing.
    let workingBuffer = preparedBuffer;
    const transparencyBefore = await getTransparencyRatio(workingBuffer);
    const lightColorItem = isLightColorLabel(item.color);

    // Skip aggressive edge cleanup for light garments when rembg succeeded.
    // This protects white/off-white products from being over-erased.
    const shouldTryEdgeCleanup =
      transparencyBefore < 0.98 &&
      (!usedBackgroundRemoval || (!lightColorItem && transparencyBefore < 0.9));

    if (shouldTryEdgeCleanup) {
      const edgeCleaned = await removeEdgeBackgroundByFloodFill(workingBuffer);
      const transparencyAfter = await getTransparencyRatio(edgeCleaned);
      const transparencyGain = transparencyAfter - transparencyBefore;
      const opaqueRatioAfter = 1 - transparencyAfter;
      const isLikelyOverErased = opaqueRatioAfter < 0.06;
      const tooAggressiveForRembg = usedBackgroundRemoval && transparencyGain > 0.25;

      if (
        transparencyGain > 0.005 &&
        !isLikelyOverErased &&
        !tooAggressiveForRembg
      ) {
        workingBuffer = edgeCleaned;
        console.log(
          `[ProductImageProcessor] Edge background cleanup improved transparency: ${transparencyBefore.toFixed(3)} -> ${transparencyAfter.toFixed(3)}`
        );
      } else if (transparencyGain > 0.005) {
        console.log(
          `[ProductImageProcessor] Skipped edge cleanup to protect product details: ` +
          `gain=${transparencyGain.toFixed(3)}, opaqueAfter=${opaqueRatioAfter.toFixed(3)}, usedRembg=${usedBackgroundRemoval}, lightColor=${lightColorItem}`
        );
      }
    }

    // Step 4: Auto-crop to subject
    const croppedBuffer = await autoCropToSubject(workingBuffer);
    console.log(`[ProductImageProcessor] Cropped, ${croppedBuffer.length} bytes`);

    // Step 5: Reject model/person shots for clothing items (we need item-only flat-lay assets)
    if (!options.skipModelShotCheck && PROCESSOR_CONFIG.rejectLikelyModelShots && isClothingCategory(item.category)) {
      const modelCheck = await detectLikelyModelShot(croppedBuffer);
      if (modelCheck.likelyModelShot) {
        throw new Error(
          `Likely model-shot image detected (${modelCheck.reason}; ` +
          `skin=${modelCheck.skinRatio.toFixed(3)}, upper=${modelCheck.upperSkinRatio.toFixed(3)}, ` +
          `centerUpper=${modelCheck.centerUpperSkinRatio.toFixed(3)}, top=${modelCheck.topSkinRatio.toFixed(3)}), ` +
          `rejecting for flat-lay`
        );
      }
    }

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
  const results: Array<ProcessedProductImage | undefined> = new Array(items.length);
  const queue = items.map((item, index) => ({ item, index }));
  const inProgress: Promise<void>[] = [];

  console.log(`[ProductImageProcessor] Processing ${items.length} items with concurrency ${PROCESSOR_CONFIG.maxConcurrency}`);

  const processNext = async (): Promise<void> => {
    const queued = queue.shift();
    if (!queued) return;

    const result = await processProductImageInternal(queued.item, { skipModelShotCheck: false });
    results[queued.index] = result;

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

  // Preserve exact input order, even when SKUs are duplicated.
  const orderedResults: ProcessedProductImage[] = results.map((result, index) => {
    if (result) return result;

    const item = items[index];
    return {
      sku: item.sku || 'unknown',
      name: item.name,
      category: item.category,
      imageBase64: '',
      originalDimensions: { width: 0, height: 0 },
      success: false,
      error: 'Processing did not return a result',
    };
  });

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
