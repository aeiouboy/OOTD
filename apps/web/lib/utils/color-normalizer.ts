import type { ColorName } from '../types/enums'
import { COLOR_LEXICON } from '../config/color-lexicon'

const aliasToColor = buildAliasMap()
const latinBoundaryPattern = /^[a-z\s-]+$/i

function buildAliasMap(): Map<string, ColorName> {
  const map = new Map<string, ColorName>()

  for (const [canonical, entry] of Object.entries(COLOR_LEXICON) as Array<[ColorName, (typeof COLOR_LEXICON)[ColorName]]>) {
    map.set(canonical.toLowerCase(), canonical)
    for (const alias of entry.aliases) {
      map.set(alias.toLowerCase().trim(), canonical)
    }
  }

  return map
}

export function normalizeColorToken(input: string): ColorName | undefined {
  const cleaned = input.toLowerCase().trim()
  if (!cleaned) {
    return undefined
  }

  return aliasToColor.get(cleaned)
}

export function detectColorsInMessage(message: string): ColorName[] {
  const lowered = message.toLowerCase()
  const detected = new Set<ColorName>()

  for (const [alias, canonical] of aliasToColor.entries()) {
    if (!alias) continue

    if (latinBoundaryPattern.test(alias)) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\b${escaped}\\b`, 'i')
      if (regex.test(lowered)) {
        detected.add(canonical)
      }
      continue
    }

    if (lowered.includes(alias)) {
      detected.add(canonical)
    }
  }

  return Array.from(detected)
}

export function expandColorMatchTokens(colors: string[]): string[] {
  const matchTokens = new Set<string>()

  for (const color of colors) {
    const canonical = normalizeColorToken(color)
    if (!canonical) {
      continue
    }

    const config = COLOR_LEXICON[canonical]
    matchTokens.add(canonical)
    for (const token of config.matchTokens) {
      matchTokens.add(token.toLowerCase())
    }
  }

  return Array.from(matchTokens)
}
