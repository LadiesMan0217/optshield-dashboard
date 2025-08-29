import React, { useEffect, useState } from "react"
import NumberFlow from "@number-flow/react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "../../lib/utils"

interface LevelSelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export function LevelSelector({ 
  value, 
  onChange, 
  min = 1, 
  max = 10, 
  className 
}: LevelSelectorProps) {
  const [activeButton, setActiveButton] = useState<"up" | "down" | null>(null)
  const [flashColor, setFlashColor] = useState<"up" | "down" | null>(null)

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
      setActiveButton("up")
      setFlashColor("up")
    }
  }

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
      setActiveButton("down")
      setFlashColor("down")
    }
  }

  useEffect(() => {
    if (flashColor) {
      const timer = setTimeout(() => {
        setFlashColor(null)
        setActiveButton(null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [flashColor])

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={handleDecrement}
        disabled={value <= min}
        className={cn(
          "flex size-8 items-center justify-center rounded-md transition-all duration-200",
          "hover:bg-neutral-800/50 disabled:opacity-50 disabled:cursor-not-allowed",
          "border border-neutral-700/50 hover:border-neutral-600/50"
        )}
      >
        <ChevronDown
          className={cn(
            "size-4 transition-colors duration-300",
            activeButton === "down" ? "text-red-400" : "text-neutral-400",
            value <= min ? "text-neutral-600" : "hover:text-white"
          )}
        />
      </button>

      <div className={cn(
        "flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md",
        "bg-neutral-900/50 border border-neutral-700/50",
        "transition-colors duration-300",
        flashColor === "up" ? "border-green-500/50 bg-green-500/10" :
        flashColor === "down" ? "border-red-500/50 bg-red-500/10" : ""
      )}>
        <NumberFlow
          value={value}
          className="text-lg font-semibold text-white"
        />
      </div>

      <button
        onClick={handleIncrement}
        disabled={value >= max}
        className={cn(
          "flex size-8 items-center justify-center rounded-md transition-all duration-200",
          "hover:bg-neutral-800/50 disabled:opacity-50 disabled:cursor-not-allowed",
          "border border-neutral-700/50 hover:border-neutral-600/50"
        )}
      >
        <ChevronUp
          className={cn(
            "size-4 transition-colors duration-300",
            activeButton === "up" ? "text-green-400" : "text-neutral-400",
            value >= max ? "text-neutral-600" : "hover:text-white"
          )}
        />
      </button>
    </div>
  )
}