"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOrder } from "@/hooks/useOrder";
import { BASE_URL } from "@/utils/constants";
import { useOrderStore } from "@/store/orderStore";
import { useRouter } from "next/navigation";

interface OrderProduct {
  product: string;
  quantity: number;
  chosenColors?: string[];
  chosenSize?: string;
  chosenColor?: string;
  _id: string;
  title?: string;
  price?: number;
}

interface OrderUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Order {
  _id: string;
  user: OrderUser;
  products: OrderProduct[];
  createdAt: string;
  status: "pending" | "processing" | "completed" | "cancelled";
}

interface OrdersTableProps {
  orders: Order[];
  onViewOrder?: (order: Order) => void;
}

const statusStyles = {
  pending: "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20",
  processing: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  completed: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  delivered: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
  cancelled: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
};

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export default function OrdersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { fetchOrderQuery } = useOrder();
  const {isLoading, orders, statusesTotal} = useOrderStore()
  const router = useRouter()

 useEffect(() => {
    fetchOrderQuery(
      `${BASE_URL}/order/get-all?page=${currentPage}&date=${"weekly"}`
    );
  }, [currentPage]);


  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-emerald-500 rounded-full" />
            <h3 className="text-xl font-semibold">Recent Orders</h3>
          </div>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search orders..."
              className="w-[200px] text-sm"
              onChange={(e) => {
                // TODO: Implement search
              }}
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[50px]">
                <input type="checkbox" className="rounded border-gray-300" />
              </TableHead>
              <TableHead className="font-semibold">Order ID</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Products</TableHead>
              <TableHead className="font-semibold">Order Date</TableHead>
              <TableHead className="font-semibold">Total Items</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id} className="hover:bg-slate-50/50">
                <TableCell className="w-[50px]">
                  <input type="checkbox" className="rounded border-gray-300" />
                </TableCell>
                <TableCell className="font-medium text-sm">
                  #{order._id.slice(-8)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium">
                      {order.user.firstName[0]}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {order.user.firstName} {order.user.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm max-w-[200px]">
                    {order.products.map((item, index) => (
                      <span key={item.product._id} className="text-slate-600">
                        {item.product.title || 'Product'}
                        <span className="text-slate-400"> × {item.quantity}</span>
                        {index < order.products.length - 1 && <span className="mx-1">•</span>}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{format(new Date(order.createdAt), "MMM dd, yyyy")}</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "HH:mm:ss")}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">
                    {order.products.reduce((acc, curr) => acc + curr.quantity, 0)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                      statusStyles[order.status as keyof typeof statusStyles]
                    )}
                  >
                    {order.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-slate-100"
                          onClick={() => router.push(`/order/details?id=${order._id}`)}
                        >
                          <svg
                            className="h-4 w-4 text-slate-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">View Details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-full">
              Page {statusesTotal?.currentPage} of {statusesTotal?.totalPages}
            </span>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  aria-disabled={currentPage === 1}
                  className={cn(
                    "h-8 min-w-[32px] px-2",
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  )}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < (statusesTotal?.totalPages || 1)) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  aria-disabled={currentPage === (statusesTotal?.totalPages || 1)}
                  className={cn(
                    "h-8 min-w-[32px] px-2",
                    currentPage === (statusesTotal?.totalPages || 1) ? "pointer-events-none opacity-50" : ""
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
