"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Clock, ArrowDownRight, Filter, Download, RefreshCw, Droplet, Info } from "lucide-react"
import { WaterBalanceTable } from "./water-balance-table"
import { getRealWaterData, calculateRealMetrics } from "@/lib/real-data-processor"

// Main App Component
const MuscatBayWaterSystem = () => {
  // State for all data
  const [data, setData] = useState([])
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedMonth, setSelectedMonth] = useState("Mar")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedZone, setSelectedZone] = useState("Zone_05")
  const [selectedType, setSelectedType] = useState("All Types")
  const [isLoading, setIsLoading] = useState(true)
  const [showMethodology, setShowMethodology] = useState(false)

  // Calculated metrics
  const [metrics, setMetrics] = useState({
    totalL1Supply: 0,
    totalL2Volume: 0,
    totalL3Volume: 0,
    stage1Loss: 0,
    stage2Loss: 0,
    totalLoss: 0,
    consumptionByType: {},
    zoneMetrics: {},
  })

  // --- Color Scheme Definition ---
  const alertColor = "#ef4444"
  const warningColor = "#f59e0b"
  const successColor = "#10b981"
  const infoColor = "#3b82f6"
  const purpleColor = "#8b5cf6"
  const indigoColor = "#6366f1"
  const COLORS = ["#96CDD2", "#6F697B", "#A8D9DF", "#857D93", "#C3E6EB", "#514D5E"]
  const LOSS_COLORS = { high: "#E57373", medium: "#FFA726", good: "#81C784" }

  // Effect to load and process data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Use real data
        const waterData = getRealWaterData()
        setData(waterData)

        // Calculate metrics
        const calculatedMetrics = calculateRealMetrics(waterData, selectedMonth, selectedYear)
        setMetrics(calculatedMetrics)

        setIsLoading(false)
      } catch (error) {
        console.error("Error processing data:", error)
        alert("Could not process water consumption data. Please check the console for details.")
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedYear, selectedMonth])

  // Calculate loss trend data across months
  const calculateLossTrend = () => {
    const months =
      selectedYear === "2025"
        ? ["Jan-25", "Feb-25", "Mar-25"]
        : [
            "Jan-24",
            "Feb-24",
            "Mar-24",
            "Apr-24",
            "May-24",
            "Jun-24",
            "Jul-24",
            "Aug-24",
            "Sep-24",
            "Oct-24",
            "Nov-24",
            "Dec-24",
          ]

    const trend = []

    months.forEach((period) => {
      // Calculate metrics for this period
      const periodMetrics = calculateRealMetrics(data, period.substring(0, 3), period.substring(4, 6))

      trend.push({
        period,
        stage1Loss: periodMetrics.stage1Loss,
        stage2Loss: periodMetrics.stage2Loss,
        totalLoss: periodMetrics.totalLoss,
        stage1LossPct: periodMetrics.stage1LossPercentage,
        stage2LossPct: periodMetrics.stage2LossPercentage,
        totalLossPct: periodMetrics.totalLossPercentage,
      })
    })

    return trend
  }

  // Prepare data for charts
  const prepareConsumptionByTypeData = () => {
    return Object.entries(metrics.consumptionByType)
      .map(([name, value]) => ({
        name,
        value: Math.max(0, value), // Ensure no negative values
      }))
      .filter((item) => item.value > 0)
  }

  const prepareZoneLossData = () => {
    return Object.entries(metrics.zoneMetrics)
      .filter(([zone, data]) => data.l2Bulk > 0 && zone !== "Main Bulk")
      .map(([zone, data]) => ({
        name: zone.replace("Zone_", "").replace("_", " "),
        loss: Math.round(data.lossPercentage * 10) / 10,
      }))
      .sort((a, b) => b.loss - a.loss)
      .slice(0, 5) // Top 5 zones with losses
  }

  const getSelectedZoneMeters = () => {
    return data.filter((row) => row.Zone === selectedZone && row.Label === "L3" && row["Acct #"] !== "4300322")
  }

  const getConsumptionByZoneData = () => {
    const zoneConsumption = {}

    data.forEach((row) => {
      if ((row.Label === "L3" || row.Label === "DC") && row.Zone && row["Acct #"] !== "4300322") {
        const monthKey = `${selectedMonth}-${selectedYear.substring(2)}`
        const value = row[monthKey] || 0

        if (!zoneConsumption[row.Zone]) {
          zoneConsumption[row.Zone] = 0
        }

        zoneConsumption[row.Zone] += value
      }
    })

    return Object.entries(zoneConsumption)
      .filter(([zone, value]) => value > 0)
      .map(([zone, value]) => ({
        name: zone.replace("Zone_", "").replace("_", " "),
        value,
      }))
  }

  // Format numbers for display
  const formatNumber = (num) => {
    if (typeof num !== "number" || isNaN(num)) return "0" // Handle non-numeric or NaN
    return Math.round(num).toLocaleString()
  }

  // Format percentage for display
  const formatPercentage = (value) => {
    if (typeof value !== "number" || isNaN(value)) return "0.0%" // Handle non-numeric or NaN
    return `${Math.round(value * 10) / 10}%`
  }

  // Handle tab selection
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  // Determine status color based on loss percentage
  const getLossStatusColor = (lossPercentage) => {
    if (typeof lossPercentage !== "number" || isNaN(lossPercentage)) return LOSS_COLORS.good // Default color
    if (lossPercentage > 20) return LOSS_COLORS.high
    if (lossPercentage > 10) return LOSS_COLORS.medium
    return LOSS_COLORS.good
  }

  // Determine status text based on loss percentage
  const getLossStatusText = (lossPercentage) => {
    if (typeof lossPercentage !== "number" || isNaN(lossPercentage)) return "Unknown" // Default text
    if (lossPercentage > 20) return "High Loss"
    if (lossPercentage > 10) return "Medium Loss"
    return "Good"
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg text-gray-600">Loading water consumption data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {showMethodology && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Data Methodology:</strong> Using accurate water balance calculations where:
                <br />
                L1: Reading of the single 'L1' meter (Main Bulk (NAMA), Acct # C43659).
                <br />
                L2 (Modified): Sum of all 'L2' meters + Sum of all 'DC' meters.
                <br />
                L3 (Modified): Sum of all 'L3' meters (excluding Acct # 4300322) + Sum of all 'DC' meters.
                <br />
                Stage 1 Loss: L1 - (Sum of 'L2' meters + Sum of 'DC' meters) which simplifies to L1 - L2 (Modified).
                <br />
                Stage 2 Loss: Sum of 'L2' meters - Sum of 'L3' meters (excluding Acct # 4300322).
                <br />
                Total Loss: L1 - (Sum of 'L3' meters (excluding Acct # 4300322) + Sum of all 'DC' meters) which
                simplifies to L1 - L3 (Modified).
              </p>
            </div>
            <button onClick={() => setShowMethodology(false)} className="ml-auto text-blue-500 hover:text-blue-700">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-[#96CDD2] to-[#6F697B] text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Droplet className="h-6 w-6 mr-2" />
            <h1 className="text-2xl font-bold">Muscat Bay Water System</h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Info button */}
            <button
              className="flex items-center bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md px-3 py-1.5 text-sm text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => setShowMethodology(!showMethodology)}
            >
              <Info className="h-4 w-4 mr-1.5" />
              Methodology
            </button>

            {/* Year selector */}
            <select
              className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>

            {/* Month selector */}
            <select
              className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="Jan">January</option>
              <option value="Feb">February</option>
              <option value="Mar">March</option>
              {selectedYear === "2024" && (
                <>
                  <option value="Apr">April</option>
                  <option value="May">May</option>
                  <option value="Jun">June</option>
                  <option value="Jul">July</option>
                  <option value="Aug">August</option>
                  <option value="Sep">September</option>
                  <option value="Oct">October</option>
                  <option value="Nov">November</option>
                  <option value="Dec">December</option>
                </>
              )}
            </select>

            <button
              className="flex items-center bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md px-3 py-1.5 text-sm text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => window.location.reload()} // Simple refresh for demo
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Refresh
            </button>

            <button
              className="flex items-center bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md px-3 py-1.5 text-sm text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => alert("Export functionality not implemented yet.")} // Placeholder
            >
              <Download className="h-4 w-4 mr-1.5" />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {["dashboard", "zones", "types", "loss", "hierarchy", "settings"].map((tab) => (
              <button
                key={tab}
                className={`py-4 px-1 capitalize ${activeTab === tab ? "border-b-2 border-[#96CDD2] text-[#6F697B] font-medium" : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Dashboard Overview - {selectedMonth} {selectedYear}
            </h2>

            {/* First Layer KPI Cards - L1, L2, L3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* L1 Supply */}
              <div className="bg-gradient-to-r from-[#96CDD2] to-[#6F697B] rounded-lg shadow-md p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white text-sm font-medium">L1 Supply</p>
                    <h2 className="text-3xl font-bold mt-1">{formatNumber(metrics.totalL1Supply)} m³</h2>
                  </div>
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <Droplet className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-white opacity-80">Main Bulk</p>
              </div>

              {/* L2 Volume */}
              <div className="bg-[#96CDD2] rounded-lg shadow-md p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white text-sm font-medium">L2 Volume</p>
                    <h2 className="text-3xl font-bold mt-1">{formatNumber(metrics.totalL2Volume)} m³</h2>
                  </div>
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <Droplet className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-white opacity-80">Primary Distribution</p>
              </div>

              {/* L3 Consumption */}
              <div className="bg-[#A8D9DF] rounded-lg shadow-md p-6 text-[#6F697B]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[#6F697B] text-sm font-medium">L3 Consumption</p>
                    <h2 className="text-3xl font-bold mt-1">{formatNumber(metrics.totalL3Volume)} m³</h2>
                  </div>
                  <div className="p-2 bg-[#6F697B] bg-opacity-20 rounded-full">
                    <Droplet className="h-6 w-6 text-[#6F697B]" />
                  </div>
                </div>
                <p className="text-xs text-[#6F697B] opacity-80">End Users</p>
              </div>
            </div>

            {/* Second Layer KPI Cards - Stage 1 Loss, Stage 2 Loss, Total Loss */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stage 1 Loss */}
              <div className={`rounded-lg shadow-md p-6 text-white ${metrics.stage1Loss < 0 ? "bg-[#f59e0b]" : "bg-[#ef4444]"}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white text-sm font-medium">Stage 1 Loss (Trunk)</p>
                    <h2 className="text-3xl font-bold mt-1">{formatNumber(Math.abs(metrics.stage1Loss))} m³</h2>
                  </div>
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <ArrowDownRight className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-white opacity-80">
                  {formatPercentage(Math.abs(metrics.stage1LossPercentage))} of L1
                </p>
              </div>

              {/* Stage 2 Loss */}
              <div className="bg-[#ef4444] rounded-lg shadow-md p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white text-sm font-medium">Stage 2 Loss (Dist.)</p>
                    <h2 className="text-3xl font-bold mt-1">{formatNumber(metrics.stage2Loss)} m³</h2>
                  </div>
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <ArrowDownRight className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-white opacity-80">
                  {formatPercentage(metrics.stage2LossPercentage)} of L2
                </p>
              </div>

              {/* Total Loss (NRW) */}
              <div className="bg-[#8b5cf6] rounded-lg shadow-md p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white text-sm font-medium">Total Loss (NRW)</p>
                    <h2 className="text-3xl font-bold mt-1">{formatNumber(metrics.totalLoss)} m³</h2>
                  </div>
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <ArrowDownRight className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-white opacity-80">
                  {formatPercentage(metrics.totalLossPercentage)} of Supply
                </p>
              </div>
            </div>

            {/* System Volume Comparison */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">System Volume Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: "L1 Supply", volume: metrics.totalL1Supply },
                    { name: "L2 Volume", volume: metrics.totalL2Volume },
                    { name: "L3 Volume", volume: metrics.totalL3Volume },
                    { name: "Total Loss", volume: metrics.totalLoss },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${formatNumber(value)} m³`, "Volume"]} />
                  <Legend />
                  <Bar dataKey="volume">
                    {/* Color bars differently */}
                    <Cell fill="#6F697B" /> {/* L1 */}
                    <Cell fill="#96CDD2" /> {/* L2 */}
                    <Cell fill="#A8D9DF" /> {/* L3 */}
                    <Cell fill="#E57373" /> {/* Loss */}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Water Loss Breakdown */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <ArrowDownRight className="h-5 w-5 text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Water Loss Breakdown</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">Analysis of losses at different stages</p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Stage 1 Loss Pie */}
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={[{ name: "Stage 1", value: 100 }]} // Full circle background
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={60}
                          fill="#f0f0f0"
                          dataKey="value"
                          startAngle={90}
                          endAngle={450}
                        />
                        <Pie
                          data={[{ name: "Stage 1 Loss", value: Math.abs(metrics.stage1LossPercentage) }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={60}
                          fill={metrics.stage1Loss < 0 ? warningColor : alertColor}
                          dataKey="value"
                          startAngle={90}
                          endAngle={90 + (Math.abs(metrics.stage1LossPercentage) / 100) * 360}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: metrics.stage1Loss < 0 ? warningColor : alertColor }}
                      >
                        {formatPercentage(Math.abs(metrics.stage1LossPercentage))}
                      </span>
                    </div>
                    <p className="text-center text-sm mt-2">Stage 1 Loss</p>
                    <p className="text-center text-xs text-gray-500">{formatNumber(Math.abs(metrics.stage1Loss))} m³</p>
                  </div>

                  {/* Stage 2 Loss Pie */}
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={[{ name: "Stage 2", value: 100 }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={60}
                          fill="#f0f0f0"
                          dataKey="value"
                          startAngle={90}
                          endAngle={450}
                        />
                        <Pie
                          data={[{ name: "Stage 2 Loss", value: metrics.stage2LossPercentage }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={60}
                          fill={alertColor}
                          dataKey="value"
                          startAngle={90}
                          endAngle={90 + (metrics.stage2LossPercentage / 100) * 360}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold" style={{ color: alertColor }}>
                        {formatPercentage(metrics.stage2LossPercentage)}
                      </span>
                    </div>
                    <p className="text-center text-sm mt-2">Stage 2 Loss</p>
                    <p className="text-center text-xs text-gray-500">{formatNumber(metrics.stage2Loss)} m³</p>
                  </div>
                </div>
              </div>

              {/* Consumption by Type */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <Droplet className="h-5 w-5 text-blue-500 mr-2" /> {/* Changed icon */}
                  <h3 className="text-lg font-semibold text-gray-800">Consumption by Type</h3>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={prepareConsumptionByTypeData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepareConsumptionByTypeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${formatNumber(value)} m³`, "Volume"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Zone Loss Analysis Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Filter className="h-5 w-5 text-purple-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Zone Loss Analysis</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">Internal losses within each distribution zone</p>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Zone
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        L2 Bulk (m³)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        L3 Sum (m³)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Loss (m³)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Loss (%)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(metrics.zoneMetrics)
                      .filter(([zone, data]) => zone !== "Main Bulk")
                      .sort((a, b) => b[1].lossPercentage - a[1].lossPercentage)
                      .map(([zone, data]) => (
                        <tr key={zone} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{zone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(data.l2Bulk)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(data.l3Sum)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(data.loss)}
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                            style={{ color: getLossStatusColor(data.lossPercentage) }}
                          >
                            {formatPercentage(data.lossPercentage)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                              style={{
                                backgroundColor: getLossStatusColor(data.lossPercentage) + "20", // Add alpha transparency
                                color: getLossStatusColor(data.lossPercentage),
                              }}
                            >
                              {getLossStatusText(data.lossPercentage)}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content */}
        {/* ... the rest of the component remains the same ... */}
      </main>
    </div>
  )
}

export default MuscatBayWaterSystem