"use client";
import React, { useEffect, useState } from "react";
import type { Metadata } from "next";
import {
  DollarSign,
  Download,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentSales from "../recent-sales";
import TopProducts from "../top-products";
import SalesAnalytics from "../sales-analytics";
import SalesBarChat from "../sales-bar-chat";
import { useSales } from "@/hooks/useSales";
import { YearlyMonthlyStats } from "@/hooks/useSales";
import { formatCurrency } from "@/utils/constants";

function Overview() {
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.revenueChange >= 0 ? '+' : ''}{metrics.revenueChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{metrics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.ordersChange >= 0 ? '+' : ''}{metrics.ordersChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{metrics.newCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.customersChange >= 0 ? '+' : ''}{metrics.customersChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.conversionChange >= 0 ? '+' : ''}{metrics.conversionChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesBarChat />
          </CardContent>
        </Card>
        <div className="col-span-3 ">
            <RecentSales />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              Your best performing products this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopProducts />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Sales Analytics</CardTitle>
            <CardDescription>Breakdown of sales performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesAnalytics />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default Overview;

