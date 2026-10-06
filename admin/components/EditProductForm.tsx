"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "@/components/ui/card"
import { Eye } from "lucide-react"
import Editor from "./editor"
import ImageUpload from "./Image-upload"
import { useProduct } from "@/hooks/useProduct"
import { type Product, useProductStore } from "@/store/productStore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useCategory } from "@/hooks/useCategory"
import { useCategoryStore } from "@/store/categoryStore"
import Loader from "./loader"
import ProductVariantsEditor from "./product-variants-editor"

const productSchema = z.object({
  title: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters.",
  }),
  price: z.number().min(0.01, {
    message: "Price must be at least 0.01.",
  }),
  stock: z.number().int().min(0, {
    message: "Stock must be a non-negative integer.",
  }),
  brand: z.string().min(2, {
    message: "Brand must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  status: z.enum(["published", "draft"]),
  category: z.string({
    required_error: "Please select category.",
  }),
  colors: z.array(z.string()).optional().default([]),
  sizes: z.array(z.string()).optional().default([]),
  variants: z
    .array(
      z.object({
        size: z.string().min(1, { message: "Enter a size." }),
        color: z.string().min(1, { message: "Pick a color." }),
        quantity: z.number().int().min(0, { message: "Quantity cannot be negative." }),
      }),
    )
    .optional()
    .default([]),
  discount: z
    .object({
      isActive: z.boolean().default(false),
      type: z.enum(["percentage", "fixed"]).default("percentage"),
      value: z.number().min(0).default(0),
      startsAt: z.string().optional(),
      endsAt: z.string().optional(),
    })
    .default({
      isActive: false,
      type: "percentage",
      value: 0,
      startsAt: "",
      endsAt: "",
    }),
  images: z
    .array(z.string())
    .min(2, {
      message: "Please select at least 2 images.",
    })
    .max(4, {
      message: "You can select up to 4 images.",
    }),
})

type ProductFormValues = z.infer<typeof productSchema>

const defaultValues: Partial<ProductFormValues> = {
  title: "",
  slug: "",
  price: 0,
  stock: 0,
  brand: "",
  description: "",
  status: "draft",
  category: "",
  colors: [],
  sizes: [],
  variants: [],
  discount: {
    isActive: false,
    type: "percentage",
    value: 0,
    startsAt: "",
    endsAt: "",
  },
  images: [],
}

export default function EditProductForm() {
  const router = useRouter()
  const [product, setProduct] = useState<Product>()
  const { getSingleProduct, updateProduct } = useProduct()
  const { isLoading, error } = useProductStore()
  const { categories } = useCategoryStore()
  const { fetchCategories } = useCategory()
  const [hasChanges, setHasChanges] = useState(false)
  const [deletedImages, setDeletedImages] = useState<string[]>([])
  const searchParams = useSearchParams()
  const id = searchParams.get("id") as any

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })
  const variants = form.watch("variants") || []
  const hasDiscount = form.watch("discount.isActive")
  const variantStock = variants.reduce((total, variant) => total + (Number(variant.quantity) || 0), 0)
  const hasVariants = variants.length > 0

  const fetchPs = async () => {
    if (id) {
      const p: any = await getSingleProduct(id)
      setProduct(p)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchPs()
  }, [id])

  useEffect(() => {
    if (product) {
      const normalizedVariants =
        product.variants?.flatMap((variant: any) => {
          if (variant.color !== undefined) {
            return [
              {
                size: variant.size || "",
                color: variant.color || "",
                quantity: Number(variant.quantity) || 0,
              },
            ]
          }

          if (Array.isArray(variant.colors)) {
            return variant.colors.map((color: string) => ({
              size: variant.size || "",
              color,
              quantity: 0,
            }))
          }

          return []
        }) || []

      form.setValue("brand", product.brand)
      form.setValue("title", product.title)
      form.setValue("price", product.price)
      form.setValue("slug", product.slug)
      form.setValue("stock", product.quantity)
      form.setValue("category", product.category._id)
      form.setValue("colors", product.colors || [])
      form.setValue("description", product.description)
      form.setValue("status", product.isPublished ? "published" : "draft")
      form.setValue(
        "discount",
        {
          isActive: Boolean(product.discount?.isActive),
          type: product.discount?.type || "percentage",
          value: Number(product.discount?.value) || 0,
          startsAt: product.discount?.startsAt ? product.discount.startsAt.slice(0, 10) : "",
          endsAt: product.discount?.endsAt ? product.discount.endsAt.slice(0, 10) : "",
        },
      )

      // Handle sizes if they exist
      form.setValue("variants", normalizedVariants)
      form.setValue("sizes", Array.from(new Set(normalizedVariants.map((variant) => variant.size).filter(Boolean))))

      const ps = []
      for (const p of product.images) {
        ps.push(p.url)
      }
      form.setValue("images", ps)
      setHasChanges(false)
    }
  }, [product])

  useEffect(() => {
    if (hasVariants) {
      form.setValue("stock", variantStock, { shouldDirty: true })
    }
  }, [hasVariants, variantStock, form])

  useEffect(() => {
    const subscription = form.watch((_, { type }) => {
      if (type === "change") {
        setHasChanges(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [form])


  const clearForm = () => {
    form.reset()
    setHasChanges(false)
  }
  const watchName = form.watch("title")
  if (watchName && !form.getValues("slug")) {
    form.setValue("slug", watchName.toLowerCase().replace(/\s+/g, "-"))
  }

  function isBase64Image(str: any) {
    return /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(str)
  }

  function handleDeletedImages(str: any) {
    if (isBase64Image(str)) return
    const imgInP = product?.images.filter((img) => img.url === str) as any
    if (imgInP?.[0]?.name) {
      setDeletedImages((prev: any) => [...prev, imgInP[0].name])
    }
  }

  async function onSubmit(data: ProductFormValues) {
    const newImgs = []
    for (const img of data.images) {
      if (isBase64Image(img)) {
        newImgs.push(img)
      }
    }
    const normalizedVariants = data.variants || []
    const totalVariantStock = normalizedVariants.reduce((total, variant) => total + (Number(variant.quantity) || 0), 0)

    const changes = {
      brand: data.brand,
      category: data.category,
      colors: [],
      sizes: [],
      variants: normalizedVariants,
      description: data.description,
      discount: {
        ...data.discount,
        startsAt: data.discount.startsAt || null,
        endsAt: data.discount.endsAt || null,
      },
      images: newImgs,
      isPublished: data.status === "published",
      price: data.price,
      quantity: normalizedVariants.length > 0 ? totalVariantStock : data.stock,
      slug: data.slug,
      title: data.title,
    } as any
    if (deletedImages.length > 0) {
      changes.deletedImages = deletedImages
    }
    updateProduct(id, changes)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-4">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[400px_1fr]">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Product Info</h2>
            <p className="text-sm text-muted-foreground">
              Fill in your product information here. Make sure all the input field has been filled
            </p>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name*</FormLabel>
                    <FormControl>
                      <Input className="h-11" placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input className="h-11" placeholder="product-slug" {...field} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Preview slug</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price*</FormLabel>
                      <FormControl>
                        <Input
                          className="h-11"
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{hasVariants ? "Total Variant Stock" : "Stock*"}</FormLabel>
                      <FormControl>
                        <Input
                          className="h-11"
                          type="number"
                          placeholder="0"
                          disabled={hasVariants}
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                        />
                      </FormControl>
                      {hasVariants && (
                        <FormDescription>Calculated from variant quantities.</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand*</FormLabel>
                    <FormControl>
                      <Input className="h-11" placeholder="Enter brand name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[400px_1fr]">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Description</h2>
            <div className="text-sm text-muted-foreground">
              <p>Type your product description here. This is necessary information for the client.</p>
            </div>
          </div>
          <Card className="p-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Editor editorState={field.value} setEditorState={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="published" />
                        </FormControl>
                        <FormLabel className="font-normal">Published</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="draft" />
                        </FormControl>
                        <FormLabel className="font-normal">Draft</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[400px_1fr]">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Gallery</h2>
            <div className="text-sm text-muted-foreground">
              <p>Upload your product image gallery here (2-4 images)</p>
              <p>Image size should not be more than 2MB</p>
            </div>
          </div>
          <Card className="p-6">
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      onRemove={(url) => {
                        field.onChange(field.value.filter((val) => val !== url))
                        handleDeletedImages(url)
                      }}
                      maxImages={4}
                    />
                  </FormControl>
                  <FormDescription>PNG, JPG (2-4 images)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[400px_1fr]">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Options</h2>
            <p className="text-sm text-muted-foreground">Category, colors, and size availability</p>
          </div>
          <Card className="overflow-hidden p-0">
            <div className="border-b bg-muted/30 px-6 py-4">
              <h3 className="text-base font-semibold">Product Options</h3>
              <p className="text-sm text-muted-foreground">Sizes and colors are optional</p>
            </div>
            <div className="space-y-6 p-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category*</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder={product?.category.name || "Select category"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map(
                            (cat) =>
                              cat.isActive && (
                                <SelectItem key={cat._id} value={cat._id}>
                                  {cat.name}
                                </SelectItem>
                              ),
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variants"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ProductVariantsEditor value={field.value || []} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[400px_1fr]">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Discount</h2>
            <p className="text-sm text-muted-foreground">Add an optional discount for this product</p>
          </div>
          <Card className="p-6">
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="discount.isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <FormLabel>Enable Discount</FormLabel>
                      <FormDescription>Turn this on when the product should show a sale price.</FormDescription>
                    </div>
                    <FormControl>
                      <Button
                        type="button"
                        variant={field.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => field.onChange(!field.value)}
                      >
                        {field.value ? "Enabled" : "Disabled"}
                      </Button>
                    </FormControl>
                  </FormItem>
                )}
              />
              {hasDiscount && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="discount.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select discount type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discount.value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Value</FormLabel>
                        <FormControl>
                          <Input
                            className="h-11"
                            type="number"
                            min={0}
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discount.startsAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input className="h-11" type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discount.endsAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input className="h-11" type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-4"></div>
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background px-6 py-3">
          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" type="button">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              className={`${!hasChanges && "opacity-20 bg-gray-500"}`}
              type="submit"
              disabled={isLoading || !hasChanges}
            >
              {isLoading ? <Loader size="small" /> : "Update Product"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
