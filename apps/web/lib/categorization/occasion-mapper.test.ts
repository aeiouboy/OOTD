/**
 * Unit Tests for Occasion Mapper
 */

import { describe, it, expect } from 'vitest'
import { mapProductToOccasions, calculateFormalityLevel, getOccasionRecommendations } from './occasion-mapper'
import type { OccasionMappingInput } from './occasion-mapper'

describe('Occasion Mapper', () => {
  describe('mapProductToOccasions', () => {
    it('should map formal dress to wedding and dinner', () => {
      const input: OccasionMappingInput = {
        name: 'Evening Gown',
        formalityLevel: 9,
        role: 'dress',
      }

      const occasions = mapProductToOccasions(input)

      expect(occasions).toContain('wedding')
      expect(occasions).toContain('dinner')
    })

    it('should map polo shirt to work', () => {
      const input: OccasionMappingInput = {
        name: 'Polo Shirt Business Casual',
        formalityLevel: 6,
        role: 'top',
      }

      const occasions = mapProductToOccasions(input)

      expect(occasions).toContain('work')
    })

    it('should map t-shirt to casual occasions', () => {
      const input: OccasionMappingInput = {
        name: 'Cotton T-Shirt',
        formalityLevel: 3,
        role: 'top',
      }

      const occasions = mapProductToOccasions(input)

      expect(occasions).toContain('chill')
      expect(occasions).toContain('cafe')
    })

    it('should map athletic wear to sport exclusively', () => {
      const input: OccasionMappingInput = {
        name: 'Running Shorts Athletic',
        formalityLevel: 1,
        role: 'bottom',
      }

      const occasions = mapProductToOccasions(input)

      expect(occasions).toContain('sport')
      expect(occasions).not.toContain('work')
      expect(occasions).not.toContain('wedding')
    })

    it('should map blazer to work and date', () => {
      const input: OccasionMappingInput = {
        name: 'Slim Fit Blazer',
        formalityLevel: 7,
        role: 'outerwear',
      }

      const occasions = mapProductToOccasions(input)

      expect(occasions).toContain('work')
    })

    it('should always return at least one occasion', () => {
      const input: OccasionMappingInput = {
        name: 'Generic Product',
        formalityLevel: 5,
      }

      const occasions = mapProductToOccasions(input)

      expect(occasions.length).toBeGreaterThan(0)
    })

    it('should limit to maximum 4 occasions', () => {
      const input: OccasionMappingInput = {
        name: 'Versatile Casual Dress',
        formalityLevel: 5,
        role: 'dress',
      }

      const occasions = mapProductToOccasions(input)

      expect(occasions.length).toBeLessThanOrEqual(4)
    })
  })

  describe('calculateFormalityLevel', () => {
    it('should rate tuxedo as 9', () => {
      const input: OccasionMappingInput = {
        name: 'Tuxedo Black Tie',
        formalityLevel: 5, // Will be overridden
      }

      const formality = calculateFormalityLevel(input)

      expect(formality).toBe(9)
    })

    it('should rate suit as 7', () => {
      const input: OccasionMappingInput = {
        name: 'Business Suit',
        formalityLevel: 5,
      }

      const formality = calculateFormalityLevel(input)

      expect(formality).toBe(7)
    })

    it('should rate polo as 3 (casual)', () => {
      const input: OccasionMappingInput = {
        name: 'Polo Shirt',
        formalityLevel: 5,
      }

      const formality = calculateFormalityLevel(input)

      expect(formality).toBe(3)
    })

    it('should rate t-shirt as 3', () => {
      const input: OccasionMappingInput = {
        name: 'Cotton T-Shirt',
        formalityLevel: 5,
      }

      const formality = calculateFormalityLevel(input)

      expect(formality).toBe(3)
    })

    it('should rate sportswear as 1', () => {
      const input: OccasionMappingInput = {
        name: 'Athletic Gym Shorts',
        formalityLevel: 5,
      }

      const formality = calculateFormalityLevel(input)

      expect(formality).toBe(1)
    })

    it('should adjust dress category to minimum 6', () => {
      const input: OccasionMappingInput = {
        name: 'Dress',
        formalityLevel: 3,
        category: 'dresses',
      }

      const formality = calculateFormalityLevel(input)

      expect(formality).toBeGreaterThanOrEqual(6)
    })
  })

  describe('getOccasionRecommendations', () => {
    it('should provide recommendations with confidence scores', () => {
      const input: OccasionMappingInput = {
        name: 'Polo Shirt Business',
        formalityLevel: 6,
      }

      const recommendations = getOccasionRecommendations(input)

      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations[0]).toHaveProperty('occasion')
      expect(recommendations[0]).toHaveProperty('confidence')
      expect(recommendations[0]).toHaveProperty('reasons')
      expect(recommendations[0].confidence).toBeGreaterThan(0)
      expect(recommendations[0].confidence).toBeLessThanOrEqual(1)
    })

    it('should provide reasons for matches', () => {
      const input: OccasionMappingInput = {
        name: 'Work Blazer Professional',
        formalityLevel: 7,
      }

      const recommendations = getOccasionRecommendations(input)

      const workRec = recommendations.find((r) => r.occasion === 'work')
      expect(workRec).toBeDefined()
      expect(workRec?.reasons.length).toBeGreaterThan(0)
    })
  })
})
