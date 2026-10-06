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

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: keyof T | string;
    cell?: (item: T) => React.ReactNode;
  }[];
  filters?: {
    name: string;
    key: keyof T;
    options: { label: string; value: string }[];
  }[];
  searchKey?: keyof T;
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  onPublished?: (item: T) => void;
  onDelete?: (item: T) => void;
  pageSize?: number;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  filters,
  searchKey,
  onEdit,
  onView,
  onDelete,
  onPublished,
  pageSize = 10,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [category, setCategory] = useState("");
  const { categories } = useCategoryStore();
  const { fetchCategories } = useCategory();
  const { productStats, isLoading } = useProductStore();
  const { fetchProductsWithQuery } = useProduct();
  const [currentPage, setCurrentPage] = useState(productStats?.page || 1);
  const [stocks, setStocks] = useState("");
  const [sort, setSort] = useState<any>("");

  console.log(sort);
  // Handle search with page reset
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (key: any) => {
    setCurrentPage(1);
    if (sort == key) {
      setSort("");
    } else {
      setSort(key);
    }
  };

  const handleNextPage = () => {
    if (currentPage < (productStats?.totalPages || 1)) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  useEffect(() => {
    const params = new URLSearchParams({
      page: String(currentPage || 1),
      category: category && category !== "all" ? category : "all",
      search: deferredSearch.trim() || "all",
      sort: `${sort || "title"}:${sort ? "desc" : "asc"}`,
    });

    if (stocks && stocks !== "all") {
      params.set(stocks, "true");
    }

    fetchProductsWithQuery(`${BASE_URL}/product/query?${params.toString()}`);
  }, [stocks, category, deferredSearch, currentPage, sort]);

  useEffect(() => {
    fetchCategories();
  }, []);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2 md:px-0">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1.5 block">
            General Search
          </label>
          <div className="relative flex-1 ">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-9 border-gray-200 h-11"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1.5 block">
            Category
          </label>
          <Select
            onValueChange={(v) => {
              setCategory(v);
              setCurrentPage(1);
            }}
            defaultValue={category}
          >
            <SelectTrigger className="h-11">
              <SelectValue className="" placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem key={"all"} value={"all"}>
                All categories
              </SelectItem>
              {categories?.map((cat) => (
                <>
                  {cat.isActive && (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  )}
                </>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 mb-1.5 block">
            Stocks
          </label>
          <Select
            onValueChange={(v) => {
              setStocks(v);
              setCurrentPage(1);
            }}
            defaultValue={stocks}
          >
            <SelectTrigger className="h-11">
              <SelectValue className="" placeholder="Filter by stocks status" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem key={"all"} value={"all"}>
                All Stocks
              </SelectItem>
              <SelectItem value={"highStocks"}>High Stocks</SelectItem>
              <SelectItem value={"lowStocks"}>Low Stocks</SelectItem>
              <SelectItem value={"outStocks"}>Out Stocks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-scroll shadow-md w-full relative rounded-lg md:overscroll-y-hidden h-[30vh] md:h-[85vh] border border-gray-200">
        <div className="inline-block absolute align-middle min-w-full  ">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {columns.map((column) => (
                  <TableHead
                    key={column.accessorKey.toString()}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.header}</span>
                      {column.header !== "" && column.header !== "Status" && (
                        <Button
                          onClick={() => handleSort(column.accessorKey)}
                          className={`ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors ${
                            sort === column.accessorKey
                              ? "text-primary bg-gray-200"
                              : "text-gray-400"
                          }`}
                          variant="ghost"
                          size="sm"
                        >
                          <ArrowDownUp size={14} />
                        </Button>
                      )}
                    </div>
                  </TableHead>
                ))}
                {(onEdit || onView || onDelete || onPublished) && (
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
                    {(onEdit || onView || onDelete || onPublished) && (
                      <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {onEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => onEdit(item)}
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          {onView && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => onView(item)}
                            >
                              <ScanEye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                          )}
                          {onPublished && (
                            <Button
                              variant="outline"
                              size="sm"
                              className={`${
                                item.isPublished
                                  ? "text-yellow-600 hover:text-yellow-900"
                                  : "text-green-600 hover:text-green-900"
                              }`}
                              onClick={() => onPublished(item)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {item.isPublished ? "Unpublish" : "Publish"}
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
      <div className="flex flex-col gap-3 border-t border-slate-200 px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 sm:justify-start sm:bg-transparent sm:px-0 sm:py-0">
          <span className="text-sm font-medium text-slate-500">Total products</span>
          <span className="text-sm font-bold text-slate-900 sm:ml-2">{productStats?.total || 0}</span>
        </div>

        <div className="flex w-full items-center justify-between gap-2 rounded-lg bg-slate-50 p-2 sm:w-auto sm:bg-transparent sm:p-0">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-40"
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-0 flex-1 text-center text-sm font-semibold text-slate-700 sm:min-w-32">
            Page {productStats?.page || currentPage} of {productStats?.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-40"
            onClick={handleNextPage}
            disabled={currentPage >= (productStats?.totalPages || 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
