import { realWaterData } from './real-data';

export interface WaterMeter {
  Label: string;
  "Meter Label": string;
  "Acct #": string;
  Zone: string;
  Type: string;
  "Parent Meter": string;
  [key: string]: any; // For monthly readings
}

export interface ZoneMetric {
  l2Bulk: number;
  l3Sum: number;
  loss: number;
  lossPercentage: number;
}

export interface WaterMetrics {
  totalL1Supply: number;
  totalL2Volume: number;
  totalL3Volume: number;
  stage1Loss: number;
  stage2Loss: number;
  totalLoss: number;
  stage1LossPercentage: number;
  stage2LossPercentage: number;
  totalLossPercentage: number;
  consumptionByType: Record<string, number>;
  zoneMetrics: Record<string, ZoneMetric>;
}

// Get the water data
export const getRealWaterData = (): WaterMeter[] => {
  // Return the imported data
  return realWaterData;
}

// Calculate metrics from the water data
export const calculateRealMetrics = (data: WaterMeter[], month: string, year: string): WaterMetrics => {
  // For debugging
  console.log("Calculating metrics for:", month, year, "with", data.length, "data points");
  
  const monthKey = `${month}-${year.substring(2)}`;
  console.log("Using month key:", monthKey);

  // Find L1 meter (Main Bulk)
  const l1Meter = data.find((row) => row.Label === "L1");
  if (!l1Meter) {
    console.error("L1 meter not found in data!");
  }
  const totalL1Supply = l1Meter ? l1Meter[monthKey] || 0 : 0;

  // Initialize metrics
  let totalL2Native = 0;
  let totalDC = 0;
  let totalL3NativeExcl = 0;
  const consumptionByType: Record<string, number> = {};
  const zoneMetrics: Record<string, ZoneMetric> = {};

  // Initialize zone metrics
  data.forEach((row) => {
    if (row.Zone && !zoneMetrics[row.Zone]) {
      zoneMetrics[row.Zone] = {
        l2Bulk: 0,
        l3Sum: 0,
        loss: 0,
        lossPercentage: 0,
      };
    }
  });

  // Calculate sums with detailed logging
  data.forEach((row) => {
    const value = row[monthKey] || 0;
    
    // Skip problematic meter
    if (row["Acct #"] === "4300322") {
      console.log("Skipping problematic meter:", row["Meter Label"]);
      return;
    }

    // L2 native meters
    if (row.Label === "L2") {
      totalL2Native += value;
      console.log("Added L2 meter:", row["Meter Label"], "value:", value, "running total:", totalL2Native);

      // Add to zone metrics
      if (row.Zone) {
        zoneMetrics[row.Zone].l2Bulk += value;
      }
    }

    // DC meters
    if (row.Label === "DC") {
      totalDC += value;
      console.log("Added DC meter:", row["Meter Label"], "value:", value, "running total:", totalDC);

      // Add to consumption by type
      if (row.Type) {
        consumptionByType[row.Type] = (consumptionByType[row.Type] || 0) + value;
      }
    }

    // L3 native meters (excluding problematic meter)
    if (row.Label === "L3" && row["Acct #"] !== "4300322") {
      totalL3NativeExcl += value;
      console.log("Added L3 meter:", row["Meter Label"], "value:", value, "running total:", totalL3NativeExcl);

      // Add to consumption by type
      if (row.Type) {
        consumptionByType[row.Type] = (consumptionByType[row.Type] || 0) + value;
      }

      // Add to zone metrics for L3
      if (row.Zone) {
        zoneMetrics[row.Zone].l3Sum += value;
      }
    }
  });

  // Calculate L2 and L3 volumes based on the modified definitions
  const totalL2Volume = totalL2Native + totalDC;
  const totalL3Volume = totalL3NativeExcl + totalDC;

  // Calculate losses
  const stage1Loss = totalL1Supply - totalL2Volume;
  const stage2Loss = totalL2Native - totalL3NativeExcl;
  const totalLoss = totalL1Supply - totalL3Volume;

  // Calculate zone losses
  Object.keys(zoneMetrics).forEach((zone) => {
    const { l2Bulk, l3Sum } = zoneMetrics[zone];
    zoneMetrics[zone].loss = l2Bulk - l3Sum;
    zoneMetrics[zone].lossPercentage = l2Bulk > 0 ? ((l2Bulk - l3Sum) / l2Bulk) * 100 : 0;
  });

  // Log final calculated metrics for debugging
  console.log("Final calculated metrics:", {
    totalL1Supply,
    totalL2Volume,
    totalL3Volume,
    stage1Loss,
    stage2Loss,
    totalLoss,
    stage1LossPercentage: totalL1Supply > 0 ? (stage1Loss / totalL1Supply) * 100 : 0,
    stage2LossPercentage: totalL2Volume > 0 ? (stage2Loss / totalL2Volume) * 100 : 0,
    totalLossPercentage: totalL1Supply > 0 ? (totalLoss / totalL1Supply) * 100 : 0,
  });

  return {
    totalL1Supply,
    totalL2Volume,
    totalL3Volume,
    stage1Loss,
    stage2Loss,
    totalLoss,
    stage1LossPercentage: totalL1Supply > 0 ? (stage1Loss / totalL1Supply) * 100 : 0,
    stage2LossPercentage: totalL2Volume > 0 ? (stage2Loss / totalL2Volume) * 100 : 0,
    totalLossPercentage: totalL1Supply > 0 ? (totalLoss / totalL1Supply) * 100 : 0,
    consumptionByType,
    zoneMetrics,
  };
}

// Calculate loss trend data across months
export const calculateLossTrend = (data: WaterMeter[], selectedYear: string) => {
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
        ];

  const trend = [];

  months.forEach((period) => {
    // Calculate metrics for this period
    const periodMetrics = calculateRealMetrics(data, period.substring(0, 3), period.substring(4, 6));

    trend.push({
      period,
      stage1Loss: periodMetrics.stage1Loss,
      stage2Loss: periodMetrics.stage2Loss,
      totalLoss: periodMetrics.totalLoss,
      stage1LossPct: periodMetrics.stage1LossPercentage,
      stage2LossPct: periodMetrics.stage2LossPercentage,
      totalLossPct: periodMetrics.totalLossPercentage,
    });
  });

  return trend;
}