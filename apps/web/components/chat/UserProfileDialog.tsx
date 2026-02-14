'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Check, ChevronLeft } from 'lucide-react'
import { UserProfile, AgeRange, StylePreference } from '@/lib/types/user-profile-types'
import fashionStylesData from '@/lib/data/fashion-styles.json'

interface UserProfileDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    profile: UserProfile | null
    onSave: (updates: Partial<UserProfile>) => void
}

const ageOptions: { value: AgeRange; label: string }[] = [
    { value: '<20', label: 'Less than 20' },
    { value: '20-29', label: '20-29' },
    { value: '30-39', label: '30-39' },
    { value: '40+', label: '40+' },
]

const styleOptions = fashionStylesData as StylePreference[]

type ViewMode = 'menu' | 'profile' | 'style'

export function UserProfileDialog({
    open,
    onOpenChange,
    profile,
    onSave,
}: UserProfileDialogProps) {
    const [view, setView] = useState<ViewMode>('menu')
    const [userName, setUserName] = useState('')
    const [ageRange, setAgeRange] = useState<AgeRange | null>(null)
    const [selectedStyles, setSelectedStyles] = useState<StylePreference[]>([])
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

    // Load profile data when dialog opens
    useEffect(() => {
        if (open && profile) {
            setUserName(profile.userName || '')
            setAgeRange(profile.ageRange || null)
            setSelectedStyles(profile.stylePreferences || [])
        }
        if (open) {
            setView('menu')
        }
    }, [open, profile])

    const handleImageError = useCallback((styleId: string) => {
        setFailedImages((prev) => new Set(prev).add(styleId))
    }, [])

    const toggleStyle = useCallback((style: StylePreference) => {
        setSelectedStyles((prev) => {
            const isSelected = prev.some((s) => s.id === style.id)
            if (isSelected) {
                return prev.filter((s) => s.id !== style.id)
            } else {
                return [...prev, style]
            }
        })
    }, [])

    const handleSave = useCallback(() => {
        const updates: Partial<UserProfile> = {}
        
        if (userName.trim()) {
            updates.userName = userName.trim()
        }
        if (ageRange) {
            updates.ageRange = ageRange
        }
        if (selectedStyles.length > 0) {
            updates.stylePreferences = selectedStyles
        }

        onSave(updates)
        onOpenChange(false)
    }, [userName, ageRange, selectedStyles, onSave, onOpenChange])

    const canSave = userName.trim() || ageRange || selectedStyles.length > 0

    // Handle dialog close - reset view
    const handleOpenChange = useCallback((newOpen: boolean) => {
        if (!newOpen) {
            setView('menu')
        }
        onOpenChange(newOpen)
    }, [onOpenChange])

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent 
                className="sm:max-w-md max-h-[90vh] overflow-y-auto"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                {view === 'menu' && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                ตั้งค่าโปรไฟล์
                            </DialogTitle>
                            <DialogDescription>
                                ปรับแต่งข้อมูลส่วนตัวเพื่อให้ AI แนะนำชุดที่เหมาะกับคุณ
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-4">
                            {/* Current Profile Summary */}
                            {profile && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <p className="text-sm font-medium text-gray-600 mb-2">ข้อมูลปัจจุบัน</p>
                                    <div className="text-sm space-y-1">
                                        <p>ชื่อ: <span className="font-medium">{profile.userName || '-'}</span></p>
                                        <p>อายุ: <span className="font-medium">
                                            {profile.ageRange ? ageOptions.find(a => a.value === profile.ageRange)?.label : '-'}
                                        </span></p>
                                        <p>สไตล์: <span className="font-medium">
                                            {profile.stylePreferences?.length 
                                                ? profile.stylePreferences.map(s => s.name).join(', ')
                                                : '-'}
                                        </span></p>
                                    </div>
                                </div>
                            )}

                            {/* Menu Options */}
                            <button
                                onClick={() => setView('profile')}
                                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-left"
                            >
                                <div>
                                    <p className="font-medium">ข้อมูลทั่วไป</p>
                                    <p className="text-sm text-muted-foreground">ชื่อเล่น, ช่วงอายุ</p>
                                </div>
                                <ChevronLeft className="w-5 h-5 rotate-180" />
                            </button>

                            <button
                                onClick={() => setView('style')}
                                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-left"
                            >
                                <div>
                                    <p className="font-medium">สไตล์ที่ชอบ</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedStyles.length > 0 
                                            ? `${selectedStyles.length} สไตล์ที่เลือก` 
                                            : 'เลือกสไตล์ที่ตรงกับคุณ'}
                                    </p>
                                </div>
                                <ChevronLeft className="w-5 h-5 rotate-180" />
                            </button>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="w-full"
                            >
                                ปิด
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {view === 'profile' && (
                    <>
                        <DialogHeader>
                            <button
                                onClick={() => setView('menu')}
                                className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 w-fit"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                กลับ
                            </button>
                            <DialogTitle>ข้อมูลทั่วไป</DialogTitle>
                            <DialogDescription>
                                แก้ไขชื่อเล่นและช่วงอายุ
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Name Input */}
                            <div className="space-y-2">
                                <Label htmlFor="user-name" className="text-base">
                                    ชื่อเล่น
                                </Label>
                                <Input
                                    id="user-name"
                                    type="text"
                                    placeholder="เช่น แนน, บี, พลอย"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="text-lg"
                                    autoComplete="off"
                                />
                                <p className="text-sm text-muted-foreground">
                                    AI จะเรียกคุณด้วยชื่อนี้
                                </p>
                            </div>

                            {/* Age Selection */}
                            <div className="space-y-3">
                                <Label className="text-base">ช่วงอายุ</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {ageOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setAgeRange(option.value)}
                                            className={`
                                                p-4 rounded-xl border-2 transition-all duration-200
                                                flex flex-col items-center gap-2
                                                ${ageRange === option.value
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }
                                            `}
                                        >
                                            <span className="text-2xl">
                                                {option.value === '<20' && '🌱'}
                                                {option.value === '20-29' && '✨'}
                                                {option.value === '30-39' && '🌟'}
                                                {option.value === '40+' && '💎'}
                                            </span>
                                            <span className="font-medium text-sm">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setView('menu')}
                                className="flex-1"
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                onClick={() => {
                                    handleSave()
                                    setView('menu')
                                }}
                                disabled={!canSave}
                                className="flex-1"
                            >
                                บันทึก
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {view === 'style' && (
                    <>
                        <DialogHeader>
                            <button
                                onClick={() => setView('menu')}
                                className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 w-fit"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                กลับ
                            </button>
                            <DialogTitle>สไตล์ที่ชอบ</DialogTitle>
                            <DialogDescription>
                                เลือกสไตล์ที่ตรงกับคุณ ({selectedStyles.length} ที่เลือก)
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-2">
                            {/* Style Grid */}
                            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
                                {styleOptions.map((style) => {
                                    const isSelected = selectedStyles.some((s) => s.id === style.id)
                                    return (
                                        <button
                                            key={style.id}
                                            onClick={() => toggleStyle(style)}
                                            className={`
                                                relative rounded-xl overflow-hidden
                                                transition-all duration-200 border-2
                                                ${isSelected
                                                    ? 'border-primary shadow-md ring-2 ring-primary/20'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }
                                            `}
                                        >
                                            {/* Selection Checkmark */}
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 z-10 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                </div>
                                            )}

                                            {/* Style Image */}
                                            <div className="relative aspect-[3/4] overflow-hidden">
                                                {style.imageUrl && !failedImages.has(style.id) ? (
                                                    <img
                                                        src={style.imageUrl}
                                                        alt={style.name}
                                                        loading="lazy"
                                                        onError={() => handleImageError(style.id)}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                        <span className="text-2xl">👗</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                                            </div>

                                            {/* Style Name */}
                                            <div className="absolute bottom-0 inset-x-0 p-2">
                                                <p className="font-semibold text-sm text-white">
                                                    {style.name}
                                                </p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <DialogFooter className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setView('menu')}
                                className="flex-1"
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                onClick={() => {
                                    handleSave()
                                    setView('menu')
                                }}
                                disabled={selectedStyles.length === 0}
                                className="flex-1"
                            >
                                บันทึก ({selectedStyles.length})
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
