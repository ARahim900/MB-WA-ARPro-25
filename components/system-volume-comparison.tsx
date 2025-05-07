import type React from "react"
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface SystemVolumeComparisonProps {
  totalL1Supply: number
  totalL2Volume: number
  totalL3Volume: number
  totalLoss: number
  formatNumber: (num: number) => string
}

export const SystemVolumeComparison: React.FC<SystemVolumeComparisonProps> = ({
  totalL1Supply,
  totalL2Volume,
  totalL3Volume,
  totalLoss,
  formatNumber,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">System Volume Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={[
            { name: "L1 Supply", volume: totalL1Supply },
            { name: "L2 Volume", volume: totalL2Volume },
            { name: "L3 Volume", volume: totalL3Volume },
            { name: "Total Loss", volume: totalLoss },
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
  )
}
