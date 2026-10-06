"use client"

import { useDeferredValue, useEffect, useState } from "react"
import { CalendarIcon, SlidersHorizontal } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOrderStore } from "@/store/orderStore"
import { useOrder } from "@/hooks/useOrder"
import { API_ORIGIN, BASE_URL } from "@/utils/constants"
import { Input } from "@/components/ui/input"
import { useCategory } from "@/hooks/useCategory"
import { useCategoryStore } from "@/store/categoryStore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSales } from "@/hooks/useSales"
import { useSalesStore } from "@/store/salesStore"

export default function ReportFilterDialog({isOpen, setIsOpen}: {isOpen: boolean, setIsOpen: () => void}) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1), // January 1st of current year
    to: new Date(),
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState("")
  const { fetchCategories } = useCategory()
  const { categories } = useCategoryStore()
  const {generateSalesReport} = useSales()
  const {isLoading} = useSalesStore()

  const handleSearch = (value: string) => {
    setSearchTerm(value.toLocaleLowerCase())
  }

  useEffect(() => {
    fetchCategories()
  }, [])


const generateReport = async () => {
   const response = await generateSalesReport(
      `${BASE_URL}/sales/generate-report?dateRange=${JSON.stringify(dateRange)}&category=${category.toLocaleLowerCase()}&status=${status}`
   );
   window.open(`${API_ORIGIN}${response.downloadUrl}`, "_blank");
}


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* <Button variant="outline">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
        </Button> */}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Filters</DialogTitle>
          <DialogDescription>Apply filters to your report data. Click Generate Report when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn("w-full justify-start h-11 text-left font-normal", !dateRange && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Select onValueChange={(v) => setCategory(v)} defaultValue={category}>
            <SelectTrigger className="w-full h-11">
              <SelectValue placeholder="Product Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => setStatus(v)} defaultValue={status}>
            <SelectTrigger className="w-full h-11">
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={generateReport} className="w-full mt-5 h-11">
           {isLoading ? "Generating..." : "Generate Report"} 
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

