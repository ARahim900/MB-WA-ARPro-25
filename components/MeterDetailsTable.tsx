import React, { useState } from 'react';
import useZoneData, { MeterData } from '../lib/hooks/useZoneData';

interface MeterDetailsTableProps {
  zoneName?: string;
}

const MeterDetailsTable: React.FC<MeterDetailsTableProps> = ({ zoneName }) => {
  const { meters } = useZoneData(zoneName);
  const [sortField, setSortField] = useState<keyof MeterData>('meterLabel');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  
  // Get all unique meter types
  const meterTypes = Array.from(new Set(meters.map(meter => meter.type)));
  
  // Handle sorting
  const handleSort = (field: keyof MeterData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Sort and filter meters
  const filteredMeters = meters
    .filter(meter => {
      const searchMatch = search === '' || 
        meter.meterLabel.toLowerCase().includes(search.toLowerCase()) ||
        meter.accountNumber.toLowerCase().includes(search.toLowerCase());
      
      const typeMatch = typeFilter === '' || meter.type === typeFilter;
      
      return searchMatch && typeMatch;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
    
  // Get total for the last 3 months (latest available, e.g. Jan-25, Feb-25, Mar-25)
  const getLatestThreeMonthsTotal = (meter: MeterData) => {
    const latestMonths = ['Jan-25', 'Feb-25', 'Mar-25'];
    return latestMonths.reduce((sum, month) => sum + (meter.monthlyConsumption[month] || 0), 0);
  };
  
  // Calculate overall totals
  const totalConsumption = filteredMeters.reduce((sum, meter) => sum + meter.totalConsumption, 0);
  const totalLatestThreeMonths = filteredMeters.reduce((sum, meter) => sum + getLatestThreeMonthsTotal(meter), 0);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">
        {zoneName ? `${zoneName} Meters` : 'All Meters'}
      </h2>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by meter label or account number..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-64">
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Meter Types</option>
            {meterTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Total Consumption</h3>
          <p className="text-3xl font-bold">{totalConsumption.toLocaleString()} units</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Latest 3 Months</h3>
          <p className="text-3xl font-bold">{totalLatestThreeMonths.toLocaleString()} units</p>
        </div>
      </div>
      
      {/* Meters Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('meterLabel')}
              >
                Meter Label
                {sortField === 'meterLabel' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('accountNumber')}
              >
                Account #
                {sortField === 'accountNumber' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('type')}
              >
                Type
                {sortField === 'type' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('totalConsumption')}
              >
                Total
                {sortField === 'totalConsumption' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jan 25
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feb 25
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mar 25
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMeters.map((meter) => (
              <tr key={meter.accountNumber} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {meter.meterLabel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {meter.accountNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      meter.type === 'Zone Bulk' ? 'bg-blue-100 text-blue-800' :
                      meter.type === 'Retail' ? 'bg-green-100 text-green-800' :
                      meter.type === 'IRR_Servies' ? 'bg-orange-100 text-orange-800' :
                      meter.type === 'MB_Common' ? 'bg-purple-100 text-purple-800' :
                      meter.type === 'Residential (Villa)' ? 'bg-yellow-100 text-yellow-800' :
                      meter.type === 'Residential (Apart)' ? 'bg-indigo-100 text-indigo-800' :
                      meter.type === 'Main BULK' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {meter.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {meter.totalConsumption.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(meter.monthlyConsumption['Jan-25'] || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(meter.monthlyConsumption['Feb-25'] || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(meter.monthlyConsumption['Mar-25'] || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* No Results Message */}
      {filteredMeters.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No meters found matching your filters
        </div>
      )}
    </div>
  );
};

export default MeterDetailsTable;
