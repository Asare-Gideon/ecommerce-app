"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useSales, YearlyMonthlyStats } from "@/hooks/useSales";
import { formatCurrency } from "@/utils/constants";



export default function SalesChart() {
  const { yearlyMonthlyStats } = useSales();
  const [data, setData] = useState<YearlyMonthlyStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const stats = await yearlyMonthlyStats();
      setData(stats);
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader className="relative">
        <div className="absolute left-0 top-8 w-1 h-6 bg-emerald-500" />
        <CardTitle className="text-lg font-semibold pl-6">
          Sale History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.months}>
              <XAxis
                dataKey="monthName"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Bar
                dataKey="totalRevenue"
                fill="rgb(99, 102, 241)"
                radius={[4, 4, 0, 0]}
                name={"monthName"}
                activeBar={{ fill: "rgb(99, 132, 41)" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

