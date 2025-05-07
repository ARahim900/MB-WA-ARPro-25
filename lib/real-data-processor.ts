// This file provides functions to process the real water system data

// Define types for the water system data
export interface WaterMeter {
  Label: string
  "Meter Label": string
  "Acct #": string
  Zone: string
  Type: string
  "Parent Meter": string
  [key: string]: any // For monthly readings like "Jan-25", "Feb-25", etc.
}

export interface ZoneMetric {
  l2Bulk: number
  l3Sum: number
  loss: number
  lossPercentage: number
}

export interface WaterMetrics {
  totalL1Supply: number
  totalL2Volume: number
  totalL3Volume: number
  stage1Loss: number
  stage2Loss: number
  totalLoss: number
  stage1LossPercentage: number
  stage2LossPercentage: number
  totalLossPercentage: number
  consumptionByType: Record<string, number>
  zoneMetrics: Record<string, ZoneMetric>
}

// Real data for the Muscat Bay water system
export const getRealWaterData = (): WaterMeter[] => {
  // This would normally fetch from an API or database
  // For now, we'll return a subset of the real data

  const data: WaterMeter[] = [
    // L1 Main Bulk meter
    {
      Label: "L1",
      "Meter Label": "Main Bulk (NAMA)",
      "Acct #": "C43659",
      Zone: "Main Bulk",
      Type: "Bulk",
      "Parent Meter": "",
      "Jan-25": 32580,
      "Feb-25": 44043,
      "Mar-25": 34915,
      "Jan-24": 32803,
      "Feb-24": 27996,
      "Mar-24": 23860,
      "Apr-24": 31869,
      "May-24": 30737,
      "Jun-24": 41953,
      "Jul-24": 35166,
      "Aug-24": 35420,
      "Sep-24": 41341,
      "Oct-24": 31519,
      "Nov-24": 35290,
      "Dec-24": 36733,
    },

    // Zone FM (Zone 01) Bulk meter
    {
      Label: "L2",
      "Meter Label": "ZONE FM ( BULK ZONE FM )",
      "Acct #": "4300346",
      Zone: "Zone_01",
      Type: "Bulk",
      "Parent Meter": "Main Bulk (NAMA)",
      "Jan-25": 2008,
      "Feb-25": 1740,
      "Mar-25": 1880,
      "Jan-24": 1595,
      "Feb-24": 1283,
      "Mar-24": 1255,
      "Apr-24": 1383,
      "May-24": 1411,
      "Jun-24": 2078,
      "Jul-24": 2601,
      "Aug-24": 1638,
      "Sep-24": 1550,
      "Oct-24": 2098,
      "Nov-24": 1808,
      "Dec-24": 1946,
    },

    // Zone 3A Bulk meter
    {
      Label: "L2",
      "Meter Label": "ZONE 3A (BULK ZONE 3A)",
      "Acct #": "4300343",
      Zone: "Zone_03A",
      Type: "Bulk",
      "Parent Meter": "Main Bulk (NAMA)",
      "Jan-25": 4235,
      "Feb-25": 4273,
      "Mar-25": 3591,
      "Jan-24": 1234,
      "Feb-24": 1099,
      "Mar-24": 1297,
      "Apr-24": 1892,
      "May-24": 2254,
      "Jun-24": 2227,
      "Jul-24": 3313,
      "Aug-24": 3172,
      "Sep-24": 2698,
      "Oct-24": 3715,
      "Nov-24": 3501,
      "Dec-24": 3796,
    },

    // Zone 3B Bulk meter
    {
      Label: "L2",
      "Meter Label": "ZONE 3B (BULK ZONE 3B)",
      "Acct #": "4300344",
      Zone: "Zone_03B",
      Type: "Bulk",
      "Parent Meter": "Main Bulk (NAMA)",
      "Jan-25": 3256,
      "Feb-25": 2962,
      "Mar-25": 3331,
      "Jan-24": 2653,
      "Feb-24": 2169,
      "Mar-24": 2315,
      "Apr-24": 2381,
      "May-24": 2634,
      "Jun-24": 2932,
      "Jul-24": 3369,
      "Aug-24": 3458,
      "Sep-24": 3742,
      "Oct-24": 2906,
      "Nov-24": 2695,
      "Dec-24": 3583,
    },

    // Zone 5 Bulk meter
    {
      Label: "L2",
      "Meter Label": "ZONE 5 (Bulk Zone 5)",
      "Acct #": "4300345",
      Zone: "Zone_05",
      Type: "Bulk",
      "Parent Meter": "Main Bulk (NAMA)",
      "Jan-25": 4267,
      "Feb-25": 4231,
      "Mar-25": 3862,
      "Jan-24": 4286,
      "Feb-24": 3897,
      "Mar-24": 4127,
      "Apr-24": 4911,
      "May-24": 2639,
      "Jun-24": 4992,
      "Jul-24": 5305,
      "Aug-24": 4039,
      "Sep-24": 2736,
      "Oct-24": 3383,
      "Nov-24": 1438,
      "Dec-24": 3788,
    },

    // Zone 8 Bulk meter
    {
      Label: "L2",
      "Meter Label": "ZONE 8 (Bulk Zone 8)",
      "Acct #": "4300342",
      Zone: "Zone_08",
      Type: "Bulk",
      "Parent Meter": "Main Bulk (NAMA)",
      "Jan-25": 1547,
      "Feb-25": 1498,
      "Mar-25": 2605,
      "Jan-24": 2170,
      "Feb-24": 1825,
      "Mar-24": 2021,
      "Apr-24": 2753,
      "May-24": 2722,
      "Jun-24": 3193,
      "Jul-24": 3639,
      "Aug-24": 3957,
      "Sep-24": 3947,
      "Oct-24": 4296,
      "Nov-24": 3569,
      "Dec-24": 3018,
    },

    // Village Square Bulk meter
    {
      Label: "L2",
      "Meter Label": "Village Square (Zone Bulk)",
      "Acct #": "4300335",
      Zone: "Zone_VS",
      Type: "Bulk",
      "Parent Meter": "Main Bulk (NAMA)",
      "Jan-25": 14,
      "Feb-25": 12,
      "Mar-25": 21,
      "Jan-24": 26,
      "Feb-24": 19,
      "Mar-24": 72,
      "Apr-24": 60,
      "May-24": 125,
      "Jun-24": 277,
      "Jul-24": 143,
      "Aug-24": 137,
      "Sep-24": 145,
      "Oct-24": 63,
      "Nov-24": 34,
      "Dec-24": 17,
    },

    // Direct Connection meters (sample)
    {
      Label: "DC",
      "Meter Label": "Hotel Main Building",
      "Acct #": "4300334",
      Zone: "Main Bulk",
      Type: "Retail",
      "Parent Meter": "Main Bulk (NAMA)",
      "Jan-25": 18048,
      "Feb-25": 19482,
      "Mar-25": 22151,
      "Jan-24": 14012,
      "Feb-24": 12880,
      "Mar-24": 11222,
      "Apr-24": 13217,
      "May-24": 13980,
      "Jun-24": 15385,
      "Jul-24": 12810,
      "Aug-24": 13747,
      "Sep-24": 13031,
      "Oct-24": 17688,
      "Nov-24": 15156,
      "Dec-24": 14668,
    },
    {
      Label: "DC",
      "Meter Label": "Irrigation Tank 01 (Inlet)",
      "Acct #": "4300323",
      Zone: "Main Bulk",
      Type: "IRR_Servies",
      "Parent Meter": "Main Bulk (NAMA)",
      "Jan-25": 0,
      "Feb-25": 0,
      "Mar-25": 0,
      "Jan-24": 0,
      "Feb-24": 0,
      "Mar-24": 0,
      "Apr-24": 0,
      "May-24": 0,
      "Jun-24": 0,
      "Jul-24": 0,
      "Aug-24": 0,
      "Sep-24": 0,
      "Oct-24": 0,
      "Nov-24": 0,
      "Dec-24": 0,
    },

    // L3 meters (sample from Zone 5)
    {
      Label: "L3",
      "Meter Label": "Z5-17",
      "Acct #": "4300001",
      Zone: "Zone_05",
      Type: "Residential (Villa)",
      "Parent Meter": "ZONE 5 (Bulk Zone 5)",
      "Jan-25": 112,
      "Feb-25": 80,
      "Mar-25": 81,
      "Jan-24": 99,
      "Feb-24": 51,
      "Mar-24": 53,
      "Apr-24": 62,
      "May-24": 135,
      "Jun-24": 140,
      "Jul-24": 34,
      "Aug-24": 132,
      "Sep-24": 63,
      "Oct-24": 103,
      "Nov-24": 54,
      "Dec-24": 148,
    },
    {
      Label: "L3",
      "Meter Label": "Z5-13",
      "Acct #": "4300058",
      Zone: "Zone_05",
      Type: "Residential (Villa)",
      "Parent Meter": "ZONE 5 (Bulk Zone 5)",
      "Jan-25": 72,
      "Feb-25": 106,
      "Mar-25": 89,
      "Jan-24": 78,
      "Feb-24": 73,
      "Mar-24": 9,
      "Apr-24": 46,
      "May-24": 17,
      "Jun-24": 83,
      "Jul-24": 40,
      "Aug-24": 80,
      "Sep-24": 61,
      "Oct-24": 56,
      "Nov-24": 68,
      "Dec-24": 85,
    },

    // Problematic meter to be excluded
    {
      Label: "L3",
      "Meter Label": "Z3-74(3) (Building)",
      "Acct #": "4300322",
      Zone: "Zone_03A",
      Type: "Residential (Apart)",
      "Parent Meter": "D-74 Building Bulk Meter",
      "Jan-25": 0,
      "Feb-25": 0,
      "Mar-25": 0,
      "Jan-24": 0,
      "Feb-24": 0,
      "Mar-24": 0,
      "Apr-24": 0,
      "May-24": 0,
      "Jun-24": 0,
      "Jul-24": 0,
      "Aug-24": 0,
      "Sep-24": 0,
      "Oct-24": 0,
      "Nov-24": 0,
      "Dec-24": 0,
    },
  ]

  return data
}

// Calculate metrics based on the real data
export const calculateRealMetrics = (data: WaterMeter[], month: string, year: string): WaterMetrics => {
  const monthKey = `${month}-${year.substring(2)}`

  // Find L1 meter (Main Bulk)
  const l1Meter = data.find((row) => row.Label === "L1")
  const totalL1Supply = l1Meter ? l1Meter[monthKey] || 0 : 0

  // Initialize metrics
  let totalL2Native = 0
  let totalDC = 0
  let totalL3NativeExcl = 0
  const consumptionByType: Record<string, number> = {}
  const zoneMetrics: Record<string, ZoneMetric> = {}

  // Initialize zone metrics
  data.forEach((row) => {
    if (row.Zone && !zoneMetrics[row.Zone]) {
      zoneMetrics[row.Zone] = {
        l2Bulk: 0,
        l3Sum: 0,
        loss: 0,
        lossPercentage: 0,
      }
    }
  })

  // Calculate sums
  data.forEach((row) => {
    const value = row[monthKey] || 0

    // Skip problematic meter
    if (row["Acct #"] === "4300322") return

    // L2 native meters
    if (row.Label === "L2") {
      totalL2Native += value

      // Add to zone metrics
      if (row.Zone) {
        zoneMetrics[row.Zone].l2Bulk += value
      }
    }

    // DC meters
    if (row.Label === "DC") {
      totalDC += value

      // Add to consumption by type
      if (row.Type) {
        consumptionByType[row.Type] = (consumptionByType[row.Type] || 0) + value
      }
    }

    // L3 native meters (excluding problematic meter)
    if (row.Label === "L3" && row["Acct #"] !== "4300322") {
      totalL3NativeExcl += value

      // Add to consumption by type
      if (row.Type) {
        consumptionByType[row.Type] = (consumptionByType[row.Type] || 0) + value
      }

      // Add to zone metrics for L3
      if (row.Zone) {
        zoneMetrics[row.Zone].l3Sum += value
      }
    }
  })

  // Calculate L2 and L3 volumes based on the modified definitions
  const totalL2Volume = totalL2Native + totalDC
  const totalL3Volume = totalL3NativeExcl + totalDC

  // Calculate losses
  const stage1Loss = totalL1Supply - totalL2Volume
  const stage2Loss = totalL2Native - totalL3NativeExcl
  const totalLoss = totalL1Supply - totalL3Volume

  // Calculate zone losses
  Object.keys(zoneMetrics).forEach((zone) => {
    const { l2Bulk, l3Sum } = zoneMetrics[zone]
    zoneMetrics[zone].loss = l2Bulk - l3Sum
    zoneMetrics[zone].lossPercentage = l2Bulk > 0 ? ((l2Bulk - l3Sum) / l2Bulk) * 100 : 0
  })

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
  }
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
        ]

  const trend = []

  months.forEach((period) => {
    // Find L1 meter (Main Bulk)
    const l1Meter = data.find((row) => row.Label === "L1")
    const totalL1 = l1Meter ? l1Meter[period] || 0 : 0

    let totalL2Native = 0
    let totalDC = 0
    let totalL3NativeExcl = 0

    data.forEach((row) => {
      const value = row[period] || 0

      // Skip problematic meter
      if (row["Acct #"] === "4300322") return

      if (row.Label === "L2") {
        totalL2Native += value
      }

      if (row.Label === "DC") {
        totalDC += value
      }

      if (row.Label === "L3" && row["Acct #"] !== "4300322") {
        totalL3NativeExcl += value
      }
    })

    const totalL2Volume = totalL2Native + totalDC
    const totalL3Volume = totalL3NativeExcl + totalDC

    const stage1Loss = totalL1 - totalL2Volume
    const stage2Loss = totalL2Native - totalL3NativeExcl
    const totalLoss = totalL1 - totalL3Volume

    const stage1LossPct = totalL1 > 0 ? (stage1Loss / totalL1) * 100 : 0
    const stage2LossPct = totalL2Volume > 0 ? (stage2Loss / totalL2Volume) * 100 : 0
    const totalLossPct = totalL1 > 0 ? (totalLoss / totalL1) * 100 : 0

    trend.push({
      period,
      stage1Loss,
      stage2Loss,
      totalLoss,
      stage1LossPct,
      stage2LossPct,
      totalLossPct,
    })
  })

  return trend
}
