"use client"

export const dynamic = 'force-dynamic'

import { DashboardStats } from "@/components/dashboard-stats"
import { CostChart } from "@/components/cost-chart"
import { CostManagement } from "@/components/cost-management"
import { MonthlyTable } from "@/components/monthly-table"
import { QuickActions } from "@/components/quick-actions"
import { TasksOverview } from "@/components/tasks-overview"

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3">Dashboard</h1>
        <p className="text-muted-foreground text-lg">Überblick über Ihre Verwaltung</p>
      </div>

      <DashboardStats />

      <QuickActions />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <CostChart />
        <MonthlyTable />
      </div>

      <CostManagement />

      <TasksOverview />
    </div>
  )
}
