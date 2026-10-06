"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormLabel } from "@/components/ui/form"
import { Plus, Trash2 } from "lucide-react"

export type ProductVariantInput = {
  size: string
  color: string
  quantity: number
}

const COLORS = ["Red", "Blue", "Green", "Yellow", "Black", "White", "Gray", "Purple", "Orange", "Pink"]
const QUICK_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "One Size"]

type ProductVariantsEditorProps = {
  value: ProductVariantInput[]
  onChange: (variants: ProductVariantInput[]) => void
}

const emptyVariant = (): ProductVariantInput => ({
  size: "",
  color: "",
  quantity: 0,
})

export default function ProductVariantsEditor({ value = [], onChange }: ProductVariantsEditorProps) {
  const variants = value || []
  const totalStock = variants.reduce((total, variant) => total + (Number(variant.quantity) || 0), 0)

  const updateVariant = (index: number, updates: Partial<ProductVariantInput>) => {
    onChange(variants.map((variant, variantIndex) => (variantIndex === index ? { ...variant, ...updates } : variant)))
  }

  const addVariant = () => {
    onChange([...variants, emptyVariant()])
  }

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, variantIndex) => variantIndex !== index))
  }

  return (
    <div className="rounded-lg border bg-background">
      <div className="flex flex-col gap-3 border-b bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <FormLabel>Variant Stock</FormLabel>
          <p className="text-sm text-muted-foreground">Each row is one size and color combination.</p>
        </div>
        <Badge variant="outline" className="w-fit px-3 py-1 text-sm">
          Total stock: {totalStock}
        </Badge>
      </div>

      <div className="space-y-3 p-4">
        {variants.length === 0 && (
          <div className="rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground">
            No variants added. Add variants when stock depends on size and color.
          </div>
        )}

        {variants.map((variant, index) => (
          <div key={index} className="grid gap-3 rounded-md border bg-white p-3 md:grid-cols-[1fr_1fr_120px_40px] md:items-end">
            <div className="space-y-2">
              <FormLabel>Size</FormLabel>
              <Input
                className="h-11"
                list={`product-size-options-${index}`}
                placeholder="Enter size"
                value={variant.size}
                onChange={(event) => updateVariant(index, { size: event.target.value })}
              />
              <datalist id={`product-size-options-${index}`}>
                {QUICK_SIZES.map((size) => (
                  <option key={size} value={size} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <FormLabel>Color</FormLabel>
              <Select value={variant.color} onValueChange={(color) => updateVariant(index, { color })}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Pick color" />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <FormLabel>Quantity</FormLabel>
              <Input
                className="h-11"
                min={0}
                type="number"
                placeholder="0"
                value={variant.quantity}
                onChange={(event) => updateVariant(index, { quantity: Number.parseInt(event.target.value) || 0 })}
              />
            </div>

            <Button type="button" variant="outline" size="icon" className="h-11 w-11 text-red-600" onClick={() => removeVariant(index)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove variant</span>
            </Button>
          </div>
        ))}

        <Button type="button" variant="outline" className="w-full" onClick={addVariant}>
          <Plus className="h-4 w-4" />
          Add Variant
        </Button>
      </div>
    </div>
  )
}
