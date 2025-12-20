"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Heart, User, MapPin } from "lucide-react"

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "chat", icon: MessageCircle, label: "Chat" },
    { id: "saved", icon: Heart, label: "Saved" },
    { id: "profile", icon: User, label: "Profile" },
    { id: "stores", icon: MapPin, label: "Stores" },
  ]

  return (
    <nav className="lg:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
              activeTab === tab.id ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-xs">{tab.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  )
}
