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

/**
 * Categorizes a product based on its category string
 */
function categorizeProduct(category: string): 'main' | 'shoes' | 'accessory' {
  const lowerCategory = category.toLowerCase().trim();
  return CATEGORY_TYPES[lowerCategory] || 'accessory';
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
    const type = categorizeProduct(item.category);
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
    const firstType = categorizeProduct(items[0].category);
    const secondType = categorizeProduct(items[1].category);

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
    // Three or more items: elegant diagonal composition
    // Main garment: upper-left, prominent
    // Shoes: bottom-left with rotation
    // Accessories: top-right and middle-right

    let positionIndex = 0;

    // Position main items (upper-left area)
    mainItems.forEach((itemIdx, i) => {
      const yOffset = i * 0.15;
      layouts[itemIdx] = {
        x: 0.3 + i * 0.05,
        y: 0.35 + yOffset,
        rotation: -3 + i * 2,
        scale: i === 0 ? 0.5 : 0.4,
        zIndex: 4 - i,
      };
    });

    // Position shoes (bottom-left)
    shoeItems.forEach((itemIdx, i) => {
      layouts[itemIdx] = {
        x: 0.25 + i * 0.1,
        y: 0.75 + i * 0.05,
        rotation: -8 + i * 4,
        scale: 0.35,
        zIndex: 1,
      };
    });

    // Position accessories (right side, scattered)
    const accessoryPositions = [
      { x: 0.75, y: 0.25, rotation: 6, scale: 0.25, zIndex: 2 },
      { x: 0.72, y: 0.55, rotation: -4, scale: 0.28, zIndex: 2 },
      { x: 0.8, y: 0.75, rotation: 8, scale: 0.22, zIndex: 1 },
      { x: 0.6, y: 0.15, rotation: -6, scale: 0.2, zIndex: 1 },
    ];

    accessoryItems.forEach((itemIdx, i) => {
      const pos = accessoryPositions[i % accessoryPositions.length];
      layouts[itemIdx] = { ...pos };
    });

    // Fill any remaining items without layouts
    items.forEach((_, idx) => {
      if (!layouts[idx]) {
        layouts[idx] = {
          x: 0.5 + Math.random() * 0.3 - 0.15,
          y: 0.5 + Math.random() * 0.3 - 0.15,
          rotation: Math.random() * 10 - 5,
          scale: 0.3,
          zIndex: 1,
        };
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
  // 1. Extract alpha channel
  // 2. Apply blur
  // 3. Tint black with specified opacity
  const { width, height } = await sharp(imageBuffer).metadata();

  if (!width || !height) {
    throw new Error('Could not get image dimensions for shadow');
  }

  // Extract alpha and create black silhouette
  const alphaBuffer = await sharp(imageBuffer)
    .extractChannel('alpha')
    .toBuffer();

  // Create black RGBA image with the alpha as mask
  const shadowBuffer = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: Math.round(opacity * 255) },
    },
  })
    .composite([
      {
        input: alphaBuffer,
        blend: 'dest-in',
        raw: {
          width,
          height,
          channels: 1,
        },
      },
    ])
    .blur(blur)
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
  interface CompositeOp {
    zIndex: number;
    operations: sharp.OverlayOptions[];
  }

  const compositeOps: CompositeOp[] = [];

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

    // Create drop shadow
    const shadowBuffer = await createDropShadow(transformed.buffer);

    compositeOps.push({
      zIndex: layout.zIndex,
      operations: [
        // Shadow (offset slightly)
        {
          input: shadowBuffer,
          left: left + SHADOW_CONFIG.offsetX,
          top: top + SHADOW_CONFIG.offsetY,
        },
        // Product image
        {
          input: transformed.buffer,
          left,
          top,
        },
      ],
    });
  }

  // Sort by z-index and flatten operations
  compositeOps.sort((a, b) => a.zIndex - b.zIndex);
  const flattenedOps = compositeOps.flatMap((op) => op.operations);

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
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
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
