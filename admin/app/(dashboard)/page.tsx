"use client";

import OrderStatusCard from "@/components/order-status-card";
import OrdersTable from "@/components/orders-table";
import PopularProducts from "@/components/popular-products";
import SalesChart from "@/components/sales-chart";
import StatCard from "@/components/stat-card";
import TimeFilter from "@/components/time-filter";
import { useOrder } from "@/hooks/useOrder";
import { useSales } from "@/hooks/useSales";
import { formatCurrency, orderStatusCards } from "@/utils/constants";
import {
  Clock,
  Mail,
  Package2,
  ShoppingBag,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const summaryCards = [
  {
    title: "Total Revenue",
    value: "GH\u20B50.00",
    icon: ShoppingBag,
    borderColor: "border-l-blue-500",
    iconColor: "text-blue-500",
    iconBgColor: "bg-blue-50",
  },
  {
    title: "Total Orders",
    value: "14",
    icon: ShoppingCart,
    borderColor: "border-l-purple-500",
    iconColor: "text-purple-500",
    iconBgColor: "bg-purple-50",
  },
  {
    title: "Total Clients",
    value: "11",
    icon: Users,
    borderColor: "border-l-orange-500",
    iconColor: "text-orange-500",
    iconBgColor: "bg-orange-50",
  },
  {
    title: "Total SMS",
    value: "304",
    icon: Mail,
    borderColor: "border-l-green-500",
    iconColor: "text-green-500",
    iconBgColor: "bg-green-50",
  },
];

type orderTotals = {
  canceled: undefined | string;
  pending: undefined | string;
  completed: undefined | string;
  processing: undefined | number;
  delivered: undefined | number;
  totalOrders: number;
};

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState("All");
  const [orderTotals, setOrderTotals] = useState<orderTotals | undefined>();
  const { fetchTotals } = useOrder();
  const { yearlyMonthlyStats } = useSales();
  const [revenue, setRevenue] = useState(0);

  const getOrderTotals = async () => {
    let totals = await fetchTotals(timeFilter.toLowerCase());
    setOrderTotals(totals as any);
  };

  useEffect(() => {
    getOrderTotals();
  }, [timeFilter]);

  useEffect(() => {
    const fetchData = async () => {
      const stats = await yearlyMonthlyStats();
      if (stats) {
        setRevenue(stats.summary.totalRevenue);
      }
    };

    fetchData();
  }, []);

  const orders = [
    {
      id: "1",
      trackingNumber: "20240207303639",
      customer: {
        name: "Customer",
        email: "customer@demo.com",
        avatar: "C",
      },
      products: 6,
      orderDate: "a year ago",
      total: "GH\u20B564.79",
      status: "processing" as const,
    },
    // Add more orders as needed
  ];

  return (
    <div className="min-h-screen  p-8">
      {/* Summary Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={summaryCards[0].title}
            value={formatCurrency(revenue)}
            icon={summaryCards[0].icon}
            borderColor={summaryCards[0].borderColor}
            iconBgColor={summaryCards[0].iconBgColor}
            iconColor={summaryCards[0].iconColor}
          />
          <StatCard
            icon={summaryCards[1].icon}
            title={summaryCards[1].title}
            value={orderTotals ? orderTotals.totalOrders : 0}
            borderColor={summaryCards[1].borderColor}
            iconBgColor={summaryCards[1].iconBgColor}
            iconColor={summaryCards[1].iconColor}
          />
          <StatCard
            icon={summaryCards[2].icon}
            title={summaryCards[2].title}
            value={0}
            borderColor={summaryCards[2].borderColor}
            iconBgColor={summaryCards[2].iconBgColor}
            iconColor={summaryCards[3].iconColor}
          />
          <StatCard
            icon={summaryCards[3].icon}
            title={summaryCards[3].title}
            value={0}
            borderColor={summaryCards[3].borderColor}
            iconBgColor={summaryCards[3].iconBgColor}
            iconColor={summaryCards[3].iconColor}
          />
        </div>
      </section>

      {/* Order Status Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{timeFilter} Order Status</h2>
          <TimeFilter value={timeFilter} onChange={setTimeFilter} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <OrderStatusCard
            icon={orderStatusCards[0].icon}
            title={orderStatusCards[0].title}
            value={orderTotals?.pending ? orderTotals?.pending : 0}
            borderColor={orderStatusCards[0].borderColor}
            iconBgColor={orderStatusCards[0].iconBgColor}
            iconColor={orderStatusCards[0].iconColor}
          />
          <OrderStatusCard
            icon={orderStatusCards[1].icon}
            title={orderStatusCards[1].title}
            value={orderTotals?.processing ? orderTotals?.processing : 0}
            borderColor={orderStatusCards[1].borderColor}
            iconBgColor={orderStatusCards[1].iconBgColor}
            iconColor={orderStatusCards[1].iconColor}
          />
          <OrderStatusCard
            icon={orderStatusCards[2].icon}
            title={orderStatusCards[2].title}
            value={orderTotals?.completed ? orderTotals?.completed : 0}
            borderColor={orderStatusCards[2].borderColor}
            iconBgColor={orderStatusCards[2].iconBgColor}
            iconColor={orderStatusCards[2].iconColor}
          />
          <OrderStatusCard
            icon={orderStatusCards[3].icon}
            title={orderStatusCards[3].title}
            value={orderTotals?.delivered ? orderTotals?.delivered : 0}
            borderColor={orderStatusCards[3].borderColor}
            iconBgColor={orderStatusCards[3].iconBgColor}
            iconColor={orderStatusCards[3].iconColor}
          />
        </div>
      </section>

      {/* Orders Table Section */}

      <section className="grid gap-8 md:grid-cols-2">
        <SalesChart />
        <PopularProducts />
      </section>
      <section className="mt-8">
        <OrdersTable
          
        />
      </section>
    </div>
  );
}

