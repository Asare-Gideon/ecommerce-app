"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react"
import { useSales } from "@/hooks/useSales";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/utils/constants";

export default function SalesSummary() {
 const { yearlyMonthlyStats } = useSales();
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    newCustomers: 0,
    conversionRate: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    conversionChange: 0
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const stats = await yearlyMonthlyStats();
        if (stats && stats.months && stats.summary) {
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          
          const currentMonthData = stats.months.find(m => m.month === currentMonth + 1);
          const lastMonthData = stats.months.find(m => m.month === lastMonth + 1);
          
          if (currentMonthData && lastMonthData) {
            // Calculate percentage changes
            const revenueChange = ((currentMonthData.totalRevenue - lastMonthData.totalRevenue) / lastMonthData.totalRevenue) * 100;
            const ordersChange = ((currentMonthData.totalOrders - lastMonthData.totalOrders) / lastMonthData.totalOrders) * 100;
            const customersChange = ((currentMonthData.uniqueCustomers - lastMonthData.uniqueCustomers) / lastMonthData.uniqueCustomers) * 100;
            
            // Calculate conversion rate (orders/customers * 100)
            const currentConversion = (currentMonthData.totalOrders / currentMonthData.uniqueCustomers) * 100;
            const lastConversion = (lastMonthData.totalOrders / lastMonthData.uniqueCustomers) * 100;
            const conversionChange = ((currentConversion - lastConversion) / lastConversion) * 100;

            setMetrics({
              totalRevenue: stats.summary.totalRevenue,
              totalOrders: stats.summary.totalOrders,
              newCustomers: currentMonthData.uniqueCustomers,
              conversionRate: currentConversion,
              revenueChange: isFinite(revenueChange) ? revenueChange : 0,
              ordersChange: isFinite(ordersChange) ? ordersChange : 0,
              customersChange: isFinite(customersChange) ? customersChange : 0,
              conversionChange: isFinite(conversionChange) ? conversionChange : 0
            });
          }
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
  }, []);

  

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue Change</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.revenueChange.toFixed(2)}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalOrders.toLocaleString()}</div>
        </CardContent>
      </Card>
    </>
  )
}
