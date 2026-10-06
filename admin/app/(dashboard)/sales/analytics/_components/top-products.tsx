"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Loader2, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/utils/constants"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { type SalesPerformance, useSales } from "@/hooks/useSales"

interface Product {
  productId: string
  productName: string
  orderCount: number
  totalRevenue: number
  imageUrl: string
}

export default function TopProducts() {
  const { getSalesPerformance } = useSales()
  const [data, setData] = useState<SalesPerformance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const stats = await getSalesPerformance()
        setData(stats)
        setError(null)
      } catch (err) {
        setError("Failed to fetch sales data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Loading top performing products...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>An error occurred</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center h-48 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
       
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Sales</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.performance?.slice(0, 5).map((product) => (
              <TableRow key={product.productId}>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="p-0 hover:bg-transparent">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-md overflow-hidden mr-3">
                            <Image
                              src={product.images[0].url || "/placeholder.svg"}
                              alt={product.productName}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          <span className="font-medium">{product.productName}</span>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{product.productName}</DialogTitle>
                        <DialogDescription>Product ID: {product.productId}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="flex justify-center">
                          <Image
                            src={product.images[0].url || "/placeholder.svg"}
                            alt={product.productName}
                            width={200}
                            height={200}
                            className="rounded-md object-cover"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Total Sales</p>
                            <p className="text-2xl font-bold">{product.orderCount}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold">{formatCurrency(product.totalRevenue)}</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell className="text-right">{product.orderCount}</TableCell>
                <TableCell className="text-right">{formatCurrency(product.totalRevenue)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </div>
  )
}

