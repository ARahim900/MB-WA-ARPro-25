"use client"

import MuscatBayWaterSystem from "@/components/muscat-bay-water-system"
import { WaterSystemProvider } from "@/components/water-system-data-provider"

export default function Home() {
  return (
    <main>
      <WaterSystemProvider>
        <MuscatBayWaterSystem />
      </WaterSystemProvider>
    </main>
  )
}
