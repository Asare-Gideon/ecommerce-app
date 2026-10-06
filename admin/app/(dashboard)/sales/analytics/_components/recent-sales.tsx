"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ChevronRight, Clock, Package, ShoppingCart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useOrder } from "@/hooks/useOrder"
import { OrderType, useOrderStore } from "@/store/orderStore"
import { BASE_URL, formatCurrency } from "@/utils/constants"
import Image from "next/image"

// Define TypeScript interfaces


type OrderStatus = "pending" | "processing" | "completed" | "cancelled"

type StatusBadgeInfo = {
  label: string
  variant: "default" | "secondary" | "destructive" | "outline"
}

// Helper function to get status badge styling
const getStatusBadge = (status: OrderStatus | string): StatusBadgeInfo => {
  const statusMap: Record<OrderStatus, StatusBadgeInfo> = {
    pending: { label: "Pending", variant: "outline" },
    processing: { label: "Processing", variant: "secondary" },
    completed: { label: "Completed", variant: "default" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  }

  return statusMap[status as OrderStatus] || { label: status, variant: "outline" }
}

export default function RecentSales(): JSX.Element {
  const { fetchOrderQuery } = useOrder()
  const { isLoading, orders } = useOrderStore()
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)

  useEffect(() => {
    fetchOrderQuery(`${BASE_URL}/order/get-all?page=${1}&date=${"monthly"}`)
  }, [])

  if (isLoading) {
    return (
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Loading orders...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[160px]" />
                </div>
                <Skeleton className="ml-auto h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>No orders found for this period.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No recent orders</h3>
          <p className="mt-2 text-sm text-muted-foreground">When customers place orders, they will appear here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>You have {orders.length} orders this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto pr-4 -mr-4">
          <div className="space-y-6">
            {(orders as any).map((order: OrderType) => {
              const orderDate = new Date(order.createdAt || Date.now())
              const status = order.status || "pending"
              const { label, variant } = getStatusBadge(status)

              return (
                <div
                  key={order._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50"
                >
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src="/placeholder.svg" alt={`${order?.user?.firstName} ${order?.user?.lastName}`} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {order?.user?.firstName?.[0]}
                      {order?.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {order?.user?.firstName} {order?.user?.lastName}
                      </h4>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order?.user?.email}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{format(orderDate, "PPP")}</span>
                      <Package className="ml-2 h-3 w-3" />
                      <span>{order.products?.length || 0} items</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                    </div>

                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedOrder(order)}
                          aria-label={`View details for order from ${order?.user?.firstName} ${order?.user?.lastName}`}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="sm:max-w-md">
                        <SheetHeader>
                          <SheetTitle>Order Details</SheetTitle>
                          <SheetDescription>
                            Order #{order._id} <br className="mb-1" /> placed on {format(orderDate, "PPP")}
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-6">
                          <div>
                            <h4 className="text-sm font-medium">Customer</h4>
                            <div className="mt-2 flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {order?.user?.firstName?.[0]}
                                  {order?.user?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {order?.user?.firstName} {order?.user?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">{order?.user?.email}</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium">Order Status</h4>
                            <div className="mt-2">
                              <Badge variant={variant}>{label}</Badge>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium">Order Items</h4>
                            <div className="mt-2 space-y-3">
                              {order?.products && order?.products?.length > 0 ? (
                                order?.products?.map((item, index) => (
                                  <div key={index} className="flex justify-between border-b pb-2">
                                    <div className="flex items-center">
                                      <Image width={50} height={50} src={item?.product?.images[0]?.url} alt={item?.product?.title} />
                                      <div className="ml-2">
                                        <p className="text-sm">{item?.product?.title || `Product #${index + 1}`}</p>
                                        <p className="text-xs text-muted-foreground">Qty: {item?.quantity || 1}</p>
                                      </div>
                                    </div>
                                    <p className="text-sm font-medium">{formatCurrency(item.product.price || 0)}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">No items available</p>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between border-t pt-4">
                            <p className="font-medium">Total Amount</p>
                            <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


