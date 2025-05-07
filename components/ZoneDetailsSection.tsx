import React, { useState } from 'react';
import useZoneData, { ZoneSummary } from '../lib/hooks/useZoneData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Define colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed', '#8dd1e1'];

const ZoneDetailsSection: React.FC = () => {
  const { zoneSummaries, uniqueZones } = useZoneData();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  
  // Get selected zone data
  const zoneData = selectedZone 
    ? zoneSummaries.find(z => z.zoneName === selectedZone) 
    : null;
  
  // Prepare monthly data for chart
  const getMonthlyChartData = (zoneSummary: ZoneSummary) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = '24'; // Default to 2024
    
    return months.map(month => {
      const key = `${month}-${year}`;
      return {
        name: month,
        consumption: zoneSummary.monthlyConsumption[key] || 0
      };
    });
  };
  
  // Prepare meter type data for pie chart
  const getMeterTypeData = (zoneSummary: ZoneSummary) => {
    return Object.entries(zoneSummary.meterTypes).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };
  
  // Generate comparison data with other zones
  const getZoneComparisonData = () => {
    return zoneSummaries.map(zone => ({
      name: zone.zoneName,
      consumption: zone.totalConsumption
    })).sort((a, b) => b.consumption - a.consumption);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Zone Details</h2>
      
      {/* Zone Selection */}
      <div className="mb-6">
        <label htmlFor="zone-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select Zone
        </label>
        <select
          id="zone-select"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={selectedZone || ''}
          onChange={(e) => setSelectedZone(e.target.value)}
        >
          <option value="">Select a zone</option>
          {uniqueZones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </div>
      
      {selectedZone && zoneData ? (
        <div className="space-y-6">
          {/* Zone Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">Total Consumption</h3>
              <p className="text-3xl font-bold">{zoneData.totalConsumption.toLocaleString()} units</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">% of Main Bulk</h3>
              <p className="text-3xl font-bold">{zoneData.percentageOfMain.toFixed(2)}%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800">Total Meters</h3>
              <p className="text-3xl font-bold">{zoneData.meterCount}</p>
            </div>
          </div>
          
          {/* Monthly Consumption Chart */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Monthly Consumption (2024)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getMonthlyChartData(zoneData)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consumption" fill="#8884d8" name="Consumption" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Meter Types Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Meter Types</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getMeterTypeData(zoneData)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getMeterTypeData(zoneData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Zone Comparison */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Zone Comparison</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getZoneComparisonData()}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="consumption" fill="#82ca9d" name="Total Consumption" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Select a zone to view detailed information
        </div>
      )}
    </div>
  );
};

export default ZoneDetailsSection;
