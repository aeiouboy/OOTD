import { describe, it, expect } from 'vitest'
import { computeOccasionScores } from '@/lib/supabase/occasion-scoring'

const VALID_OCCASIONS = ['weekend_social', 'date_night', 'everyday_casual'] as const

describe('computeOccasionScores', () => {
  it('scores premium dress as date_night', () => {
    const scores = computeOccasionScores({
      product_name: 'Midi Dress Black Elegant',
      brand: 'Simkhai',
      price: 8000,
    })
    expect(scores.primary_occasion).toBe('date_night')
    expect(scores.date_night).toBeGreaterThan(scores.weekend_social)
    expect(scores.date_night).toBeGreaterThan(scores.everyday_casual)
  })

  it('scores basic tee as everyday_casual', () => {
    const scores = computeOccasionScores({
      product_name: 'Basic Cotton Tee White',
      brand: 'Giordano',
      price: 599,
    })
    expect(scores.primary_occasion).toBe('everyday_casual')
    expect(scores.everyday_casual).toBeGreaterThan(0.5)
  })

  it('scores trendy blouse as weekend_social', () => {
    const scores = computeOccasionScores({
      product_name: 'Floral Blouse Summer',
      brand: 'Journal',
      price: 2500,
    })
    expect(scores.primary_occasion).toBe('weekend_social')
  })

  it('scores blazer as date_night', () => {
    const scores = computeOccasionScores({
      product_name: 'Tailored Blazer Navy',
      brand: 'Ted Baker',
      price: 6500,
    })
    expect(scores.date_night).toBeGreaterThan(0.5)
  })

  it('returns scores between 0 and 1', () => {
    const scores = computeOccasionScores({
      product_name: 'Any Product',
      brand: null,
      price: null,
    })
    expect(scores.weekend_social).toBeGreaterThanOrEqual(0)
    expect(scores.weekend_social).toBeLessThanOrEqual(1)
    expect(scores.date_night).toBeGreaterThanOrEqual(0)
    expect(scores.date_night).toBeLessThanOrEqual(1)
    expect(scores.everyday_casual).toBeGreaterThanOrEqual(0)
    expect(scores.everyday_casual).toBeLessThanOrEqual(1)
  })

  it('handles null/undefined values gracefully', () => {
    const scores = computeOccasionScores({
      product_name: '',
      brand: null,
      price: null,
    })
    expect(scores.primary_occasion).toBeDefined()
    expect(VALID_OCCASIONS).toContain(scores.primary_occasion)
  })

  it('assigns primary_occasion to highest score', () => {
    const scores = computeOccasionScores({
      product_name: 'Jogger Pants Casual',
      brand: 'Lee',
      price: 800,
    })
    const maxScore = Math.max(scores.weekend_social, scores.date_night, scores.everyday_casual)
    const occasionScoreMap: Record<string, number> = {
      weekend_social: scores.weekend_social,
      date_night: scores.date_night,
      everyday_casual: scores.everyday_casual,
    }
    expect(occasionScoreMap[scores.primary_occasion]).toBe(maxScore)
  })

  it('scores high-price items toward date_night via price boost', () => {
    const scores = computeOccasionScores({
      product_name: 'Generic Item',
      brand: null,
      price: 7000,
    })
    // Price > 5000 gives +0.2 to date_night
    expect(scores.date_night).toBe(0.5)
    expect(scores.date_night).toBeGreaterThan(scores.weekend_social)
  })

  it('scores low-price items toward everyday_casual via price boost', () => {
    const scores = computeOccasionScores({
      product_name: 'Generic Item',
      brand: null,
      price: 500,
    })
    // Price < 1000 gives +0.2, price < 1500 gives +0.1
    expect(scores.everyday_casual).toBe(0.6)
    expect(scores.everyday_casual).toBeGreaterThan(scores.weekend_social)
  })

  it('scores mid-range price toward weekend_social via price boost', () => {
    const scores = computeOccasionScores({
      product_name: 'Generic Item',
      brand: null,
      price: 2500,
    })
    // Price 1500-5000 gives +0.1 to weekend_social
    expect(scores.weekend_social).toBe(0.4)
    expect(scores.weekend_social).toBeGreaterThan(scores.date_night)
  })

  it('handles string price values', () => {
    const scores = computeOccasionScores({
      product_name: 'Midi Dress',
      brand: null,
      price: '8000',
    })
    // "midi dress" matches DATE_NIGHT keyword (+0.4), "dress" matches WEEKEND_SOCIAL (+0.4)
    // Price > 5000 gives date_night +0.2
    expect(scores.date_night).toBeCloseTo(0.9)
    expect(scores.weekend_social).toBeCloseTo(0.7)
  })

  it('accumulates multiple keyword matches', () => {
    // "crop top" matches WEEKEND_SOCIAL via 'crop top'
    const scores = computeOccasionScores({
      product_name: 'Crop Top',
      brand: 'COS',
      price: 2000,
    })
    // Name: WEEKEND_SOCIAL +0.4
    // Brand: "cos" matches WEEKEND_SOCIAL +0.2
    // Price 1500-5000: WEEKEND_SOCIAL +0.1
    expect(scores.weekend_social).toBeCloseTo(1.0)
  })

  it('clamps scores that exceed 1.0', () => {
    // Create conditions that would exceed 1.0 without clamping
    const scores = computeOccasionScores({
      product_name: 'Basic Tee Jogger',
      brand: 'Giordano',
      price: 500,
    })
    // Name: "tee" and "jogger" both match EVERYDAY_CASUAL, but matchesAny returns true once (+0.4)
    // Brand: "giordano" matches EVERYDAY_CASUAL (+0.2)
    // Price < 1000 (+0.2), < 1500 (+0.1)
    // Total: 0.3 + 0.4 + 0.2 + 0.2 + 0.1 = 1.2, clamped to 1.0
    expect(scores.everyday_casual).toBe(1.0)
  })

  it('returns base scores when nothing matches', () => {
    const scores = computeOccasionScores({
      product_name: 'Unknown Item XYZ',
      brand: 'UnknownBrand',
      price: 3000,
    })
    // Only price 1500-5000 matches: weekend_social +0.1
    expect(scores.weekend_social).toBe(0.4)
    expect(scores.date_night).toBe(0.3)
    expect(scores.everyday_casual).toBe(0.3)
    expect(scores.primary_occasion).toBe('weekend_social')
  })
})
