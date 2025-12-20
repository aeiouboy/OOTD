'use client'

import { Heart, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

/**
 * Design System Test Page
 *
 * This page demonstrates all the implemented components
 * and tests responsive behavior across breakpoints
 */
export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          <h1 className="text-4xl font-bold text-foreground font-display">
            OOTDay Design System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Testing responsive components and Thai language support across all breakpoints
          </p>
        </div>

        {/* Button Components */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>All button variants with responsive touch targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="sm">Primary Small</Button>
                <Button variant="primary" size="md">Primary Medium</Button>
                <Button variant="primary" size="lg">Primary Large</Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="primary" loading>Loading</Button>
                <Button variant="outline" icon={<Heart className="w-4 h-4" />}>
                  With Icon
                </Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Components */}
        <Card>
          <CardHeader>
            <CardTitle>Input Components</CardTitle>
            <CardDescription>Inputs with validation states and Thai text support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-md">
              <Input
                type="text"
                placeholder="Enter your name"
                label="Name"
              />

              <Input
                type="email"
                placeholder="your.email@example.com"
                label="Email Address"
                icon={<User className="w-4 h-4" />}
                required
              />

              <Input
                type="text"
                placeholder="ป้อนข้อความภาษาไทย"
                label="Thai Text Input"
                helperText="This input supports Thai language"
              />

              <Input
                type="text"
                placeholder="Search for fashion items..."
                label="Search"
                icon={<Search className="w-4 h-4" />}
                error="Please enter at least 3 characters"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card variant="default" size="md">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard card component</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is a responsive card that adapts to different screen sizes.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" size="md">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Card with shadow and hover effects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                สวัสดี! นี่คือการทดสอบข้อความภาษาไทย
              </p>
            </CardContent>
          </Card>

          <Card variant="outlined" size="md">
            <CardHeader>
              <CardTitle>Outlined Card</CardTitle>
              <CardDescription>Card with border styling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="primary" size="sm" className="w-full">
                  Full Width Button
                </Button>
                <p className="text-xs text-muted-foreground">
                  Touch targets are minimum 44px for accessibility
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Typography Test */}
        <Card>
          <CardHeader>
            <CardTitle>Typography Scale</CardTitle>
            <CardDescription>Font sizes and Thai language support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-4xl font-bold font-display">Hero Headline (4xl)</div>
              <div className="text-3xl font-semibold">Page Title (3xl)</div>
              <div className="text-2xl font-medium">Section Header (2xl)</div>
              <div className="text-xl">Card Title (xl)</div>
              <div className="text-lg">Large Body Text (lg)</div>
              <div className="text-base">Default Body Text (base)</div>
              <div className="text-sm text-muted-foreground">Small Text (sm)</div>
              <div className="text-xs text-muted-foreground">Caption Text (xs)</div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-2">Thai Typography Test</h3>
                <div className="text-2xl font-thai">แฟชั่นสำหรับทุกวัน</div>
                <div className="text-base font-thai">
                  OOTDay เป็นผู้ช่วยแฟชั่น AI ที่จะช่วยให้คุณเลือกชุดที่เหมาะสมสำหรับทุกวัน
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>OOTDay fashion brand colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Primary Colors (Fashion Purple)</h4>
                <div className="flex gap-2">
                  <div className="w-16 h-16 bg-primary-50 rounded border flex items-end p-1">
                    <span className="text-xs">50</span>
                  </div>
                  <div className="w-16 h-16 bg-primary-100 rounded border flex items-end p-1">
                    <span className="text-xs">100</span>
                  </div>
                  <div className="w-16 h-16 bg-primary-500 rounded border flex items-end p-1">
                    <span className="text-xs text-white">500</span>
                  </div>
                  <div className="w-16 h-16 bg-primary-600 rounded border flex items-end p-1">
                    <span className="text-xs text-white">600</span>
                  </div>
                  <div className="w-16 h-16 bg-primary-900 rounded border flex items-end p-1">
                    <span className="text-xs text-white">900</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Secondary Colors (Energy Orange)</h4>
                <div className="flex gap-2">
                  <div className="w-16 h-16 bg-secondary-50 rounded border flex items-end p-1">
                    <span className="text-xs">50</span>
                  </div>
                  <div className="w-16 h-16 bg-secondary-100 rounded border flex items-end p-1">
                    <span className="text-xs">100</span>
                  </div>
                  <div className="w-16 h-16 bg-secondary-500 rounded border flex items-end p-1">
                    <span className="text-xs text-white">500</span>
                  </div>
                  <div className="w-16 h-16 bg-secondary-600 rounded border flex items-end p-1">
                    <span className="text-xs text-white">600</span>
                  </div>
                  <div className="w-16 h-16 bg-secondary-900 rounded border flex items-end p-1">
                    <span className="text-xs text-white">900</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Breakpoints Test */}
        <Card>
          <CardHeader>
            <CardTitle>Responsive Breakpoints</CardTitle>
            <CardDescription>Layout changes across screen sizes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-primary-100 p-4 rounded text-center">
                <div className="block sm:hidden">Mobile Only</div>
                <div className="hidden sm:block md:hidden">Tablet</div>
                <div className="hidden md:block lg:hidden">Desktop</div>
                <div className="hidden lg:block">Large</div>
              </div>

              <div className="bg-secondary-100 p-4 rounded text-center">
                <div className="text-sm">Grid Item 2</div>
              </div>

              <div className="bg-neutral-100 p-4 rounded text-center">
                <div className="text-sm">Grid Item 3</div>
              </div>

              <div className="bg-primary-100 p-4 rounded text-center">
                <div className="text-sm">Grid Item 4</div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}