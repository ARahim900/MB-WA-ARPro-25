import { realWaterData } from '../real-data';

export type MeterType = 'Main BULK' | 'Zone Bulk' | 'Retail' | 'IRR_Servies' | 'MB_Common' | 'Residential (Villa)' | 'Residential (Apart)';
export type ZoneType = string;
export type MeterHierarchy = 'L1' | 'L2' | 'L3' | 'DC';

export interface WaterConsumption {
  [month: string]: number;
}

export interface ZoneSummary {
  zoneId: string;
  zoneName: string;
  totalConsumption: number;
  monthlyConsumption: WaterConsumption;
  percentageOfMain: number;
  meterCount: number;
  meterTypes: {[key in MeterType]?: number};
}

export interface MeterData {
  label: string;
  meterLabel: string;
  accountNumber: string;
  zone: string;
  type: MeterType;
  parentMeter: string;
  monthlyConsumption: WaterConsumption;
  totalConsumption: number;
}

/**
 * Processes the raw water data into a more usable format
 */
export function processWaterData(): MeterData[] {
  return realWaterData.map(meter => {
    // Extract monthly consumption data
    const monthlyConsumption: WaterConsumption = {};
    let totalConsumption = 0;
    
    // Process all months (both 2024 and 2025)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const years = ["24", "25"];
    
    years.forEach(year => {
      months.forEach(month => {
        const key = `${month}-${year}`;
        if (meter[key as keyof typeof meter] !== undefined) {
          const value = Number(meter[key as keyof typeof meter]);
          monthlyConsumption[key] = value;
          totalConsumption += value;
        }
      });
    });

    return {
      label: meter.Label,
      meterLabel: meter["Meter Label"],
      accountNumber: meter["Acct #"],
      zone: meter.Zone,
      type: meter.Type as MeterType,
      parentMeter: meter["Parent Meter"],
      monthlyConsumption,
      totalConsumption
    };
  });
}

/**
 * Get all unique zones from the water data
 */
export function getUniqueZones(): string[] {
  const zones = new Set<string>();
  realWaterData.forEach(meter => {
    if (meter.Zone) {
      zones.add(meter.Zone);
    }
  });
  return Array.from(zones).sort();
}

/**
 * Filter meters by zone
 */
export function getZoneMeters(zoneName: string): MeterData[] {
  const processedData = processWaterData();
  return processedData.filter(meter => meter.zone === zoneName);
}

/**
 * Get summary data for each zone
 */
export function getZoneSummaries(): ZoneSummary[] {
  const meters = processWaterData();
  const zones = getUniqueZones();
  const mainMeter = meters.find(meter => meter.type === 'Main BULK');
  
  if (!mainMeter) {
    return [];
  }
  
  return zones.map(zone => {
    const zoneMeters = meters.filter(meter => meter.zone === zone);
    const totalConsumption = zoneMeters.reduce((sum, meter) => sum + meter.totalConsumption, 0);
    
    // Count meters by type
    const meterTypes: {[key in MeterType]?: number} = {};
    zoneMeters.forEach(meter => {
      if (meter.type) {
        meterTypes[meter.type] = (meterTypes[meter.type] || 0) + 1;
      }
    });
    
    // Calculate monthly consumption
    const monthlyConsumption: WaterConsumption = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const years = ["24", "25"];
    
    years.forEach(year => {
      months.forEach(month => {
        const key = `${month}-${year}`;
        monthlyConsumption[key] = zoneMeters.reduce((sum, meter) => {
          return sum + (meter.monthlyConsumption[key] || 0);
        }, 0);
      });
    });
    
    // Calculate percentage of main consumption
    const percentageOfMain = mainMeter.totalConsumption ? 
      (totalConsumption / mainMeter.totalConsumption) * 100 : 0;
    
    return {
      zoneId: zone.replace(/\s+/g, '-').toLowerCase(),
      zoneName: zone,
      totalConsumption,
      monthlyConsumption,
      percentageOfMain,
      meterCount: zoneMeters.length,
      meterTypes
    };
  });
}

/**
 * Hook to get zone-specific data
 */
export function useZoneData(zoneName?: string) {
  const allMeters = processWaterData();
  const zoneSummaries = getZoneSummaries();
  
  // Get specific zone data if requested
  const zoneData = zoneName ? 
    allMeters.filter(meter => meter.zone === zoneName) : 
    allMeters;
  
  const zoneSummary = zoneName ?
    zoneSummaries.find(summary => summary.zoneName === zoneName) :
    undefined;
    
  return {
    meters: zoneData,
    allMeters,
    zoneSummaries,
    zoneSummary,
    uniqueZones: getUniqueZones()
  };
}

export default useZoneData;
