import type React from "react"
import { ArrowDownRight } from "lucide-react"

interface WaterLossCardProps {
  title: string
  lossValue: number
  lossPercentage: number
  totalValue: string
  color: string
  isNegative?: boolean
  formatNumber: (num: number) => string
  formatPercentage: (value: number) => string
}

export const WaterLossCard: React.FC<WaterLossCardProps> = ({
  title,
  lossValue,
  lossPercentage,
  totalValue,
  color,
  isNegative = false,
  formatNumber,
  formatPercentage,
}) => {
  return (
    <div className="rounded-lg shadow-md p-6 text-white" style={{ backgroundColor: color }}>
      <div className="flex items-center mb-2">
        <ArrowDownRight className="h-5 w-5 text-white opacity-80 mr-2" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <h2 className="text-3xl font-bold mb-1">{formatNumber(Math.abs(lossValue))} m³</h2>
      <p className="text-sm opacity-80">
        ({formatPercentage(Math.abs(lossPercentage))} of {totalValue})
      </p>
      {isNegative && (
        <p className="text-xs mt-1 opacity-90 font-medium">
          Note: Negative loss indicates potential meter under-reading or over-reading.
        </p>
      )}
    </div>
  )
}
