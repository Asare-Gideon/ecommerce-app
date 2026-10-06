import { Suspense } from "react"
import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SalesSummary from "../sales-summary"
import SalesFilters from "../sales-filter"
import SalesTable from "../sales-table"

export const metadata: Metadata = {
  title: "Sales Breakdown",
  description: "Detailed breakdown of sales with filters and summaries",
}

export default function SalesBreakdown() {
  return (
    <div className="">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Suspense  fallback={<div>Loading summary...</div>}>
          <SalesSummary />
        </Suspense>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine your sales data</CardDescription>
        </CardHeader>
        <CardContent>
          <SalesFilters />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales List</CardTitle>
          <CardDescription>Detailed view of all sales</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading sales data...</div>}>
            <SalesTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

