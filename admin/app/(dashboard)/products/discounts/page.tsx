"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { BadgePercent, CheckSquare, Square } from "lucide-react"

import Loader from "@/components/loader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProduct } from "@/hooks/useProduct"
import { Product, useProductStore } from "@/store/productStore"
import { formatCurrency } from "@/utils/constants"

type DiscountType = "percentage" | "fixed"

export default function ProductDiscountsPage() {
  const { fetchProducts, applyDiscount } = useProduct()
  const { products, isLoading } = useProductStore()
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [discountType, setDiscountType] = useState<DiscountType>("percentage")
  const [discountValue, setDiscountValue] = useState(0)
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const selectedCount = selectedProducts.length
  const allSelected = products.length > 0 && selectedCount === products.length

  const selectedTotal = useMemo(() => {
    return products
      .filter((product) => selectedProducts.includes(product._id))
      .reduce((sum, product) => sum + product.price, 0)
  }, [products, selectedProducts])

  const toggleProduct = (productId: string) => {
    setSelectedProducts((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    )
  }

  const toggleAll = () => {
    setSelectedProducts(allSelected ? [] : products.map((product) => product._id))
  }

  const handleApplyDiscount = async (isActive = true) => {
    await applyDiscount(selectedProducts, {
      type: discountType,
      value: isActive ? discountValue : 0,
      startsAt: startsAt || null,
      endsAt: endsAt || null,
      isActive,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-3">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="h-fit border-0 shadow-md">
          <CardContent className="space-y-5 p-6">
            <div className="relative">
              <div className="absolute left-0 top-2 h-6 w-1 bg-emerald-500" />
              <h1 className="pl-6 text-xl font-semibold">Product Discounts</h1>
              <p className="mt-1 pl-6 text-sm text-muted-foreground">
                Apply one discount to selected products.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-md border p-4">
              <div>
                <p className="text-sm text-muted-foreground">Selected</p>
                <p className="text-2xl font-semibold">{selectedCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Base Value</p>
                <p className="text-2xl font-semibold">{formatCurrency(selectedTotal)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select value={discountType} onValueChange={(value) => setDiscountType(value as DiscountType)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Discount Value</Label>
              <Input
                className="h-11"
                min={0}
                type="number"
                value={discountValue}
                onChange={(event) => setDiscountValue(Number.parseFloat(event.target.value) || 0)}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-1">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input className="h-11" type="date" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input className="h-11" type="date" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button disabled={isLoading || selectedCount === 0 || discountValue <= 0} onClick={() => handleApplyDiscount(true)}>
                {isLoading ? <Loader size="small" /> : <BadgePercent className="h-4 w-4" />}
                Apply Discount
              </Button>
              <Button variant="outline" disabled={isLoading || selectedCount === 0} onClick={() => handleApplyDiscount(false)}>
                Clear Discount
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-0 md:p-6">
            <div className="mb-6 flex items-center justify-between px-4 pt-4 md:px-0 md:pt-0">
              <div className="relative">
                <div className="absolute left-0 top-2 h-6 w-1 bg-emerald-500" />
                <h2 className="pl-6 text-xl font-semibold">Select Products</h2>
              </div>
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                {allSelected ? "Clear All" : "Select All"}
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Select</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Discount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {products.map((product: Product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <Button variant="ghost" size="icon" onClick={() => toggleProduct(product._id)}>
                          {selectedProducts.includes(product._id) ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-gray-100">
                            <Image
                              src={product.images?.[0]?.url || "/placeholder.svg"}
                              alt={product.images?.[0]?.name || product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.title}</p>
                            <p className="text-sm text-gray-500">{product.category?.name || "No category"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatCurrency(product.effectivePrice ?? product.price)}
                        {product.hasDiscount && (
                          <span className="ml-2 text-xs text-gray-400 line-through">{formatCurrency(product.price)}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {product.discount?.isActive ? `${product.discount.value}${product.discount.type === "percentage" ? "%" : ""}` : "None"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{product.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

