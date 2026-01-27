'use client'

import { Sparkles, ChevronLeft, MoreVertical, Trash2, HelpCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type ChatStatus = 'online' | 'typing' | 'generating' | 'offline'

interface ChatHeaderProps {
  status?: ChatStatus
  onBack?: () => void
  onClearChat?: () => void
  showBackButton?: boolean
}

const statusConfig: Record<ChatStatus, { label: string; color: string }> = {
  online: { label: 'Online', color: 'bg-green-500' },
  typing: { label: 'กำลังพิมพ์...', color: 'bg-green-500' },
  generating: { label: 'กำลังสร้างลุค...', color: 'bg-amber-500' },
  offline: { label: 'Offline', color: 'bg-gray-400' },
}

export function ChatHeader({
  status = 'online',
  onBack,
  onClearChat,
  showBackButton = false
}: ChatHeaderProps) {
  const currentStatus = statusConfig[status]

  return (
    <div className="border-b px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between">
        {/* Left section: Back button + Avatar + Title */}
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 -ml-2"
              onClick={onBack}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}

          <div className="relative">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {/* Status dot */}
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${currentStatus.color} rounded-full border-2 border-background`}
            />
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold text-sm leading-tight">OOTDay Stylist</h2>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 ${currentStatus.color} rounded-full ${status === 'typing' || status === 'generating' ? 'animate-pulse' : ''}`}
              />
              <p className="text-xs text-muted-foreground">{currentStatus.label}</p>
            </div>
          </div>
        </div>

        {/* Right section: Options menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onClearChat} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              เคลียร์แชท
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <HelpCircle className="w-4 h-4 mr-2" />
              ช่วยเหลือ
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              ตั้งค่า
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
