"use client";

import { useEffect, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useSales } from "@/hooks/useSales";

interface ConversionMetrics {
  timeframe: string;
  metrics: {
    totalOrders: number;
    completedSales: number;
    cancelledOrders: number;
    conversionRate: string;
    abandonmentRate: string;
  };
  paymentMethods?: Record<string, number>;
}

interface ChartData {
  name: string;
  value: number;
}

export default function SalesAnalytics() {
  const { getConversionMetrices } = useSales();
  const [orderData, setOrderData] = useState<ChartData[]>([]);
  const [paymentData, setPaymentData] = useState<ChartData[]>([]);
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getConversionMetrices();
        if (response) {
          setMetrics(response);
          
          // Create order status data
          const ordersData = [
            { 
              name: "Completed Sales", 
              value: response.metrics.completedSales 
            },
            { 
              name: "Cancelled Orders", 
              value: response.metrics.cancelledOrders 
            },
            { 
              name: "Pending Orders", 
              value: response.metrics.totalOrders - (response.metrics.completedSales + response.metrics.cancelledOrders)
            }
          ].filter(item => item.value > 0);
          
          const paymentsData = Object.entries(response.paymentMethods || {})
            .map(([method, value]) => ({
              name: method.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
              value: Number(value) || 0,
            }))
            .filter(item => item.value > 0);

          setOrderData(ordersData);
          setPaymentData(paymentsData);
        }
      } catch (error) {
        console.error('Error fetching conversion metrics:', error);
      }
    };

    fetchData();
  }, []);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const getOrderStatusColor = (name: string) => {
    switch (name) {
      case "Completed Sales": return "#16a34a";
      case "Cancelled Orders": return "#dc2626";
      case "Pending Orders": return "#eab308";
      default: return "#2563eb";
    }
  };

  const getPaymentMethodColor = (name: string) => {
    switch (name) {
      case "Card": return "#2563eb";
      case "Cash": return "#16a34a";
      case "Bank Transfer": return "#eab308";
      case "Paystack": return "#0ea5e9";
      default: return "#dc2626";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Order Status Distribution</h3>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Conversion Rate: </span>
            {metrics?.metrics.conversionRate || '0%'}
          </div>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={orderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {orderData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getOrderStatusColor(entry.name)} 
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [
                  `${value} orders (${((value/metrics!.metrics.totalOrders) * 100).toFixed(1)}%)`,
                  "Orders"
                ]}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
