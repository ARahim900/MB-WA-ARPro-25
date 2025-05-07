import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import ZoneDetailsSection from '../components/ZoneDetailsSection';
import MeterDetailsTable from '../components/MeterDetailsTable';
import useZoneData from '../lib/hooks/useZoneData';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Dashboard: React.FC = () => {
  const { uniqueZones } = useZoneData();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  
  // Define the tabs for the dashboard
  const tabs = [
    { name: 'Overview', key: 'overview' },
    { name: 'Zone Details', key: 'zone-details' },
    { name: 'Meter List', key: 'meter-list' },
    { name: 'Reports', key: 'reports' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Water Analysis Dashboard</h1>
            
            {/* Zone Selector */}
            <div className="w-64">
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedZone || ''}
                onChange={(e) => setSelectedZone(e.target.value || null)}
              >
                <option value="">All Zones</option>
                {uniqueZones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tab.Group>
          {/* Tab List */}
          <Tab.List className="flex p-1 space-x-1 bg-white rounded-xl mb-6 shadow">
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                className={({ selected }) =>
                  classNames(
                    'w-full py-3 text-sm font-medium leading-5 text-gray-700 rounded-lg',
                    'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
                    selected
                      ? 'bg-blue-50 shadow text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  )
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
          
          {/* Tab Panels */}
          <Tab.Panels className="mt-2">
            {/* Overview Panel */}
            <Tab.Panel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Summary Cards */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold mb-4">Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-800">Total Consumption</h3>
                      <p className="text-3xl font-bold">430,217 units</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-800">Total Zones</h3>
                      <p className="text-3xl font-bold">{uniqueZones.length}</p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-purple-800">Latest Data</h3>
                      <p className="text-xl">March 2025</p>
                    </div>
                  </div>
                </div>
                
                {/* Quick Navigation */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold mb-4">Quick Navigation</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {uniqueZones.slice(0, 6).map((zone) => (
                      <button
                        key={zone}
                        className="p-4 bg-gray-50 rounded-lg text-left hover:bg-blue-50 transition-colors"
                        onClick={() => {
                          setSelectedZone(zone);
                          // Find the zone details tab and click it
                          const zoneDetailsTab = document.querySelector('[data-headlessui-state="selected"]')?.nextElementSibling;
                          if (zoneDetailsTab instanceof HTMLElement) {
                            zoneDetailsTab.click();
                          }
                        }}
                      >
                        <h3 className="font-semibold">{zone}</h3>
                        <p className="text-sm text-gray-500">View Details</p>
                      </button>
                    ))}
                    
                    {uniqueZones.length > 6 && (
                      <button
                        className="p-4 bg-gray-50 rounded-lg text-left hover:bg-blue-50 transition-colors"
                        onClick={() => {
                          // Find the zone details tab and click it
                          const zoneDetailsTab = document.querySelector('[data-headlessui-state="selected"]')?.nextElementSibling;
                          if (zoneDetailsTab instanceof HTMLElement) {
                            zoneDetailsTab.click();
                          }
                        }}
                      >
                        <h3 className="font-semibold">More Zones...</h3>
                        <p className="text-sm text-gray-500">View All</p>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Tab.Panel>
            
            {/* Zone Details Panel */}
            <Tab.Panel>
              <ZoneDetailsSection />
            </Tab.Panel>
            
            {/* Meter List Panel */}
            <Tab.Panel>
              <MeterDetailsTable zoneName={selectedZone || undefined} />
            </Tab.Panel>
            
            {/* Reports Panel */}
            <Tab.Panel>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Reports</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Report Cards */}
                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg">Monthly Consumption Trends</h3>
                    <p className="text-sm text-gray-500 mb-4">View consumption trends by month</p>
                    <button className="text-blue-600 hover:text-blue-800">Generate Report</button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg">Zone Comparison</h3>
                    <p className="text-sm text-gray-500 mb-4">Compare consumption across zones</p>
                    <button className="text-blue-600 hover:text-blue-800">Generate Report</button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg">Year-over-Year Analysis</h3>
                    <p className="text-sm text-gray-500 mb-4">Compare 2024 vs 2025 consumption</p>
                    <button className="text-blue-600 hover:text-blue-800">Generate Report</button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg">Meter Type Analysis</h3>
                    <p className="text-sm text-gray-500 mb-4">Analyze consumption by meter type</p>
                    <button className="text-blue-600 hover:text-blue-800">Generate Report</button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg">Anomaly Detection</h3>
                    <p className="text-sm text-gray-500 mb-4">Identify unusual consumption patterns</p>
                    <button className="text-blue-600 hover:text-blue-800">Generate Report</button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg">Custom Report</h3>
                    <p className="text-sm text-gray-500 mb-4">Create a customized report</p>
                    <button className="text-blue-600 hover:text-blue-800">Create Custom Report</button>
                  </div>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </main>
    </div>
  );
};

export default Dashboard;
