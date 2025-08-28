"use client"

import React, { useEffect, useState } from "react"
import NumberFlow from "@number-flow/react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface AnimatedNumberCounterProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export default function AnimatedNumberCounter({
  value,
  onChange,
  min = 0,
  max = 10,
  className = ""
}: AnimatedNumberCounterProps) {
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
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [flashColor])

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl transition-colors duration-300 ${
        flashColor === "up"
          ? "text-green-500"
          : flashColor === "down"
          ? "text-red-500"
          : ""
      } ${className}`}
    >
      <button
        onClick={handleIncrement}
        disabled={value >= max}
        className="flex size-8 items-center justify-center rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronUp
          className={`size-5 transition-colors duration-300 ${
            activeButton === "up" ? "text-green-500" : "text-gray-600"
          }`}
        />
      </button>

      <NumberFlow
        value={value}
        className="text-2xl w-8 text-center font-semibold"
      />

      <button
        onClick={handleDecrement}
        disabled={value <= min}
        className="flex size-8 items-center justify-center rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronDown
          className={`size-5 transition-colors duration-300 ${
            activeButton === "down" ? "text-red-500" : "text-gray-600"
          }`}
        />
      </button>
    </div>
  )
}