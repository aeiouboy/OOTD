'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Language Switcher Component
 *
 * @description Allows users to switch between Thai and English languages
 * @example
 * <LanguageSwitcher />
 */

type Language = 'th' | 'en'

interface LanguageOption {
  code: Language
  name: string
  nativeName: string
  flag: string
}

const languages: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭'
  }
]

export function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en')
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language)
    setIsOpen(false)

    // In a real implementation, this would update the locale context
    // For now, we'll just update local state
    console.log('Language changed to:', language)
  }

  const currentLang = languages.find(lang => lang.code === currentLanguage)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLang?.nativeName}</span>
        <span className="sm:hidden">{currentLang?.flag}</span>
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 mt-2 w-48 z-50 shadow-lg">
          <CardContent className="p-2">
            <div className="space-y-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-3 ${
                    currentLanguage === language.code
                      ? 'bg-primary-100 text-primary-900'
                      : 'hover:bg-neutral-100'
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div>
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-muted-foreground">{language.name}</div>
                  </div>
                  {currentLanguage === language.code && (
                    <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}