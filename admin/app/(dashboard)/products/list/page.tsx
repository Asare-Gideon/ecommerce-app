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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PreviewPage from "./previews";
import { formatCurrency } from "@/utils/constants";

const columns = [
  {
    header: "",
    accessorKey: "id",
    cell: (item: Product) => <span className="text-gray-500">#</span>,
  },
  {
    header: "Product",
    accessorKey: "title",
    cell: (item: Product) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 relative rounded-lg overflow-hidden border border-gray-100">
          <Image
            src={item.images?.[0]?.url || "/placeholder.svg"}
            alt={item.images?.[0]?.name || item.title}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <div className="font-medium text-gray-900">{item.title}</div>
          <div className="text-sm text-gray-500">{item.category.name}</div>
        </div>
      </div>
    ),
  },
  {
    header: "Brand",
    accessorKey: "brand",
    cell: (item: Product) => (
      <span className="text-gray-600">{item.brand}</span>
    ),
  },

  {
    header: "Price",
    accessorKey: "price",
    cell: (item: Product) => (
      <div className="text-gray-600">
        <span>{formatCurrency(item.effectivePrice ?? item.price)}</span>
        {item.hasDiscount && (
          <span className="ml-2 text-xs text-gray-400 line-through">
            {formatCurrency(item.price)}
          </span>
        )}
      </div>
    ),
  },

  {
    header: "Stocks",
    accessorKey: "quantity",
    cell: (item: Product) => (
      <span className="text-gray-600 text-center relative">
        {item.quantity}
        {item.quantity < 11 && (
          <span className={` ${item.quantity < 1 ? "text-red-600 bg-red-50" : "text-yellow-700 bg-yellow-50"} px-3 rounded-md  absolute left-5 py-[2px] animate-blink`}>
            {item.quantity < 1 ? "Out of Stock" : "Low"}
          </span>
        )}
      </span>
    ),
  },
  {
    header: "Sold",
    accessorKey: "sold",
    cell: (item: Product) => (
      <span className="text-gray-600 text-center">{item.sold}</span>
    ),
  },
  {
    header: "Create At",
    accessorKey: "createdAt",
    cell: (item: Product) => (
      <span className="text-gray-600">
        {format(new Date(item.createdAt), "yyyy-MM-dd HH:mm:ss")}
      </span>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (item: Product) => (
      <span
        className={`inline-flex items-center rounded-full ${item.isPublished
          ? "text-emerald-600 bg-emerald-50"
          : "bg-yellow-50 text-yellow-700"
          }  px-2 py-1 text-xs font-medium `}
      >
        {item.isPublished ? "Pulished" : "Unpublish"}
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
  const { fetchProducts, getProductTotals, togglePublish, deleteProduct } =
    useProduct();
  const { products: p, productTotals } = useProductStore();
  const [productId, setProductId] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const router = useRouter();
  // console.log(p);

  useEffect(() => {
    fetchProducts();
    getProductTotals();
  }, []);

  const handleOpenDeletDialog = (id: string) => {
    setProductId(id);
    setOpenDeleteDialog(true);
  };

  const handleOpenPublishDialog = (id: string) => {
    setProductId(id);
    setOpenPublishDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">

      <Tabs defaultValue="analytics" className="space-y-4 mt-2 p-3">
        <TabsList>
          <TabsTrigger className="py-2 px-10" value="analytics">Product Analytics</TabsTrigger>
          <TabsTrigger className="py-2 px-10" value="previews">Products Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="previews" className="space-y-4">
          <PreviewPage />
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">

          <div className="">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <AnalyticsCard
                title="Total Products"
                value={`${productTotals ? productTotals.totalQuantities : "0"}`}
                trend={{
                  value: "â† total number of products quantity",
                  positive: true,
                }}
                icon={Box}
                iconColor="text-blue-600"
                iconBgColor="bg-blue-50"
              />

              <AnalyticsCard
                title="Top Selling"
                value={`${productTotals ? productTotals.bestSellingProducts.length : "0"
                  }`}
                trend={{ value: "â†‘ Most sold products", positive: true }}
                icon={PackageOpen}
                iconColor="text-green-600"
                iconBgColor="bg-green-50"
              />
              <AnalyticsCard
                title="Low Stock Items"
                value={`${productTotals ? productTotals.lowStockProducts : "0"}`}
                trend={{
                  value: "â†“ Total number of low stocks products",
                  positive: false,
                }}
                icon={AlertTriangle}
                iconColor="text-yellow-600"
                iconBgColor="bg-yellow-50"
              />
              <AnalyticsCard
                title="Out of Stock"
                value={`${productTotals ? productTotals.outOfStockProducts : "0"}`}
                trend={{ value: "â†‘ Run out stocks products ", positive: false }}
                icon={XCircle}
                iconColor="text-red-600"
                iconBgColor="bg-red-50"
              />
            </div>

            {/* Products Table Card */}
            <Card className="border-0 p-0 m-0 shadow-md relative ">
              <CardContent className=" px-0 mx-0 md:p-6 ">
                <div className="mb-8">
                  <div className="relative">
                    <div className="absolute left-0 top-2 w-1 h-6 bg-emerald-500" />
                    <h1 className="text-xl font-semibold pl-6">Products</h1>
                  </div>
                </div>

                <DataTable
                  data={p}
                  columns={columns}
                  filters={filters}
                  searchKey="title"
                  onEdit={(product) =>
                    router.push(`/products/edit?id=${product._id}`)
                  }
                  onView={(product) => console.log("View:", product)}
                  onPublished={(product) => handleOpenPublishDialog(product._id)}
                  onDelete={(product) => handleOpenDeletDialog(product._id)}
                />
              </CardContent>
            </Card>
          </div>
          <ConfirmDialog
            title="Delete Proudct"
            description="Are you sure you want to delete this product?"
            isOpen={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            onConfirm={() => {
              deleteProduct(productId);
            }}
          />
          <ConfirmDialog
            title="Change Product Status"
            description="Confirm to change this product stauts"
            isOpen={openPublishDialog}
            onClose={() => setOpenPublishDialog(false)}
            onConfirm={() => {
              togglePublish(productId);
            }}
          />
        </TabsContent>
      </Tabs>

    </div>
  );
}

