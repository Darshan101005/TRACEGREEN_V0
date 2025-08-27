"use client"

import { Suspense } from "react"
import DashboardContent from "./dashboard-content"

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="p-8">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
