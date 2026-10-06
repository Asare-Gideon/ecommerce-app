"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useSales } from "@/hooks/useSales";
import { formatCurrency } from "@/utils/constants";

interface ChartData {
  name: string;
  totalRevenue: number;
  totalOrders: number;
}

export default function SalesBarChat() {
  const { yearlyMonthlyStats } = useSales();
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await yearlyMonthlyStats();
        if (stats?.months) {
          // Sort months by month number to ensure correct order
          const sortedData = [...stats.months]
            .sort((a, b) => a.month - b.month)
            .map(month => ({
              name: month.monthName,
              totalRevenue: month.totalRevenue,
              totalOrders: month.totalOrders
            }));
          setChartData(sortedData);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Bar 
          dataKey="totalRevenue" 
          fill="#2563eb" 
          radius={[4, 4, 0, 0]} 
          name="Revenue"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

