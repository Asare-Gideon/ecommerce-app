"use client"

import { useState, useEffect, useDeferredValue } from "react"
import {
    ChevronLeft,
    ChevronRight,
    Filter,
    Grid3X3,
    List,
    Search,
    ShoppingBag,
    ShoppingCart,
    SlidersHorizontal,
    Star,
    X,
} from "lucide-react"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { useCategoryStore } from "@/store/categoryStore"
import { useCategory } from "@/hooks/useCategory"
import { Product, useProductStore } from "@/store/productStore"
import { useProduct } from "@/hooks/useProduct"
import { BASE_URL, formatCurrency } from "@/utils/constants"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cartsStore"

export default function PreviewPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const deferredSearch = useDeferredValue(searchTerm)
    const [category, setCategory] = useState("")
    const { categories } = useCategoryStore()
    const { fetchCategories } = useCategory()
    const { productStats, isLoading, productTotals, products } = useProductStore()
    const { fetchProductsWithQuery } = useProduct()
    const [currentPage, setCurrentPage] = useState(productStats?.page || 1)
    const [stocks, setStocks] = useState("")
    const [sort, setSort] = useState<any>("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [sortBy, setSortBy] = useState<string>("featured")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const itemsPerPage = 8 // Fixed at 8 items per page
    const router = useRouter()
    const [isCartOpen, setIsCartOpen] = useState(false)
    const { items: cartItems, addItem, removeItem, updateItemQuantity, totalItems, totalPrice } = useCartStore()

    useEffect(() => {
        const params = new URLSearchParams({
            page: String(currentPage || 1),
            limit: String(itemsPerPage),
            category: category && category !== "all" ? category : "all",
            search: deferredSearch.trim() || "all",
            sort: `${sort || "title"}:${sort ? "desc" : "asc"}`,
        })

        if (stocks && stocks !== "all") {
            params.set(stocks, "true")
        }

        fetchProductsWithQuery(`${BASE_URL}/product/query?${params.toString()}`)
    }, [stocks, category, deferredSearch, currentPage, sort])

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setCurrentPage(1)
    }

    const getDefaultVariant = (product: Product) => {
        return product.variants?.find((variant) => Number(variant.quantity) > 0) || product.variants?.[0]
    }

    const getCartId = (product: Product) => {
        const variant = getDefaultVariant(product)
        if (!variant) return product._id
        return `${product._id}:${variant.size}:${variant.color}`
    }

    const checkOutStock = (product: Product) => {
        const variant = getDefaultVariant(product)
        const cartId = getCartId(product)
        const stock = variant ? variant.quantity : product.quantity
        const existingItem = cartItems.find((item) => item.id === cartId)
        if (existingItem) {
            return existingItem.quantity >= stock
        }
        return false
    }


    const addToCart = (product: Product) => {
        const variant = getDefaultVariant(product)

        if (product.variants?.length && !variant) {
            toast({
                title: "No variant available",
                description: "This product has no available size and color variant.",
                variant: "destructive"
            })
            return
        }

        if (checkOutStock(product)) {
            toast({
                title: "Out of stock",
                description: "Not enough stock available.",
                variant: "destructive"
            })
            return
        }
        addItem({
            id: getCartId(product),
            productId: product._id,
            name: product.title,
            price: product.effectivePrice ?? product.price,
            image: product.images?.[0]?.url || "/placeholder.svg",
            selectedSize: variant?.size,
            selectedColor: variant?.color,
            maxStock: variant ? variant.quantity : product.quantity,
        })

        toast({
            title: "Added to cart",
            description: variant
                ? `${product.title} (${variant.size} / ${variant.color}) has been added to your cart.`
                : `${product.title} has been added to your cart.`,
        })
    }

    const removeFromCart = (productId: string) => {
        removeItem(productId)
    }

    const updateCartItemQuantity = (productId: string, newQuantity: number) => {


        if (newQuantity < 1) return
        updateItemQuantity(productId, newQuantity)
    }

    const totalCartItems = totalItems
    const totalCartPrice = totalPrice

    function removeHtmlTags(input: string): string {
        return input.replace(/<\/?.+?>/g, "").trim()
    }

    const handleNextPage = () => {
        if (currentPage < (productStats?.totalPages || 1)) {
            setCurrentPage((prev) => prev + 1)

        }
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1)
        }
    }

    return (
        <div className="">
            {/* Header with search and cart */}
            <Card className="flex flex-col gap-4 mb-6 p-5 pb-7">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="mb-5">
                            <div className="relative">
                                <div className="absolute left-0 top-2 w-1 h-6 bg-primary" />
                                <h1 className="text-xl font-semibold pl-6">Previews</h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <Button
                                variant={viewMode === "grid" ? "default" : "outline"}
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => setViewMode("grid")}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "default" : "outline"}
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => setViewMode("list")}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button variant="outline" size="icon" className="relative" onClick={() => setIsCartOpen(!isCartOpen)}>
                            <ShoppingCart className="h-5 w-5" />
                            {totalCartItems > 0 && (
                                <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                                    {totalCartItems}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </div>

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
                        <Select onValueChange={(v) => {
                            setCategory(v)
                            setCurrentPage(1)
                        }} defaultValue={category}>
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
                        <Select onValueChange={(v) => {
                            setStocks(v)
                            setCurrentPage(1)
                        }} defaultValue={stocks}>
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
            </Card>

            {/* Products grid/list */}
            <div className="bg-white p-5 rounded-lg">
                {isLoading ? (
                    <div
                        className={cn(
                            "grid gap-6",
                            viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1",
                        )}
                    >
                        {Array.from({ length: itemsPerPage }).map((_, i) => (
                            <Card key={i} className={cn(viewMode === "list" && "flex flex-row")}>
                                <div className={cn(viewMode === "grid" ? "pt-6 px-6" : "p-4")}>
                                    <Skeleton
                                        className={cn("rounded-md", viewMode === "grid" ? "h-[200px] w-full" : "h-[120px] w-[120px]")}
                                    />
                                </div>
                                <div className="flex-1 p-6 space-y-4">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No products found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                    </div>
                ) : (
                    <div
                        className={cn(
                            "grid gap-6",
                            viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1",
                        )}
                    >
                        {products.map((product) => (
                            <Card key={product._id} className={cn(viewMode === "list" && "flex flex-row")}>
                                <div className={cn("relative", viewMode === "grid" ? "pt-6 px-6 h-[220px]" : "p-4")}>
                                    <Image
                                        src={product.images?.[0]?.url || "/placeholder.svg"}
                                        alt={product.title}
                                        width={200}
                                        height={200}
                                        className="rounded-md object-cover mx-auto"
                                    />
                                    {product.isPublished && <Badge className="absolute top-4 right-4 bg-green-500">Published</Badge>}
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <CardHeader className={viewMode === "list" ? "pt-4" : ""}>
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-200">
                                                    {product.title}
                                                </h3>
                                                <div className="flex items-center bg-muted/50 px-2 py-1 rounded-full">
                                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 mr-1" />
                                                    <span className="text-xs font-medium">{product.averageRating}</span>
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground text-sm mt-1">
                                                {viewMode === "list"
                                                    ? product.description
                                                    : product.description.length > 100
                                                        ? `${removeHtmlTags(product.description).substring(0, 100)}...`
                                                        : removeHtmlTags(product.description)}
                                            </p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg">{formatCurrency(product.effectivePrice ?? product.price)}</span>
                                            {product.hasDiscount && (
                                                <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.price)}</span>
                                            )}
                                        </div>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" disabled={product.quantity <= 0} onClick={() => addToCart(product)}>
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            Add to Cart
                                        </Button>
                                    </CardFooter>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
                {/* Pagination */}
                <div className="flex flex-col gap-3 border-t mt-10 border-slate-200 px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
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

            {/* Shopping Cart Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 w-full sm:w-96 bg-background shadow-xl transform transition-transform duration-200 ease-in-out z-50",
                    isCartOpen ? "translate-x-0" : "translate-x-full",
                )}
            >
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Your Cart</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-4">
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">Your cart is empty</h3>
                                <p className="text-muted-foreground">Add some products to your cart to see them here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b">
                                        <div className="w-16 h-16 relative">
                                            <Image
                                                src={item.image || "/placeholder.svg"}
                                                alt={item.name}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium">{item.name}</h4>
                                            {(item.selectedSize || item.selectedColor) && (
                                                <p className="text-xs text-muted-foreground">
                                                    {[item.selectedSize, item.selectedColor].filter(Boolean).join(" / ")}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="text-sm">{formatCurrency(item.price)} x {item.quantity}</div>
                                                <div className="font-medium">{formatCurrency(item.price * item.quantity)}</div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                                >

                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="lucide lucide-minus"
                                                    >
                                                        <path d="M5 12h14" />
                                                    </svg>
                                                </Button>
                                                <span className="w-8 text-center">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="lucide lucide-plus"
                                                    >
                                                        <path d="M5 12h14" />
                                                        <path d="M12 5v14" />
                                                    </svg>

                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 ml-auto"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="lucide lucide-trash-2"
                                                    >
                                                        <path d="M3 6h18" />
                                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                        <line x1="10" x2="10" y1="11" y2="17" />
                                                        <line x1="14" x2="14" y1="11" y2="17" />
                                                    </svg>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t">
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">Subtotal</span>
                            <span className="font-bold">{formatCurrency(totalCartPrice)}</span>
                        </div>
                        <Button onClick={() => router.push("/products/checkout")} className="w-full" size="lg" disabled={cartItems.length === 0}>
                            Checkout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Overlay when cart is open */}
            {isCartOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsCartOpen(false)} />}
        </div>
    )
}

