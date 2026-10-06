"use client"

import { useDeferredValue, useEffect, useState } from "react"
import { CalendarIcon, Search } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOrderStore } from "@/store/orderStore"
import { useOrder } from "@/hooks/useOrder"
import { BASE_URL } from "@/utils/constants"
import { Input } from "@/components/ui/input"
import { useCategory } from "@/hooks/useCategory"
import { useCategoryStore } from "@/store/categoryStore"

export default function SalesFilters() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1), // January 1st of current year
    to: new Date(),
  })
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [fileterCount, setFilterCount] = useState(0)
  const { statusesTotal,  } = useOrderStore();
  const { fetchOrderQuery } = useOrder();
  const {fetchCategories} = useCategory()
  const {categories} = useCategoryStore()
  

 const handleSearch = (value: string) => {
    setSearchTerm(value.toLocaleLowerCase());
  };

  useEffect(() => {
    fetchCategories()
  },[])

  useEffect(() => {
    fetchOrderQuery(
      `${BASE_URL}/order/get-all?status=${status}&search=${
        deferredSearch === "" ? "all" : deferredSearch
      }&dateRange=${JSON.stringify(dateRange)}&category=${category.toLocaleLowerCase()}`
    );
  }, [fileterCount]);


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
      <Input
          placeholder="Filter by product..."
          value={searchTerm}
          onChange={(event) => handleSearch(event.target.value)}
          className="max-w-sm h-11 "
        />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full h-11  justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
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

      <Select  onValueChange={(v) => setCategory(v)} defaultValue={category}>
        <SelectTrigger className="w-full h-11 ">
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

      <Select  onValueChange={(v) => setStatus(v)} defaultValue={status}>
        <SelectTrigger className="w-full h-11 ">
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

      <Button onClick={() => setFilterCount((prev) => prev + 1)} className="w-full h-11 sm:w-auto">Apply Filters</Button>
    </div>
  )
}
