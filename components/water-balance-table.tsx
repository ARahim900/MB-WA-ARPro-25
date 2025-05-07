"use client"
import { getWaterBalanceData } from "@/lib/real-data"

interface WaterBalanceTableProps {
  year: string
}

export function WaterBalanceTable({ year }: WaterBalanceTableProps) {
  const balanceData = getWaterBalanceData(year)

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (typeof num !== "number" || isNaN(num)) return "0"
    return Math.round(num).toLocaleString()
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Month
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              L1
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              L2 (Modified)
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              L3 (Modified)
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stage 1 Loss
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stage 2 Loss
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Loss
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {balanceData.map((item) => (
            <tr key={item.month}>
              <td className="px-3 py-3 whitespace-nowrap text-left">{item.month}</td>
              <td className="px-3 py-3 whitespace-nowrap text-left">{formatNumber(item.L1)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-left">{formatNumber(item.L2Modified)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-left">{formatNumber(item.L3Modified)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-left">{formatNumber(item.stage1Loss)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-left">{formatNumber(item.stage2Loss)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-left">{formatNumber(item.totalLoss)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
