"use client";

import {
  ArrowDownUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit2,
  Eye,
  FileStack,
  ScanEye,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useDeferredValue, useEffect, useState } from "react";
import { RotatingLines } from "react-loader-spinner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useProductStore } from "@/store/productStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useCategory } from "@/hooks/useCategory";
import { useProduct } from "@/hooks/useProduct";
import { BASE_URL } from "@/utils/constants";
import Loader from "./loader";
import { useOrderStore } from "@/store/orderStore";
import { useOrder } from "@/hooks/useOrder";

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: keyof T | string;
    cell?: (item: T) => React.ReactNode;
  }[];
  onView?: (item: T) => void;
  onDelete?: (item: T) => void;
  pageSize?: number;
}

export default function MainOrderTable<T extends Record<string, any>>({
  data,
  columns,
  onView,
  onDelete,
  pageSize = 10,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [status, setStatus] = useState("");
  const { statusesTotal, isLoading } = useOrderStore();
  const { fetchOrderQuery } = useOrder();
  const [currentPage, setCurrentPage] = useState(
    statusesTotal?.currentPage || 1
  );
  const [date, setDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  // Handle search with page reset
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleNextPage = () => {
    if (currentPage < (statusesTotal as any)?.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  useEffect(() => {
    fetchOrderQuery(
      `${BASE_URL}/order/get-all?page=${currentPage}&status=${status}&search=${
        deferredSearch === "" ? "all" : deferredSearch
      }&date=${date}&paymentStatus=${paymentStatus}`
    );
  }, [date, status, deferredSearch, currentPage, paymentStatus]);

  return (
    <div className="space-y-6 relative ">
      {/* Search and Filter */}
      {isLoading && (
        <div className="w-full absolute md:h-[35rem]  flex flex-col  items-center justify-center">
          <RotatingLines
            visible={true}
            strokeColor="#2563eb"
            width="60"
            strokeWidth="2"
            animationDuration="0.75"
            ariaLabel="rotating-lines-loading"
          />
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-2 md:px-0">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1.5 block">
            Search by Id
          </label>
          <div className="relative flex-1 ">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by order ID"
              className="pl-9 border-gray-200 h-11"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1.5 block">
            Filter by Status
          </label>
          <Select onValueChange={(v) => setStatus(v)} defaultValue={status}>
            <SelectTrigger className="h-11">
              <SelectValue className="" placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem key={"all"} value={"all"}>
                All Status
              </SelectItem>
              <SelectItem value={"pending"}>Pending</SelectItem>
              <SelectItem value={"processing"}>Processing</SelectItem>
              <SelectItem value={"completed"}>Completed</SelectItem>
              <SelectItem value={"delivered"}>Delivered</SelectItem>
              <SelectItem value={"cancelled"}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 mb-1.5 block">
            Filter by date
          </label>
          <Select onValueChange={(v) => setDate(v)} defaultValue={date}>
            <SelectTrigger className="h-11">
              <SelectValue className="" placeholder="Select Date" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem key={"all"} value={"all"}>
                All
              </SelectItem>
              <SelectItem value={"today"}>Today</SelectItem>
              <SelectItem value={"weekly"}>Weekly</SelectItem>
              <SelectItem value={"monthly"}>Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1.5 block">
            Filter by payment status
          </label>
          <Select
            onValueChange={(v) => setPaymentStatus(v)}
            defaultValue={paymentStatus}
          >
            <SelectTrigger className="h-11">
              <SelectValue className="" placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem key={"all"} value={"all"}>
                All
              </SelectItem>
              <SelectItem value={"paid"}>Paid</SelectItem>
              <SelectItem value={"pending"}>Pending</SelectItem>
              <SelectItem value={"failed"}>Failed</SelectItem>
              <SelectItem value={"refunded"}>Refunds</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-scroll shadow-md w-full relative rounded-lg md:overscroll-y-hidden h-[30vh] md:min-h-[40vh] md:h-full border border-gray-200">
        <div className="inline-block absolute md:relative align-middle min-w-full  ">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {columns.map((column) => (
                  <TableHead
                    key={column.accessorKey.toString()}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.header}</span>
                    </div>
                  </TableHead>
                ))}
                {(onView || onDelete) && (
                  <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading &&
                data.map((item, index) => (
                  <TableRow
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition-colors`}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.accessorKey.toString()}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {column.cell
                          ? column.cell(item)
                          : item[column.accessorKey]}
                      </TableCell>
                    ))}
                    {(onView || onDelete) && (
                      <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {onView && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => onView(item)}
                            >
                              <ScanEye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          )}

                          {onDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-900"
                              onClick={() => onDelete(item)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-100 px-2 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Total</span>
          <span className="text-sm text-gray-600">
            {statusesTotal?.totalOrders}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePreviousPage}
            // disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {statusesTotal?.currentPage} of {statusesTotal?.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextPage}
            // disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
