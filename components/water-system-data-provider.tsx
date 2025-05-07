"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  type WaterMeter,
  type WaterMetrics,
  getRealWaterData,
  calculateRealMetrics,
  calculateLossTrend,
} from "@/lib/real-data-processor"

interface WaterSystemContextType {
  data: WaterMeter[]
  metrics: WaterMetrics
  selectedYear: string
  selectedMonth: string
  isLoading: boolean
  setSelectedYear: (year: string) => void
  setSelectedMonth: (month: string) => void
  calculateLossTrend: () => any[]
  formatNumber: (num: number) => string
  formatPercentage: (value: number) => string
  getLossStatusColor: (lossPercentage: number) => string
  getLossStatusText: (lossPercentage: number) => string
}

const WaterSystemContext = createContext<WaterSystemContextType | undefined>(undefined)

export const useWaterSystem = () => {
  const context = useContext(WaterSystemContext)
  if (!context) {
    throw new Error("useWaterSystem must be used within a WaterSystemProvider")
  }
  return context
}

interface WaterSystemProviderProps {
  children: ReactNode
}

export const WaterSystemProvider: React.FC<WaterSystemProviderProps> = ({ children }) => {
  const [data, setData] = useState<WaterMeter[]>([])
  const [metrics, setMetrics] = useState<WaterMetrics>({
    totalL1Supply: 0,
    totalL2Volume: 0,
    totalL3Volume: 0,
    stage1Loss: 0,
    stage2Loss: 0,
    totalLoss: 0,
    stage1LossPercentage: 0,
    stage2LossPercentage: 0,
    totalLossPercentage: 0,
    consumptionByType: {},
    zoneMetrics: {},
  })
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedMonth, setSelectedMonth] = useState("Mar")
  const [isLoading, setIsLoading] = useState(true)

  // Colors for loss status
  const LOSS_COLORS = { high: "#E57373", medium: "#FFA726", good: "#81C784" }

  // Load data and calculate metrics
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Get real water data
        const waterData = getRealWaterData()
        setData(waterData)

        // Calculate metrics
        const calculatedMetrics = calculateRealMetrics(waterData, selectedMonth, selectedYear)
        setMetrics(calculatedMetrics)

        setIsLoading(false)
      } catch (error) {
        console.error("Error processing water data:", error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedYear, selectedMonth])

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (typeof num !== "number" || isNaN(num)) return "0"
    return Math.round(num).toLocaleString()
  }

  // Format percentage for display
  const formatPercentage = (value: number) => {
    if (typeof value !== "number" || isNaN(value)) return "0.0%"
    return `${Math.round(value * 10) / 10}%`
  }

  // Determine status color based on loss percentage
  const getLossStatusColor = (lossPercentage: number) => {
    if (typeof lossPercentage !== "number" || isNaN(lossPercentage)) return LOSS_COLORS.good
    if (lossPercentage > 20) return LOSS_COLORS.high
    if (lossPercentage > 10) return LOSS_COLORS.medium
    return LOSS_COLORS.good
  }

  // Determine status text based on loss percentage
  const getLossStatusText = (lossPercentage: number) => {
    if (typeof lossPercentage !== "number" || isNaN(lossPercentage)) return "Unknown"
    if (lossPercentage > 20) return "High Loss"
    if (lossPercentage > 10) return "Medium Loss"
    return "Good"
  }

  // Calculate loss trend
  const getLossTrend = () => {
    return calculateLossTrend(data, selectedYear)
  }

  const value = {
    data,
    metrics,
    selectedYear,
    selectedMonth,
    isLoading,
    setSelectedYear,
    setSelectedMonth,
    calculateLossTrend: getLossTrend,
    formatNumber,
    formatPercentage,
    getLossStatusColor,
    getLossStatusText,
  }

  return <WaterSystemContext.Provider value={value}>{children}</WaterSystemContext.Provider>
}
