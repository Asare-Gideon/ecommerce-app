"use client";

import AnalyticsCard from "@/components/analytics-card";
import DataTable from "@/components/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { useProduct } from "@/hooks/useProduct";
import { Product, useProductStore } from "@/store/productStore";
import { AlertTriangle, Box, PackageOpen, XCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/confirm-dialog";
import MainOrderTable from "@/components/main-orders-table";
import OrderStatusCard from "@/components/order-status-card";
import { formatCurrency, orderStatusCards } from "@/utils/constants";
import { OrderType, useOrderStore } from "@/store/orderStore";
import { useOrder } from "@/hooks/useOrder";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";

const columns = [
  {
    header: "",
    accessorKey: "_id",
    cell: (item: OrderType) => <span className="text-gray-500">#</span>,
  },
  {
    header: "User",
    accessorKey: "user",
    cell: (item: OrderType) => (
      <div className="flex items-center gap-3">
        <div>
          <div className="font-medium text-gray-900">
            {item.user.firstName + " " + item.user.lastName}
          </div>
          <div className="text-sm text-gray-500">{item.user.phone}</div>
        </div>
      </div>
    ),
  },
  {
    header: "Total Price",
    accessorKey: "totalAmount",
    cell: (item: OrderType) => (
      <span className="text-gray-600">{formatCurrency(item.totalAmount)}</span>
    ),
  },

  {
    header: "Products",
    accessorKey: "products",
    cell: (item: OrderType) => (
      <span className="text-gray-600 text-center relative">
        {item.products.reduce((a, c) => a + c.quantity, 0)}
      </span>
    ),
  },
  {
    header: "Payment Status",
    accessorKey: "paymentStatus",
    cell: (item: OrderType) => (
      <span
        className={`inline-flex items-center rounded-full ${
          item.paymentStatus === "paid"
            ? "text-emerald-600 bg-emerald-50"
            : item.paymentStatus === "failed"
            ? "bg-red-50 text-red-700"
            : item.paymentStatus === "refunded"
            ? "bg-blue-50 text-blue-700"
            : "bg-yellow-50 text-yellow-700"
        }  px-2 py-1 text-xs font-medium `}
      >
        {item.paymentStatus.toUpperCase()}
      </span>
    ),
  },
  {
    header: "Order Status",
    accessorKey: "status",
    cell: (item: OrderType) => (
      <span
        className={`inline-flex items-center rounded-full ${
          item.status === "completed"
            ? "text-emerald-600 bg-emerald-50"
            : item.status === "canceled"
            ? "bg-red-50 text-red-700"
            : item.status === "processing"
            ? "bg-blue-50 text-blue-700"
            : item.status === "delivered"
            ? "bg-purple-100 text-purple-800"
            : "bg-yellow-50 text-yellow-700"
        }  px-2 py-1 text-xs font-medium `}
      >
        {item.status.toUpperCase()}
      </span>
    ),
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
    cell: (item: OrderType) => (
      <span className="text-gray-600">
        {format(new Date(item.createdAt), "yyyy-MM-dd HH:mm:ss")}
      </span>
    ),
  },
  {
    header: "Updated At",
    accessorKey: "updatedAt",
    cell: (item: OrderType) => (
      <span className="text-gray-600">
        {format(new Date(item.updatedAt), "yyyy-MM-dd HH:mm:ss")}
      </span>
    ),
  },
];

const filters = [
  {
    name: "Group",
    key: "group" as keyof Product,
    options: [
      { label: "Featured", value: "featured" },
      { label: "Regular", value: "regular" },
    ],
  },
  {
    name: "Product Type",
    key: "productType" as keyof Product,
    options: [
      { label: "Simple", value: "simple" },
      { label: "Variable", value: "variable" },
      { label: "Digital", value: "digital" },
    ],
  },
];

export default function ProductsPage() {
  const { orders, statusesTotal } = useOrderStore();
  const { fetchOrders, deleteOrder } = useOrder();
  const [productId, setProductId] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const router = useRouter();
  //   console.log(orders);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenDeletDialog = (id: string) => {
    setProductId(id);
    setOpenDeleteDialog(true);
  };

 

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-3  md:p-8">
        {/* Analytics Cards */}
        <section className="mb-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <OrderStatusCard
              icon={orderStatusCards[0].icon}
              title={orderStatusCards[0].title}
              value={statusesTotal?.pending ? statusesTotal.pending : 0}
              borderColor={orderStatusCards[0].borderColor}
              iconBgColor={orderStatusCards[0].iconBgColor}
              iconColor={orderStatusCards[0].iconColor}
            />
            <OrderStatusCard
              icon={orderStatusCards[1].icon}
              title={orderStatusCards[1].title}
              value={statusesTotal?.processing ? statusesTotal.processing : 0}
              borderColor={orderStatusCards[1].borderColor}
              iconBgColor={orderStatusCards[1].iconBgColor}
              iconColor={orderStatusCards[1].iconColor}
            />
            <OrderStatusCard
              icon={orderStatusCards[2].icon}
              title={orderStatusCards[2].title}
              value={statusesTotal?.completed ? statusesTotal.completed : 0}
              borderColor={orderStatusCards[2].borderColor}
              iconBgColor={orderStatusCards[2].iconBgColor}
              iconColor={orderStatusCards[2].iconColor}
            />
            <OrderStatusCard
              icon={orderStatusCards[3].icon}
              title={orderStatusCards[3].title}
              value={statusesTotal?.delivered ? statusesTotal.delivered : 0}
              borderColor={orderStatusCards[3].borderColor}
              iconBgColor={orderStatusCards[3].iconBgColor}
              iconColor={orderStatusCards[3].iconColor}
            />
            <OrderStatusCard
              icon={orderStatusCards[4].icon}
              title={orderStatusCards[4].title}
              value={statusesTotal?.cancelled ? statusesTotal.cancelled : 0}
              borderColor={orderStatusCards[4].borderColor}
              iconBgColor={orderStatusCards[4].iconBgColor}
              iconColor={orderStatusCards[4].iconColor}
            />
          </div>
        </section>

        {/* Products Table Card */}
        <Card className="border-0 p-0 m-0 shadow-md relative ">
          <CardContent className=" px-0 mx-0 md:p-6 ">
            <div className="mb-8">
              <div className="relative">
                <div className="absolute left-0 top-2 w-1 h-6 bg-emerald-500" />
                <h1 className="text-xl font-semibold pl-6">Orders</h1>
              </div>
            </div>

            <MainOrderTable
              data={orders}
              columns={columns}
              onView={(product) =>
                router.push(`/order/details?id=${product._id}`)
              }
              onDelete={(product) => handleOpenDeletDialog(product._id)}
            />
          </CardContent>
        </Card>
      </div>
      <ConfirmDialog
        title="Delete Order"
        description="Are you sure you want to delete this order?"
        isOpen={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={() => {
          deleteOrder(productId);
        }}
      />
      <ConfirmDialog
        title="Change Order Status"
        description="Confirm to change this order stauts"
        isOpen={openPublishDialog}
        onClose={() => setOpenPublishDialog(false)}
        onConfirm={() => {
        }}
      />
    </div>
  );
}

