/**
 * Image Compositor
 * Sharp-based image compositing for hybrid flat-lay generation.
 * Handles layering products onto backgrounds with proper positioning,
 * rotation, scaling, and drop shadow effects.
 */

import sharp from 'sharp';
import type { ProcessedProductImage, ProductLayoutConfig } from '@/lib/types/image-types';

/**
 * Default canvas dimensions for flat-lay composition
 */
const DEFAULT_CANVAS = {
  width: 1024,
  height: 1024,
};

/**
 * Shadow configuration for product images
 */
const SHADOW_CONFIG = {
  /** Shadow blur radius */
  blur: 15,
  /** Shadow offset X */
  offsetX: 5,
  /** Shadow offset Y */
  offsetY: 8,
  /** Shadow opacity (0-1) */
  opacity: 0.15,
};

/**
 * Category to product type mapping for layout positioning
 */
const CATEGORY_TYPES: Record<string, 'main' | 'shoes' | 'accessory'> = {
  // Main garments
  dress: 'main',
  dresses: 'main',
  top: 'main',
  tops: 'main',
  blouse: 'main',
  shirt: 'main',
  pants: 'main',
  trousers: 'main',
  skirt: 'main',
  jacket: 'main',
  blazer: 'main',
  coat: 'main',
  sweater: 'main',
  cardigan: 'main',
  jumpsuit: 'main',
  romper: 'main',
  jeans: 'main',
  shorts: 'main',
  // Shoes
  shoes: 'shoes',
  shoe: 'shoes',
  footwear: 'shoes',
  heels: 'shoes',
  sneakers: 'shoes',
  sandals: 'shoes',
  boots: 'shoes',
  flats: 'shoes',
  loafers: 'shoes',
  // Accessories
  bag: 'accessory',
  bags: 'accessory',
  handbag: 'accessory',
  purse: 'accessory',
  accessory: 'accessory',
  accessories: 'accessory',
  jewelry: 'accessory',
  watch: 'accessory',
  belt: 'accessory',
  scarf: 'accessory',
  hat: 'accessory',
  sunglasses: 'accessory',
  necklace: 'accessory',
  earrings: 'accessory',
  bracelet: 'accessory',
};

const NAME_TYPE_HINTS: Record<'main' | 'shoes' | 'accessory', string[]> = {
  main: [
    'dress', 'shirt', 'blouse', 'top', 'tee', 't-shirt', 'tshirt',
    'pants', 'trouser', 'jeans', 'skirt', 'shorts', 'jacket', 'blazer',
    'cardigan', 'sweater', 'coat', 'jumpsuit', 'romper',
  ],
  shoes: [
    'shoe', 'sneaker', 'sandals', 'sandal', 'heels', 'heel', 'boots', 'boot',
    'loafers', 'loafer', 'flats', 'flat', 'mule', 'pump', 'oxford',
  ],
  accessory: [
    'bag', 'handbag', 'purse', 'belt', 'hat', 'scarf', 'watch',
    'sunglasses', 'earring', 'necklace', 'bracelet',
  ],
};

/**
 * Categorizes a product using category first, then product name hints.
 * Many catalog rows use generic categories (e.g. "clothing"), so name hints
 * prevent key items like pants from being laid out as accessories.
 */
function categorizeProduct(category: string, name?: string): 'main' | 'shoes' | 'accessory' {
  const lowerCategory = (category || '').toLowerCase().trim();
  if (CATEGORY_TYPES[lowerCategory]) {
    return CATEGORY_TYPES[lowerCategory];
  }

  const haystack = `${lowerCategory} ${(name || '').toLowerCase()}`;
  if (NAME_TYPE_HINTS.shoes.some((token) => haystack.includes(token))) return 'shoes';
  if (NAME_TYPE_HINTS.main.some((token) => haystack.includes(token))) return 'main';
  if (NAME_TYPE_HINTS.accessory.some((token) => haystack.includes(token))) return 'accessory';

  return 'accessory';
}

/**
 * Calculates layout positions for products in a flat-lay composition
 * Based on the FlatLayComposite.tsx CSS positioning logic
 *
 * @param items - Processed product images
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @returns Array of layout configurations matching item order
 */
export function calculateFlatLayLayout(
  items: ProcessedProductImage[],
  canvasWidth: number = DEFAULT_CANVAS.width,
  canvasHeight: number = DEFAULT_CANVAS.height
): ProductLayoutConfig[] {
  // Categorize items
  const mainItems: number[] = [];
  const shoeItems: number[] = [];
  const accessoryItems: number[] = [];

  items.forEach((item, index) => {
    const type = categorizeProduct(item.category, item.name);
    if (type === 'main') mainItems.push(index);
    else if (type === 'shoes') shoeItems.push(index);
    else accessoryItems.push(index);
  });

  // Ensure at least one main item (promote first item if needed)
  if (mainItems.length === 0 && items.length > 0) {
    mainItems.push(0);
    // Remove from other categories if present
    const idx = shoeItems.indexOf(0);
    if (idx !== -1) shoeItems.splice(idx, 1);
    const idx2 = accessoryItems.indexOf(0);
    if (idx2 !== -1) accessoryItems.splice(idx2, 1);
  }

  const layouts: ProductLayoutConfig[] = new Array(items.length);

  // Layout based on number of items
  if (items.length === 1) {
    // Single item: centered
    layouts[0] = {
      x: 0.5,
      y: 0.5,
      rotation: 0,
      scale: 0.7,
      zIndex: 1,
    };
  } else if (items.length === 2) {
    // Two items: side by side with slight rotation
    const firstType = categorizeProduct(items[0].category, items[0].name);
    const secondType = categorizeProduct(items[1].category, items[1].name);

    if (firstType === 'main') {
      layouts[0] = { x: 0.35, y: 0.45, rotation: -3, scale: 0.55, zIndex: 2 };
    } else {
      layouts[0] = { x: 0.3, y: 0.6, rotation: 4, scale: 0.4, zIndex: 1 };
    }

    if (secondType === 'main') {
      layouts[1] = { x: 0.65, y: 0.45, rotation: 4, scale: 0.55, zIndex: 2 };
    } else if (secondType === 'shoes') {
      layouts[1] = { x: 0.68, y: 0.65, rotation: -5, scale: 0.35, zIndex: 1 };
    } else {
      layouts[1] = { x: 0.7, y: 0.35, rotation: 6, scale: 0.3, zIndex: 1 };
    }
  } else {
    // Three or more items: deterministic non-overlapping arrangement.
    // Goal: avoid heavy stacking that looks like pasted cards.
    const primaryMain = mainItems[0];
    const secondaryMain = mainItems[1];
    const tertiaryMain = mainItems[2];

    if (items.length === 3) {
      // Common case: top + bottom + shoes (or 2 garments + 1 accent)
      if (typeof primaryMain === 'number') {
        layouts[primaryMain] = { x: 0.38, y: 0.28, rotation: -2, scale: 0.42, zIndex: 3 };
      }
      if (typeof secondaryMain === 'number') {
        layouts[secondaryMain] = { x: 0.38, y: 0.70, rotation: 2, scale: 0.34, zIndex: 2 };
      }
      if (shoeItems[0] !== undefined) {
        layouts[shoeItems[0]] = { x: 0.73, y: 0.72, rotation: -5, scale: 0.27, zIndex: 2 };
      }
      if (accessoryItems[0] !== undefined) {
        layouts[accessoryItems[0]] = { x: 0.73, y: 0.35, rotation: 5, scale: 0.22, zIndex: 2 };
      }
    } else {
      // 4+ items: spread into stable slots to minimize occlusion.
      if (typeof primaryMain === 'number') {
        layouts[primaryMain] = { x: 0.30, y: 0.30, rotation: -3, scale: 0.40, zIndex: 4 };
      }
      if (typeof secondaryMain === 'number') {
        layouts[secondaryMain] = { x: 0.62, y: 0.30, rotation: 3, scale: 0.36, zIndex: 3 };
      }
      if (typeof tertiaryMain === 'number') {
        layouts[tertiaryMain] = { x: 0.46, y: 0.66, rotation: -2, scale: 0.30, zIndex: 2 };
      }

      shoeItems.forEach((itemIdx, i) => {
        layouts[itemIdx] = {
          x: i % 2 === 0 ? 0.26 : 0.70,
          y: 0.73 + Math.min(i, 1) * 0.03,
          rotation: i % 2 === 0 ? -6 : 6,
          scale: 0.24,
          zIndex: 1,
        };
      });

      const accessoryPositions = [
        { x: 0.80, y: 0.20, rotation: 6, scale: 0.20, zIndex: 2 },
        { x: 0.18, y: 0.20, rotation: -6, scale: 0.20, zIndex: 2 },
        { x: 0.82, y: 0.52, rotation: 4, scale: 0.20, zIndex: 2 },
        { x: 0.16, y: 0.52, rotation: -4, scale: 0.20, zIndex: 2 },
      ];

      accessoryItems.forEach((itemIdx, i) => {
        const pos = accessoryPositions[i % accessoryPositions.length];
        layouts[itemIdx] = { ...pos };
      });
    }

    // Fill remaining items with deterministic fallback slots (no randomness).
    const fallbackSlots: ProductLayoutConfig[] = [
      { x: 0.50, y: 0.50, rotation: 0, scale: 0.28, zIndex: 1 },
      { x: 0.24, y: 0.46, rotation: -4, scale: 0.24, zIndex: 1 },
      { x: 0.76, y: 0.46, rotation: 4, scale: 0.24, zIndex: 1 },
      { x: 0.50, y: 0.80, rotation: 0, scale: 0.22, zIndex: 1 },
    ];
    let fallbackCursor = 0;
    items.forEach((_, idx) => {
      if (!layouts[idx]) {
        layouts[idx] = fallbackSlots[fallbackCursor % fallbackSlots.length];
        fallbackCursor++;
      }
    });
  }

  return layouts;
}

/**
 * Creates a drop shadow for an image
 *
 * @param imageBuffer - Image buffer to add shadow to
 * @param blur - Shadow blur radius
 * @param opacity - Shadow opacity (0-1)
 * @returns Promise resolving to shadow buffer (RGBA)
 */
async function createDropShadow(
  imageBuffer: Buffer,
  blur: number = SHADOW_CONFIG.blur,
  opacity: number = SHADOW_CONFIG.opacity
): Promise<Buffer> {
  // Create shadow by:
  // 1. Extract raw alpha channel
  // 2. Blur + apply opacity
  // 3. Build RGBA black image with that alpha
  const alphaRaw = await sharp(imageBuffer)
    .ensureAlpha()
    .extractChannel('alpha')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = alphaRaw.info.width;
  const height = alphaRaw.info.height;
  if (!width || !height) {
    throw new Error('Could not get image dimensions for shadow');
  }

  const blurredAlpha = await sharp(alphaRaw.data, {
    raw: {
      width,
      height,
      channels: 1,
    },
  })
    .blur(blur)
    .linear(opacity, 0)
    .raw()
    .toBuffer();

  const rgbaShadow = Buffer.alloc(width * height * 4);
  for (let i = 0; i < blurredAlpha.length; i++) {
    rgbaShadow[i * 4 + 3] = blurredAlpha[i];
  }

  const shadowBuffer = await sharp(rgbaShadow, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();

  return shadowBuffer;
}

/**
 * Resizes and rotates an image according to layout config
 *
 * @param imageBuffer - Image buffer to transform
 * @param layout - Layout configuration
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @returns Promise resolving to transformed image buffer
 */
async function transformImage(
  imageBuffer: Buffer,
  layout: ProductLayoutConfig,
  canvasWidth: number,
  canvasHeight: number
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const metadata = await sharp(imageBuffer).metadata();
  const origWidth = metadata.width || 512;
  const origHeight = metadata.height || 512;

  // Calculate target size based on scale
  const maxDimension = Math.min(canvasWidth, canvasHeight) * layout.scale;
  const aspectRatio = origWidth / origHeight;

  let targetWidth: number;
  let targetHeight: number;

  if (aspectRatio > 1) {
    targetWidth = Math.round(maxDimension);
    targetHeight = Math.round(maxDimension / aspectRatio);
  } else {
    targetHeight = Math.round(maxDimension);
    targetWidth = Math.round(maxDimension * aspectRatio);
  }

  // Resize and rotate
  let transformer = sharp(imageBuffer).resize(targetWidth, targetHeight, {
    fit: 'inside',
    withoutEnlargement: false,
  });

  if (layout.rotation !== 0) {
    transformer = transformer.rotate(layout.rotation, {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }

  const transformedBuffer = await transformer.png().toBuffer();
  const transformedMeta = await sharp(transformedBuffer).metadata();

  return {
    buffer: transformedBuffer,
    width: transformedMeta.width || targetWidth,
    height: transformedMeta.height || targetHeight,
  };
}

type PositionedLayer = {
  id: string
  sku: string
  zIndex: number
  buffer: Buffer
  width: number
  height: number
  left: number
  top: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getBox(layer: PositionedLayer) {
  return {
    left: layer.left,
    top: layer.top,
    right: layer.left + layer.width,
    bottom: layer.top + layer.height,
  };
}

function intersects(a: ReturnType<typeof getBox>, b: ReturnType<typeof getBox>): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

/**
 * Nudge lower-priority layers away from overlap to avoid heavy stacking.
 */
function resolveLayerCollisions(
  layers: PositionedLayer[],
  canvasWidth: number,
  canvasHeight: number
): PositionedLayer[] {
  if (layers.length <= 1) return layers;

  // Higher z-index and larger area stay more stable.
  const sorted = [...layers].sort((a, b) => {
    if (b.zIndex !== a.zIndex) return b.zIndex - a.zIndex;
    return b.width * b.height - a.width * a.height;
  });

  const placed: PositionedLayer[] = [];
  const step = 18;
  const margin = 8;

  for (const layer of sorted) {
    const current = { ...layer };

    for (let iter = 0; iter < 24; iter++) {
      const currentBox = getBox(current);
      const overlaps = placed.filter((p) => intersects(currentBox, getBox(p)));
      if (overlaps.length === 0) break;

      let pushX = 0;
      let pushY = 0;
      const cx = current.left + current.width / 2;
      const cy = current.top + current.height / 2;

      for (const other of overlaps) {
        const ox = other.left + other.width / 2;
        const oy = other.top + other.height / 2;
        const dx = cx - ox;
        const dy = cy - oy;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
          pushX += cx < canvasWidth / 2 ? -1 : 1;
          pushY += cy < canvasHeight / 2 ? -1 : 1;
        } else {
          pushX += dx;
          pushY += dy;
        }
      }

      if (Math.abs(pushX) < 0.001 && Math.abs(pushY) < 0.001) {
        pushX = current.left < canvasWidth / 2 ? -1 : 1;
        pushY = current.top < canvasHeight / 2 ? -1 : 1;
      }

      const len = Math.hypot(pushX, pushY) || 1;
      current.left = Math.round(
        clamp(current.left + (pushX / len) * step, margin, canvasWidth - current.width - margin)
      );
      current.top = Math.round(
        clamp(current.top + (pushY / len) * step, margin, canvasHeight - current.height - margin)
      );
    }

    placed.push(current);
  }

  const byId = new Map(placed.map((p) => [p.id, p]));
  return layers.map((layer) => byId.get(layer.id) || layer);
}

/**
 * Composites multiple product images onto a background
 *
 * @param backgroundBuffer - Background image buffer
 * @param products - Processed product images
 * @param layouts - Layout configurations for each product
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @returns Promise resolving to composite image buffer
 */
export async function compositeImages(
  backgroundBuffer: Buffer,
  products: ProcessedProductImage[],
  layouts?: ProductLayoutConfig[],
  canvasWidth: number = DEFAULT_CANVAS.width,
  canvasHeight: number = DEFAULT_CANVAS.height
): Promise<Buffer> {
  // Calculate layouts if not provided
  const productLayouts = layouts || calculateFlatLayLayout(products, canvasWidth, canvasHeight);

  // Resize background to canvas size
  const background = await sharp(backgroundBuffer)
    .resize(canvasWidth, canvasHeight, { fit: 'cover' })
    .png()
    .toBuffer();

  // Prepare composite operations sorted by z-index
  const positionedLayers: PositionedLayer[] = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const layout = productLayouts[i];

    if (!product.success || !product.imageBase64) {
      console.warn(`[ImageCompositor] Skipping failed product: ${product.name}`);
      continue;
    }

    // Decode base64 to buffer
    const base64Data = product.imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const productBuffer = Buffer.from(base64Data, 'base64');

    // Transform image (resize and rotate)
    const transformed = await transformImage(productBuffer, layout, canvasWidth, canvasHeight);

    // Calculate position (centered on the layout point)
    const left = Math.round(layout.x * canvasWidth - transformed.width / 2);
    const top = Math.round(layout.y * canvasHeight - transformed.height / 2);

    positionedLayers.push({
      id: `${i}:${product.sku}`,
      sku: product.sku,
      zIndex: layout.zIndex,
      buffer: transformed.buffer,
      width: transformed.width,
      height: transformed.height,
      left,
      top,
    });
  }

  const resolvedLayers = resolveLayerCollisions(positionedLayers, canvasWidth, canvasHeight);

  // Build composite operations sorted by z-index
  const sortedLayers = [...resolvedLayers].sort((a, b) => a.zIndex - b.zIndex);
  const flattenedOps: sharp.OverlayOptions[] = [];

  for (const layer of sortedLayers) {
    try {
      const shadowBuffer = await createDropShadow(layer.buffer);
      flattenedOps.push({
        input: shadowBuffer,
        left: layer.left + SHADOW_CONFIG.offsetX,
        top: layer.top + SHADOW_CONFIG.offsetY,
      });
    } catch (error) {
      console.warn(
        `[ImageCompositor] Failed to create drop shadow for ${layer.sku}, rendering without shadow:`,
        error
      );
    }

    flattenedOps.push({
      input: layer.buffer,
      left: layer.left,
      top: layer.top,
    });
  }

  // Composite all layers
  const result = await sharp(background)
    .composite(flattenedOps)
    .png()
    .toBuffer();

  console.log(`[ImageCompositor] Created composite with ${products.filter((p) => p.success).length} products`);

  return result;
}

/**
 * Creates a simple white background
 *
 * @param width - Canvas width
 * @param height - Canvas height
 * @returns Promise resolving to white background buffer
 */
export async function createWhiteBackground(
  width: number = DEFAULT_CANVAS.width,
  height: number = DEFAULT_CANVAS.height
): Promise<Buffer> {
  // Keep the studio background "white" but add subtle tonal depth so
  // off-white garments remain visible (prevents washed-out composites).
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g1" cx="50%" cy="42%" r="70%">
          <stop offset="0%" stop-color="#fbfbfa"/>
          <stop offset="70%" stop-color="#f1f1ee"/>
          <stop offset="100%" stop-color="#ebebe8"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g1)"/>
    </svg>
  `;

  return sharp(Buffer.from(svg))
    .resize(width, height, { fit: 'cover' })
    .png()
    .toBuffer();
}

/**
 * Converts a base64 image to buffer
 *
 * @param base64 - Base64 image string (with or without data URL prefix)
 * @returns Image buffer
 */
export function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Converts a buffer to base64 data URL
 *
 * @param buffer - Image buffer
 * @param mimeType - MIME type (default: image/png)
 * @returns Base64 data URL string
 */
export function bufferToBase64(buffer: Buffer, mimeType: string = 'image/png'): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}
