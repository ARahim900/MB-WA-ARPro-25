// This file provides mock data generation for the water system dashboard
// when the actual CSV file is not available

export const generateMockData = (selectedYear: string, selectedMonth: string) => {
  const mockData = []

  // L1 Main Bulk meter
  mockData.push({
    Label: "L1",
    "Meter Label": "Main Bulk",
    "Acct #": "1000001",
    Zone: "Main Bulk",
    Type: "Bulk",
    "Parent Meter": "",
    "Jan-25": 45000,
    "Feb-25": 42000,
    "Mar-25": 48000,
    "Jan-24": 43000,
    "Feb-24": 41000,
    "Mar-24": 46000,
    "Apr-24": 47000,
    "May-24": 49000,
    "Jun-24": 51000,
  })

  // L2 Zone Bulk meters
  const zones = ["Zone_01", "Zone_02", "Zone_03", "Zone_04", "Zone_05", "Zone_06", "Zone_07", "Zone_08"]
  zones.forEach((zone, index) => {
    const baseVolume = 5000 + Math.random() * 2000
    mockData.push({
      Label: "L2",
      "Meter Label": `${zone} Bulk`,
      "Acct #": `2${index}00001`,
      Zone: zone,
      Type: "Bulk",
      "Parent Meter": "MAIN BULK",
      "Jan-25": baseVolume * 0.95,
      "Feb-25": baseVolume * 0.9,
      "Mar-25": baseVolume,
      "Jan-24": baseVolume * 0.92,
      "Feb-24": baseVolume * 0.88,
      "Mar-24": baseVolume * 0.97,
      "Apr-24": baseVolume * 1.02,
      "May-24": baseVolume * 1.05,
      "Jun-24": baseVolume * 1.08,
    })
  })

  // L3 End-user meters
  const types = ["Residential", "Commercial", "Irrigation", "Public", "Industrial"]
  zones.forEach((zone) => {
    // Create 5-10 L3 meters per zone
    const meterCount = 5 + Math.floor(Math.random() * 6)
    for (let i = 0; i < meterCount; i++) {
      const type = types[Math.floor(Math.random() * types.length)]
      const baseVolume = 200 + Math.random() * 800
      mockData.push({
        Label: "L3",
        "Meter Label": `${zone} Meter ${i + 1}`,
        "Acct #": `3${zone.slice(-2)}${i.toString().padStart(4, "0")}`,
        Zone: zone,
        Type: type,
        "Parent Meter": `${zone} BULK`,
        "Jan-25": baseVolume * 0.95,
        "Feb-25": baseVolume * 0.9,
        "Mar-25": baseVolume,
        "Jan-24": baseVolume * 0.92,
        "Feb-24": baseVolume * 0.88,
        "Mar-24": baseVolume * 0.97,
        "Apr-24": baseVolume * 1.02,
        "May-24": baseVolume * 1.05,
        "Jun-24": baseVolume * 1.08,
      })
    }
  })

  // DC meters connected directly to L1
  for (let i = 0; i < 5; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const baseVolume = 300 + Math.random() * 700
    mockData.push({
      Label: "DC",
      "Meter Label": `DC Meter ${i + 1}`,
      "Acct #": `4${i.toString().padStart(6, "0")}`,
      Zone: "Main Bulk",
      Type: type,
      "Parent Meter": "MAIN BULK",
      "Jan-25": baseVolume * 0.95,
      "Feb-25": baseVolume * 0.9,
      "Mar-25": baseVolume,
      "Jan-24": baseVolume * 0.92,
      "Feb-24": baseVolume * 0.88,
      "Mar-24": baseVolume * 0.97,
      "Apr-24": baseVolume * 1.02,
      "May-24": baseVolume * 1.05,
      "Jun-24": baseVolume * 1.08,
    })
  }

  return mockData
}
