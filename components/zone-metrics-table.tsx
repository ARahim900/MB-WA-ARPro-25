import type React from "react"

interface ZoneMetric {
  l2Bulk: number
  l3Sum: number
  loss: number
  lossPercentage: number
}

interface ZoneMetricsTableProps {
  zoneMetrics: Record<string, ZoneMetric>
  getLossStatusColor: (lossPercentage: number) => string
  getLossStatusText: (lossPercentage: number) => string
  formatNumber: (num: number) => string
  formatPercentage: (value: number) => string
}

export const ZoneMetricsTable: React.FC<ZoneMetricsTableProps> = ({
  zoneMetrics,
  getLossStatusColor,
  getLossStatusText,
  formatNumber,
  formatPercentage,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Zone
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              L2 Bulk (m³)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              L3 Sum (m³)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loss (m³)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loss (%)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(zoneMetrics)
            .filter(([zone, data]) => zone !== "Main Bulk")
            .sort((a, b) => b[1].lossPercentage - a[1].lossPercentage)
            .map(([zone, data]) => (
              <tr key={zone} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{zone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(data.l2Bulk)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(data.l3Sum)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(data.loss)}</td>
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
  )
}
