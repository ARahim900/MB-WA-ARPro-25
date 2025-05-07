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
import { realWaterData, calculateWaterMetrics } from "@/lib/real-data"

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
        setData(realWaterData)

        // Calculate metrics
        const calculatedMetrics = calculateWaterMetrics(realWaterData, selectedMonth, selectedYear)
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
      const periodMetrics = calculateWaterMetrics(data, period.substring(0, 3), period.substring(4, 6))

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

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total L1 Supply */}
              <div className="bg-gradient-to-r from-[#96CDD2] to-[#6F697B] rounded-lg shadow-md p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white text-sm font-medium">Total L1 Supply</p>
                    <h2 className="text-3xl font-bold mt-1">{formatNumber(metrics.totalL1Supply)} m³</h2>
                  </div>
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <Droplet className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-white opacity-80">Main Bulk</p>
              </div>

              {/* Total L3 Consumption */}
              <div className="bg-[#96CDD2] rounded-lg shadow-md p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white text-sm font-medium">Total L3 Consumption</p>
                    <h2 className="text-3xl font-bold mt-1">{formatNumber(metrics.totalL3Volume)} m³</h2>
                  </div>
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <Droplet className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-white opacity-80">End Users</p>
              </div>

              {/* Total Loss (NRW) */}
              <div className="bg-[#6F697B] rounded-lg shadow-md p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white text-sm font-medium">Total Loss (NRW)</p>
                    <h2 className="text-3xl font-bold mt-1">{formatNumber(metrics.totalLoss)} m³</h2>
                  </div>
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <ArrowDownRight className="h-6 w-6 text-white" /> {/* Changed icon */}
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

        {/* Zone Analysis Tab */}
        {activeTab === "zones" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Zone Analysis - {selectedMonth} {selectedYear}
            </h2>

            {/* Zone Selector */}
            <div className="flex items-center bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mr-6">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                  <Filter className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Select Zone:</span>
              </div>
              <select
                className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#96CDD2] focus:border-[#96CDD2]"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
              >
                {Object.keys(metrics.zoneMetrics)
                  .filter((zone) => zone !== "Main Bulk")
                  .map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
              </select>
              <button className="ml-auto p-1.5 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[#96CDD2]">
                <RefreshCw className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Zone Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{selectedZone} Overview</h3>
              <p className="text-sm text-gray-500 mb-6">Water consumption and loss analysis for {selectedZone}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Loss Percentage Pie */}
                <div className="relative col-span-1">
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={[{ name: "BG", value: 100 }]}
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
                        data={[
                          { name: "Loss", value: Math.abs(metrics.zoneMetrics[selectedZone]?.lossPercentage || 0) },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={60}
                        fill={getLossStatusColor(metrics.zoneMetrics[selectedZone]?.lossPercentage || 0)}
                        dataKey="value"
                        startAngle={90}
                        endAngle={90 + (Math.abs(metrics.zoneMetrics[selectedZone]?.lossPercentage || 0) / 100) * 360}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: getLossStatusColor(metrics.zoneMetrics[selectedZone]?.lossPercentage || 0) }}
                    >
                      {formatPercentage(Math.abs(metrics.zoneMetrics[selectedZone]?.lossPercentage || 0))}
                    </span>
                    <span className="text-xs mt-1 opacity-70">Loss</span>
                  </div>
                </div>

                {/* Zone Stats */}
                <div className="col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">L2 Bulk Reading</p>
                      <p className="text-lg font-semibold">
                        {formatNumber(metrics.zoneMetrics[selectedZone]?.l2Bulk || 0)} m³
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">L3 Sum</p>
                      <p className="text-lg font-semibold">
                        {formatNumber(metrics.zoneMetrics[selectedZone]?.l3Sum || 0)} m³
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Loss</p>
                      <p className="text-lg font-semibold">
                        {formatNumber(metrics.zoneMetrics[selectedZone]?.loss || 0)} m³
                      </p>
                      <p
                        className="text-xs font-medium"
                        style={{ color: getLossStatusColor(metrics.zoneMetrics[selectedZone]?.lossPercentage || 0) }}
                      >
                        {getLossStatusText(metrics.zoneMetrics[selectedZone]?.lossPercentage || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone Meters Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Meters in {selectedZone}</h3>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search meters..."
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm mr-2 focus:outline-none focus:ring-1 focus:ring-[#96CDD2] focus:border-[#96CDD2]"
                  />
                  <button className="flex items-center bg-gray-100 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-[#96CDD2]">
                    <Filter className="h-4 w-4 mr-1.5 text-gray-500" />
                    Filter
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Meter Label
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Account #
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Reading (m³)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getSelectedZoneMeters().map((meter) => {
                      const monthKey = `${selectedMonth}-${selectedYear.substring(2)}`
                      return (
                        <tr key={meter["Acct #"]} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {meter["Meter Label"]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meter["Acct #"]}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {meter.Type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(meter[monthKey] || 0)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Type Analysis Tab */}
        {activeTab === "types" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Type Analysis - {selectedMonth} {selectedYear}
            </h2>

            {/* Type Selector */}
            <div className="flex items-center bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mr-6">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <Filter className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Usage Type:</span>
              </div>
              <select
                className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#96CDD2] focus:border-[#96CDD2]"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="All Types">All Types</option>
                {Object.keys(metrics.consumptionByType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{selectedType} Consumption Overview</h3>
              <p className="text-sm text-gray-500 mb-6">
                Total consumption:{" "}
                {formatNumber(
                  selectedType === "All Types" ? metrics.totalL3Volume : metrics.consumptionByType[selectedType] || 0,
                )}{" "}
                m³
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Consumption Trend Placeholder */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Consumption Trend</h4>
                  <div className="bg-gray-50 p-8 rounded-lg flex items-center justify-center h-[200px]">
                    <p className="text-gray-500 text-center">Trend data visualization coming soon.</p>
                  </div>
                </div>

                {/* Consumption by Zone Bar Chart */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Consumption by Zone</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={getConsumptionByZoneData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${formatNumber(value)} m³`, "Consumption"]} />
                      <Bar dataKey="value" fill="#A8D9DF" /> {/* Lighter teal color */}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Type Details KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Total Consumption</h4>
                <p className="text-3xl font-bold text-gray-800">
                  {formatNumber(
                    selectedType === "All Types" ? metrics.totalL3Volume : metrics.consumptionByType[selectedType] || 0,
                  )}{" "}
                  m³
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedType === "All Types"
                    ? `100% of total L3 consumption`
                    : `${formatPercentage(
                        ((metrics.consumptionByType[selectedType] || 0) / metrics.totalL3Volume) * 100,
                      )} of total L3 consumption`}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Highest Consuming Zone</h4>
                <p className="text-3xl font-bold text-[#96CDD2]">
                  {getConsumptionByZoneData().length > 0
                    ? getConsumptionByZoneData().sort((a, b) => b.value - a.value)[0].name
                    : "N/A"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getConsumptionByZoneData().length > 0
                    ? `${formatNumber(getConsumptionByZoneData().sort((a, b) => b.value - a.value)[0].value)} m³`
                    : "No data available"}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Average per Zone</h4>
                <p className="text-3xl font-bold text-[#6F697B]">
                  {getConsumptionByZoneData().length > 0
                    ? formatNumber(
                        getConsumptionByZoneData().reduce((sum, zone) => sum + zone.value, 0) /
                          getConsumptionByZoneData().filter((z) => z.value > 0).length,
                      )
                    : "N/A"}{" "}
                  m³
                </p>
                <p className="text-xs text-gray-500 mt-1">Excluding zones with zero consumption</p>
              </div>
            </div>
          </div>
        )}

        {/* Loss Analysis Tab */}
        {activeTab === "loss" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Loss Analysis - {selectedMonth} {selectedYear}
            </h2>

            {/* Loss Period Selector */}
            <div className="flex items-center bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mr-6">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Period:</span>
              </div>
              <p className="text-sm font-medium text-gray-700">
                {selectedMonth} {selectedYear}
              </p>
              <button className="ml-auto flex items-center bg-gray-100 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-[#96CDD2]">
                <Download className="h-4 w-4 mr-1.5 text-gray-500" />
                Export Report
              </button>
            </div>

            {/* Loss KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stage 1 Loss */}
              <div
                className="rounded-lg shadow-md p-6 text-white"
                style={{ backgroundColor: metrics.stage1Loss < 0 ? warningColor : alertColor }}
              >
                <div className="flex items-center mb-2">
                  <ArrowDownRight className="h-5 w-5 text-white opacity-80 mr-2" />
                  <h3 className="text-lg font-semibold">Stage 1 Loss (Trunk)</h3>
                </div>
                <h2 className="text-3xl font-bold mb-1">{formatNumber(Math.abs(metrics.stage1Loss))} m³</h2>
                <p className="text-sm opacity-80">({formatPercentage(Math.abs(metrics.stage1LossPercentage))} of L1)</p>
                {metrics.stage1Loss < 0 && (
                  <p className="text-xs mt-1 opacity-90 font-medium">
                    Note: Negative loss indicates potential L1 meter under-reading or L2 over-reading.
                  </p>
                )}
              </div>

              {/* Stage 2 Loss */}
              <div className="rounded-lg shadow-md p-6 text-white" style={{ backgroundColor: alertColor }}>
                <div className="flex items-center mb-2">
                  <ArrowDownRight className="h-5 w-5 text-white opacity-80 mr-2" />
                  <h3 className="text-lg font-semibold">Stage 2 Loss (Dist.)</h3>
                </div>
                <h2 className="text-3xl font-bold mb-1">{formatNumber(metrics.stage2Loss)} m³</h2>
                <p className="text-sm opacity-80">({formatPercentage(metrics.stage2LossPercentage)} of L2)</p>
              </div>

              {/* Total Loss */}
              <div className="rounded-lg shadow-md p-6 text-white" style={{ backgroundColor: purpleColor }}>
                <div className="flex items-center mb-2">
                  <ArrowDownRight className="h-5 w-5 text-white opacity-80 mr-2" />
                  <h3 className="text-lg font-semibold">Total Loss (NRW)</h3>
                </div>
                <h2 className="text-3xl font-bold mb-1">{formatNumber(metrics.totalLoss)} m³</h2>
                <p className="text-sm opacity-80">({formatPercentage(metrics.totalLossPercentage)} of L1)</p>
              </div>
            </div>

            {/* Water Loss Trends */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Water Loss Trends (%)</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Percentage of water loss at different stages over available months
              </p>

              {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={calculateLossTrend()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value) => [`${Math.abs(value).toFixed(1)}%`, "Loss"]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="stage1LossPct"
                      name="Stage 1 Loss %"
                      stroke={warningColor}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="stage2LossPct"
                      name="Stage 2 Loss %"
                      stroke={alertColor}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalLossPct"
                      name="Total Loss %"
                      stroke={purpleColor}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="bg-gray-50 p-8 rounded-lg flex items-center justify-center h-60">
                  <p className="text-gray-500">No trend data available</p>
                </div>
              )}
            </div>

            {/* Zone Loss Analysis Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Filter className="h-5 w-5 text-purple-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Zone Loss Analysis</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">Internal losses within each distribution zone</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Zone Loss Table */}
                <div className="overflow-y-auto max-h-96 border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Zone
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          L2 Bulk (m³)
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          L3 Sum (m³)
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Loss (m³)
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Loss (%)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(metrics.zoneMetrics)
                        .filter(([zone, data]) => zone !== "Main Bulk")
                        .sort((a, b) => b[1].lossPercentage - a[1].lossPercentage)
                        .map(([zone, data]) => (
                          <tr key={zone} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{zone}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatNumber(data.l2Bulk)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatNumber(data.l3Sum)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatNumber(data.loss)}
                            </td>
                            <td
                              className="px-4 py-3 whitespace-nowrap text-sm font-medium"
                              style={{ color: getLossStatusColor(data.lossPercentage) }}
                            >
                              {formatPercentage(data.lossPercentage)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Zone Loss Bar Chart */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Zone Loss Comparison (%)</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(metrics.zoneMetrics)
                        .filter(([zone, data]) => zone !== "Main Bulk" && data.l2Bulk > 0)
                        .map(([zone, data]) => ({
                          name: zone.replace("Zone_", "").replace("_", " "),
                          loss: Math.round(data.lossPercentage * 10) / 10,
                        }))
                        .sort((a, b) => b.loss - a.loss)}
                      margin={{ top: 5, right: 5, left: 5, bottom: 40 }} // Increased bottom margin for labels
                      layout="vertical" // Changed to vertical bar chart
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" unit="%" domain={[0, "dataMax + 10"]} />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip formatter={(value) => [`${value}%`, "Loss"]} />
                      <Bar dataKey="loss">
                        {Object.entries(metrics.zoneMetrics)
                          .filter(([zone, data]) => zone !== "Main Bulk" && data.l2Bulk > 0)
                          .map(([zone, data]) => ({ name: zone, lossPercentage: data.lossPercentage }))
                          .sort((a, b) => b.lossPercentage - a.lossPercentage)
                          .map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getLossStatusColor(entry.lossPercentage)} />
                          ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Loss Analysis Details Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stage 1 Loss Analysis Box */}
              <div
                className={`bg-gradient-to-r ${metrics.stage1Loss < 0 ? "from-yellow-50 to-orange-50 border-yellow-200" : "from-red-50 to-pink-50 border-red-200"} border rounded-lg p-6 shadow-sm`}
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`h-8 w-8 rounded-full ${metrics.stage1Loss < 0 ? "bg-yellow-100" : "bg-red-100"} flex items-center justify-center mr-2`}
                  >
                    <ArrowDownRight
                      className={`h-4 w-4 ${metrics.stage1Loss < 0 ? "text-yellow-600" : "text-red-600"}`}
                    />
                  </div>
                  <h3 className="text-md font-semibold text-gray-800">Stage 1 Loss Analysis (Trunk)</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {/* Stats */}
                  <div className="bg-white bg-opacity-60 p-3 rounded">
                    <p className="text-xs text-gray-500">L1 Supply:</p>
                    <p className="text-lg font-semibold">{formatNumber(metrics.totalL1Supply)} m³</p>
                  </div>
                  <div className="bg-white bg-opacity-60 p-3 rounded">
                    <p className="text-xs text-gray-500">L2 Volume:</p>
                    <p className="text-lg font-semibold">{formatNumber(metrics.totalL2Volume)} m³</p>
                  </div>
                  <div className="bg-white bg-opacity-60 p-3 rounded">
                    <p className="text-xs text-gray-500">Stage 1 Loss:</p>
                    <p className="text-lg font-semibold">{formatNumber(Math.abs(metrics.stage1Loss))} m³</p>
                    <p className={`text-xs ${metrics.stage1Loss < 0 ? "text-yellow-600" : "text-red-600"}`}>
                      ({formatPercentage(Math.abs(metrics.stage1LossPercentage))})
                    </p>
                  </div>
                </div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Potential causes:</h4>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li>Leakage in main trunk pipeline</li>
                  <li>Main bulk meter calibration issue (under/over reading)</li>
                  <li>Unmonitored connections or illegal taps</li>
                  {metrics.stage1Loss < 0 && <li>Negative loss suggests L1 meter under-reading or L2 over-reading</li>}
                </ul>
              </div>

              {/* Stage 2 Loss Analysis Box */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  </div>
                  <h3 className="text-md font-semibold text-gray-800">Stage 2 Loss Analysis (Distribution)</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {/* Stats */}
                  <div className="bg-white bg-opacity-60 p-3 rounded">
                    <p className="text-xs text-gray-500">L2 Volume:</p>
                    <p className="text-lg font-semibold">{formatNumber(metrics.totalL2Volume)} m³</p>
                  </div>
                  <div className="bg-white bg-opacity-60 p-3 rounded">
                    <p className="text-xs text-gray-500">L3 Volume:</p>
                    <p className="text-lg font-semibold">{formatNumber(metrics.totalL3Volume)} m³</p>
                  </div>
                  <div className="bg-white bg-opacity-60 p-3 rounded">
                    <p className="text-xs text-gray-500">Stage 2 Loss:</p>
                    <p className="text-lg font-semibold">{formatNumber(metrics.stage2Loss)} m³</p>
                    <p className="text-xs text-red-600">({formatPercentage(metrics.stage2LossPercentage)})</p>
                  </div>
                </div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Potential causes & High Loss Zones:</h4>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li>Distribution network leaks within zones</li>
                  <li>Unmonitored consumption / unauthorized connections</li>
                  {Object.entries(metrics.zoneMetrics)
                    .filter(([zone, data]) => data.lossPercentage > 20 && zone !== "Main Bulk")
                    .slice(0, 3) // Show top 3 high loss zones
                    .map(([zone, data]) => (
                      <li key={zone} className="font-medium">
                        {zone}: {formatPercentage(data.lossPercentage)} loss
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Water Balance Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Water Balance Table</h3>
              <WaterBalanceTable year={selectedYear} />
            </div>
          </div>
        )}

        {/* System Hierarchy Tab */}
        {activeTab === "hierarchy" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              System Hierarchy - {selectedMonth} {selectedYear}
            </h2>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Water Distribution Hierarchy</h3>
              <p className="text-sm text-gray-500 mb-6">Visual representation of the water flow through the system</p>

              <div className="flex flex-col items-center space-y-4">
                {/* L1 - Main Bulk */}
                <div className="bg-[#6F697B] text-white px-6 py-3 rounded-lg w-full md:w-96 text-center shadow">
                  <p className="text-sm font-medium">L1 - Main Bulk (NAMA)</p>
                  <p className="text-xs opacity-80">Primary Water Source</p>
                  <p className="text-lg font-bold mt-1">{formatNumber(metrics.totalL1Supply)} m³</p>
                </div>

                {/* Arrow down with Stage 1 Loss */}
                <div className="relative h-12 w-full flex justify-center items-center">
                  <div className="absolute top-0 h-full border-l-2 border-gray-300"></div>
                  <div className="absolute z-10 bg-white px-2">
                    <div
                      className={`flex items-center text-xs p-1 rounded border ${metrics.stage1Loss < 0 ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "bg-red-50 border-red-200 text-red-700"}`}
                    >
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      Stage 1 Loss: {formatNumber(Math.abs(metrics.stage1Loss))} m³ (
                      {formatPercentage(Math.abs(metrics.stage1LossPercentage))})
                    </div>
                  </div>
                </div>

                {/* L2 - Primary Distribution */}
                <div className="bg-[#96CDD2] text-white px-6 py-3 rounded-lg w-full md:w-96 text-center shadow">
                  <p className="text-sm font-medium">L2 - Primary Distribution</p>
                  <p className="text-xs opacity-80">Zone Bulk Meters + Direct Connections from L1</p>
                  <p className="text-lg font-bold mt-1">{formatNumber(metrics.totalL2Volume)} m³</p>
                </div>

                {/* Arrow down with Stage 2 Loss */}
                <div className="relative h-12 w-full flex justify-center items-center">
                  <div className="absolute top-0 h-full border-l-2 border-gray-300"></div>
                  <div className="absolute z-10 bg-white px-2">
                    <div className="flex items-center text-xs bg-red-50 border border-red-200 text-red-700 p-1 rounded">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      Stage 2 Loss: {formatNumber(metrics.stage2Loss)} m³ (
                      {formatPercentage(metrics.stage2LossPercentage)})
                    </div>
                  </div>
                </div>

                {/* L3 - Final Consumption */}
                <div className="bg-[#A8D9DF] text-[#6F697B] px-6 py-3 rounded-lg w-full md:w-96 text-center shadow">
                  <p className="text-sm font-medium">L3 - Final Consumption</p>
                  <p className="text-xs opacity-80">End-User Meters + All DC Meters</p>
                  <p className="text-lg font-bold mt-1">{formatNumber(metrics.totalL3Volume)} m³</p>
                </div>

                {/* Total Loss Summary */}
                <div className="bg-purple-50 border border-purple-200 px-6 py-3 rounded-lg w-full md:w-96 mt-4 shadow-sm">
                  <div className="flex items-center justify-center mb-1">
                    <ArrowDownRight className="h-4 w-4 text-purple-500 mr-1" />
                    <p className="text-sm font-medium text-purple-800">Total System Loss (NRW)</p>
                  </div>
                  <div className="flex justify-center">
                    <p className="text-xs text-purple-600 mr-2">L1 - L3 = {formatNumber(metrics.totalLoss)} m³</p>
                    <p className="text-xs font-medium text-purple-800">
                      ({formatPercentage(metrics.totalLossPercentage)} of L1 supply)
                    </p>
                  </div>
                </div>
              </div>

              {/* Hierarchy Definitions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-800 mb-4">Hierarchy Definitions & Calculation Logic</h4>
                <div className="space-y-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
                  <p>
                    <strong>L1 (Source):</strong> Total water entering the system measured by the main bulk meter.
                  </p>
                  <p>
                    <strong>L2 (Primary Distribution):</strong> Sum of all Zone Bulk Meters + Direct Connection (DC)
                    meters directly fed from L1.
                  </p>
                  <p>
                    <strong>L3 (Final Consumption):</strong> Sum of all End-User (L3 labeled) meters + All DC meters (as
                    they represent final consumption points not feeding further zones).
                  </p>
                  <p>
                    <strong>Stage 1 Loss:</strong> L1 Supply - Total L2 Volume. Loss between source and primary
                    distribution points.
                  </p>
                  <p>
                    <strong>Stage 2 Loss:</strong> Total L2 Volume - Total L3 Volume. Combined loss within distribution
                    zones and along DC lines after L2 measurement.
                  </p>
                  <p>
                    <strong>Total Loss (NRW):</strong> L1 Supply - Total L3 Volume. Overall system loss (Stage 1 + Stage
                    2).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Application Settings</h3>

              <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-medium text-gray-700">Dark Mode</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" disabled />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#96CDD2]"></div>
                    <span className="ml-3 text-sm font-medium text-gray-400">Coming Soon</span>
                  </label>
                </div>

                {/* Default Start Period */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Default Start Period</label>
                  <div className="grid grid-cols-2 gap-4">
                    <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#96CDD2] focus:border-[#96CDD2]">
                      <option>2025</option>
                      <option>2024</option>
                    </select>
                    <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#96CDD2] focus:border-[#96CDD2]">
                      <option>Jan</option>
                      <option>Feb</option>
                      <option>Mar</option>
                      <option>Apr</option>
                      <option>May</option>
                      <option>Jun</option>
                      <option>Jul</option>
                      <option>Aug</option>
                      <option>Sep</option>
                      <option>Oct</option>
                      <option>Nov</option>
                      <option>Dec</option>
                    </select>
                  </div>
                </div>

                {/* Loss Warning Thresholds */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Loss Warning Thresholds</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">High Loss (%)</label>
                      <input
                        type="number"
                        defaultValue="20"
                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#96CDD2] focus:border-[#96CDD2]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Medium Loss (%)</label>
                      <input
                        type="number"
                        defaultValue="10"
                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#96CDD2] focus:border-[#96CDD2]"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Notification Settings</label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[#96CDD2] focus:ring-[#96CDD2]"
                      />
                      <span className="text-sm text-gray-600">Email Alerts for High Loss Zones</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[#96CDD2] focus:ring-[#96CDD2]"
                      />
                      <span className="text-sm text-gray-600">Monthly Report Generation Reminder</span>
                    </label>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t mt-8">
                  <button className="bg-[#96CDD2] text-white px-5 py-2 rounded-md shadow-sm hover:bg-[#6F697B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#96CDD2]">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default MuscatBayWaterSystem
