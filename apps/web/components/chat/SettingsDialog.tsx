'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Beaker, Database, RefreshCw } from 'lucide-react'

interface SettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    testMode: boolean
    onToggleTestMode: () => void
    onClearChat: () => void
    currentVersion?: string
}

export function SettingsDialog({
    open,
    onOpenChange,
    testMode,
    onToggleTestMode,
    onClearChat,
    currentVersion = 'v5.0'
}: SettingsDialogProps) {
    const handleClearChat = () => {
        onClearChat()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="sm:max-w-md"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Chat Settings</DialogTitle>
                    <DialogDescription>
                        Configure your chat experience and developer tools.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Developer Tools Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Beaker className="w-4 h-4" />
                            Developer Tools
                        </h4>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="test-mode">Test Mode</Label>
                                <p className="text-xs text-muted-foreground">
                                    Enable advanced LLM testing interface
                                </p>
                            </div>
                            <Switch
                                id="test-mode"
                                checked={testMode}
                                onCheckedChange={onToggleTestMode}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>System Prompt Version</Label>
                                <p className="text-xs text-muted-foreground">
                                    Current active model instructions
                                </p>
                            </div>
                            <Badge variant="outline" className="font-mono">
                                {currentVersion}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Session Management */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            Session & Data
                        </h4>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Reset Session</Label>
                                <p className="text-xs text-muted-foreground">
                                    Clear chat history and reset context
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleClearChat}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
