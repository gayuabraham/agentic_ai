"use client"

import { useEffect } from "react"
import { toast } from "@/hooks/use-toast"

interface DeploymentToastBridgeProps {
  message: { id: number; title: string; description?: string } | null
  onClear: () => void
}

/** Bridges deployment-hook toast events into the shared toast system (no duplicate state). */
export function DeploymentToastBridge({ message, onClear }: DeploymentToastBridgeProps) {
  useEffect(() => {
    if (!message) return
    toast({
      title: message.title,
      description: message.description,
    })
    onClear()
  }, [message, onClear])

  return null
}
