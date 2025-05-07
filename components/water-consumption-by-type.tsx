import type React from "react"
import { Droplet } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface WaterConsumptionByTypeProps {
  data: Array<{ name: string; value: number }>
  colors: string[]
  formatNumber: (num: number) => string
}

export const WaterConsumptionByType: React.FC<WaterConsumptionByTypeProps> = ({ data, colors, formatNumber }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Droplet className="h-5 w-5 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Consumption by Type</h3>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${formatNumber(value)} m³`, "Volume"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
