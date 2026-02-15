/**
 * Automated Evaluation Engine for LLM Model Testing
 * Evaluates responses against 8 criteria
 */

import { EvaluationScore, TestScenario } from './types/test-types';

export interface EvaluationResult {
  scores: EvaluationScore;
  details: {
    thaiToneDetails: string;
    categoryDetails: string;
    productCountDetails: string;
    linksDetails: string;
    tipsDetails: string;
    structureDetails: string;
  };
}

/**
 * Main evaluation function
 */
export function evaluateResponse(
  response: string,
  scenario: TestScenario
): EvaluationResult {
  const scores: EvaluationScore = {
    thaiLanguageTone: evaluateThaiLanguageTone(response),
    categoryIdentification: evaluateCategoryIdentification(response, scenario.expectedCategory),
    productRecommendationCount: evaluateProductRecommendationCount(response, scenario.expectedCategory),
    centralOnlineLinks: evaluateCentralOnlineLinks(response),
    stylingTipsCount: evaluateStylingTipsCount(response, scenario.expectedCategory),
    responseStructure: evaluateResponseStructure(response, scenario.expectedCategory),
    overallQuality: 0 // Will be calculated below
  };

  // Calculate overall quality as weighted average
  scores.overallQuality = calculateOverallQuality(scores);

  // Generate detailed feedback
  const details = {
    thaiToneDetails: getThaiToneDetails(response, scores.thaiLanguageTone),
    categoryDetails: getCategoryDetails(response, scenario.expectedCategory, scores.categoryIdentification),
    productCountDetails: getProductCountDetails(response, scenario.expectedCategory, scores.productRecommendationCount),
    linksDetails: getLinksDetails(response, scores.centralOnlineLinks),
    tipsDetails: getTipsDetails(response, scenario.expectedCategory, scores.stylingTipsCount),
    structureDetails: getStructureDetails(response, scenario.expectedCategory, scores.responseStructure)
  };

  return { scores, details };
}

/**
 * 1. Thai Language Tone & Style Scorer (0-10)
 * Checks for conversational Thai patterns
 */
function evaluateThaiLanguageTone(response: string): number {
  let score = 0;
  const maxScore = 10;

  // Check for friendly Thai particles
  const friendlyParticles = ['ค่ะ', 'นะคะ', 'เลย', 'นะ', 'จ้า', 'เนอะ'];
  const particleCount = friendlyParticles.reduce(
    (count, particle) => count + (response.match(new RegExp(particle, 'g')) || []).length,
    0
  );
  score += Math.min(particleCount * 0.5, 3); // Max 3 points for particles

  // Check for conversational phrases
  const conversationalPhrases = [
    'เข้าใจ',
    'มาแนะนำ',
    'ลองดู',
    'เหมาะกับ',
    'ดูดี',
    'สวย',
    'เท่',
    'ชอบ',
    'น่ารัก'
  ];
  const phraseMatches = conversationalPhrases.filter(phrase =>
    response.includes(phrase)
  ).length;
  score += Math.min(phraseMatches * 0.5, 3); // Max 3 points for conversational phrases

  // Check for emoji usage (friendly touch)
  const emojiCount = (response.match(/✨|💡|👔|👗|👞|💰|🔗/g) || []).length;
  score += Math.min(emojiCount * 0.2, 2); // Max 2 points for emojis

  // Check for natural Thai sentence structure (not too formal)
  const hasNaturalFlow = !response.includes('ข้าพเจ้า') && !response.includes('ท่าน');
  if (hasNaturalFlow) score += 2;

  return Math.min(Math.round(score), maxScore);
}

/**
 * 2. Category Identification Checker (Pass/Fail)
 * Detects if response matches expected category (CLOTHS vs OTHER)
 */
function evaluateCategoryIdentification(
  response: string,
  expectedCategory: 'CLOTHS' | 'OTHER'
): boolean {
  const hasProductSection = response.includes('💰') || response.includes('ราคา:');
  const hasTipsOnly = response.includes('Tips') || response.includes('เคล็ดลับ') || response.includes('วิธี');
  const hasLinks = response.includes('central.co.th') || response.includes('🔗');

  if (expectedCategory === 'CLOTHS') {
    // CLOTHS should have products with prices and links
    return hasProductSection && hasLinks;
  } else {
    // OTHER should have tips without prices/links
    return hasTipsOnly && !hasProductSection;
  }
}

/**
 * 3. Product Recommendation Count Checker (Pass/Fail)
 * Validates 3-5 products for CLOTHS, 0 for OTHER
 */
function evaluateProductRecommendationCount(
  response: string,
  expectedCategory: 'CLOTHS' | 'OTHER'
): boolean {
  // Count products by counting price/link emoji patterns
  const priceCount = (response.match(/💰/g) || []).length;
  const linkCount = (response.match(/🔗/g) || []).length;
  const productCount = Math.max(priceCount, linkCount);

  if (expectedCategory === 'CLOTHS') {
    // CLOTHS: should have 3-5 products
    return productCount >= 3 && productCount <= 5;
  } else {
    // OTHER: should have 0 product recommendations
    return productCount === 0;
  }
}

/**
 * 4. Central Online Links Scorer (0-10)
 * Checks for presence and format of central.co.th URLs
 */
function evaluateCentralOnlineLinks(response: string): number {
  const linkPattern = /https?:\/\/(www\.)?central\.co\.th\/[^\s]+/gi;
  const links = response.match(linkPattern) || [];

  if (links.length === 0) {
    return 0;
  }

  let score = 0;

  // Base score for having links (5 points)
  score += 5;

  // Additional points for proper link format
  const validLinks = links.filter(link =>
    link.includes('/th/') && link.length > 30
  );
  score += Math.min(validLinks.length, 3); // Max 3 points for valid links

  // Bonus for links matching product count (2 points)
  const productCount = (response.match(/💰/g) || []).length;
  if (links.length >= productCount && productCount > 0) {
    score += 2;
  }

  return Math.min(score, 10);
}

/**
 * 5. Styling Tips Count Checker (Pass/Fail)
 * Validates 1-3 tips in the styling section
 */
function evaluateStylingTipsCount(
  response: string,
  expectedCategory: 'CLOTHS' | 'OTHER'
): boolean {
  // Extract tips section
  const tipsSection = response.match(/✨.*?(?=\n\n|$)/s)?.[0] || '';

  // Count bullet points
  const bulletCount = (tipsSection.match(/[•\-\*]/g) || []).length;

  if (expectedCategory === 'CLOTHS') {
    // CLOTHS: should have 1-3 styling tips
    return bulletCount >= 1 && bulletCount <= 3;
  } else {
    // OTHER: should have 1-3 practical tips
    return bulletCount >= 1 && bulletCount <= 3;
  }
}

/**
 * 6. Response Structure Scorer (0-10)
 * Validates template matching for required sections
 */
function evaluateResponseStructure(
  response: string,
  expectedCategory: 'CLOTHS' | 'OTHER'
): number {
  let score = 0;

  if (expectedCategory === 'CLOTHS') {
    // TEMPLATE A structure checks

    // Friendly acknowledgment (2 points)
    const hasFriendlyGreeting = /^[^!]+!/.test(response.trim());
    if (hasFriendlyGreeting) score += 2;

    // Product recommendations section (3 points)
    const hasProductSection =
      (response.match(/Item \d+:/g) || []).length >= 3 ||
      (response.match(/💰/g) || []).length >= 3;
    if (hasProductSection) score += 3;

    // Styling tips section with ✨ (2 points)
    const hasTipsSection = response.includes('✨') && response.includes('Tips');
    if (hasTipsSection) score += 2;

    // Conclusion/summary (2 points)
    const hasConclusion = response.includes('เหมาะกับ') || response.includes('สุดๆ');
    if (hasConclusion) score += 2;

    // Proper emoji usage (1 point)
    const hasProperEmojis =
      response.includes('💰') && response.includes('🔗') && response.includes('💡');
    if (hasProperEmojis) score += 1;
  } else {
    // TEMPLATE B structure checks

    // Friendly acknowledgment (2 points)
    const hasFriendlyGreeting = response.trim().length > 20;
    if (hasFriendlyGreeting) score += 2;

    // Tips header (2 points)
    const hasTipsHeader = response.includes('Tips') || response.includes('เคล็ดลับ');
    if (hasTipsHeader) score += 2;

    // Multiple tips with bullets (3 points)
    const bulletCount = (response.match(/[•\-\*]/g) || []).length;
    if (bulletCount >= 2) score += 3;

    // Natural product mentions (2 points)
    const hasNaturalMentions = /[A-Z][a-z]+\s+[A-Z][a-z]+/.test(response); // Brand names
    if (hasNaturalMentions) score += 2;

    // Closing message (1 point)
    const hasClosing = response.includes('หวังว่า') || response.includes('💕');
    if (hasClosing) score += 1;
  }

  return Math.min(score, 10);
}

/**
 * Calculate overall quality score (weighted average)
 * Thai: 30%, Links: 35%, Structure: 35%
 */
function calculateOverallQuality(scores: EvaluationScore): number {
  const thaiWeight = 0.3;
  const linksWeight = 0.35;
  const structureWeight = 0.35;

  const weightedScore =
    scores.thaiLanguageTone * thaiWeight +
    scores.centralOnlineLinks * linksWeight +
    scores.responseStructure * structureWeight;

  return Math.round(weightedScore * 10) / 10; // Round to 1 decimal
}

// Detail functions for generating feedback

function getThaiToneDetails(response: string, score: number): string {
  if (score >= 8) return 'Excellent Thai conversational tone with natural particles and friendly expressions';
  if (score >= 6) return 'Good Thai tone with some conversational elements';
  if (score >= 4) return 'Adequate Thai but could be more conversational';
  return 'Thai tone needs improvement - add more friendly particles and natural expressions';
}

function getCategoryDetails(
  response: string,
  expected: string,
  passed: boolean
): string {
  return passed
    ? `✓ Correctly identified as ${expected} category`
    : `✗ Failed to match ${expected} category structure`;
}

function getProductCountDetails(
  response: string,
  expected: string,
  passed: boolean
): string {
  const count = (response.match(/💰/g) || []).length;
  if (expected === 'CLOTHS') {
    return passed
      ? `✓ Has ${count} products (3-5 required)`
      : `✗ Has ${count} products (should be 3-5 for CLOTHS)`;
  } else {
    return passed
      ? '✓ No product recommendations (correct for OTHER category)'
      : '✗ Should not have product recommendations for OTHER category';
  }
}

function getLinksDetails(response: string, score: number): string {
  const linkCount = (response.match(/central\.co\.th/g) || []).length;
  if (score >= 8) return `Excellent: ${linkCount} properly formatted Central Online links`;
  if (score >= 5) return `Good: ${linkCount} Central Online links present`;
  if (score > 0) return `Partial: ${linkCount} links but formatting could improve`;
  return 'Missing Central Online links';
}

function getTipsDetails(
  response: string,
  expected: string,
  passed: boolean
): string {
  const tipsSection = response.match(/✨.*?(?=\n\n|$)/s)?.[0] || '';
  const count = (tipsSection.match(/[•\-\*]/g) || []).length;
  return passed
    ? `✓ Has ${count} styling tips (1-3 required)`
    : `✗ Has ${count} tips (should be 1-3)`;
}

function getStructureDetails(
  response: string,
  expected: string,
  score: number
): string {
  if (score >= 8)
    return `Excellent structure matching ${expected === 'CLOTHS' ? 'TEMPLATE A' : 'TEMPLATE B'}`;
  if (score >= 6) return 'Good structure with minor improvements needed';
  if (score >= 4) return 'Basic structure present but missing key elements';
  return 'Structure needs significant improvement';
}
