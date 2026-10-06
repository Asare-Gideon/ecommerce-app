"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Check, ChevronsUpDown, Edit, ImageIcon, Link2, Plus, Save, Trash2, X } from "lucide-react";

import ConfirmDialog from "@/components/confirm-dialog";
import ImageUpload from "@/components/Image-upload";
import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useBanner } from "@/hooks/useBanner";
import { useCategory } from "@/hooks/useCategory";
import { useProduct } from "@/hooks/useProduct";
import { Banner, useBannerStore } from "@/store/bannerStore";
import { useCategoryStore } from "@/store/categoryStore";
import { Product, useProductStore } from "@/store/productStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BASE_URL, formatCurrency } from "@/utils/constants";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const bannerSchema = z.object({
  placement: z.enum(["slider", "promo"]),
  title: z.string().min(2, "Title is required"),
  subtitle: z.string().min(2, "Subcontent is required"),
  buttonText: z.string().min(2, "Button text is required"),
  destinationType: z.enum(["explore", "product", "custom"]),
  categoryId: z.string().optional().default("all"),
  productId: z.string().optional().default(""),
  searchQuery: z.string().optional().default(""),
  customLink: z.string().optional().default(""),
  image: z.string().optional().default(""),
  status: z.enum(["active", "inactive"]),
  sortOrder: z.number().min(0, "Sort order cannot be negative"),
}).superRefine((data, ctx) => {
  if (data.placement === "slider" && !data.image) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["image"], message: "Upload a slider image" });
  }
  if (data.destinationType === "product" && !data.productId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["productId"], message: "Select the product this banner should open" });
  }
  if (data.destinationType === "custom" && !data.customLink) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["customLink"], message: "Enter the custom destination" });
  }
});

type BannerFormValues = z.infer<typeof bannerSchema>;

const defaultValues: BannerFormValues = {
  placement: "slider",
  title: "",
  subtitle: "",
  buttonText: "Shop Now",
  destinationType: "explore",
  categoryId: "all",
  productId: "",
  searchQuery: "",
  customLink: "",
  image: "",
  status: "active",
  sortOrder: 0,
};

const buildBannerLink = (banner: BannerFormValues) => {
  if (banner.destinationType === "product") {
    return `/pages/product-details?productId=${encodeURIComponent(banner.productId || "")}`;
  }

  if (banner.destinationType === "custom") {
    return banner.customLink || "";
  }

  const params = new URLSearchParams();
  if (banner.categoryId && banner.categoryId !== "all") params.set("category", banner.categoryId);
  if (banner.searchQuery) params.set("search", banner.searchQuery);
  const query = params.toString();
  return query ? `/pages/explore?${query}` : "/pages/explore";
};

const parseBannerLink = (link = ""): Partial<BannerFormValues> => {
  if (link.startsWith("/pages/product-details")) {
    const query = link.split("?")[1] || "";
    return {
      destinationType: "product",
      productId: new URLSearchParams(query).get("productId") || "",
    };
  }

  if (link.startsWith("/pages/explore")) {
    const query = link.split("?")[1] || "";
    const params = new URLSearchParams(query);
    return {
      destinationType: "explore",
      categoryId: params.get("category") || "all",
      searchQuery: params.get("search") || "",
    };
  }

  return {
    destinationType: "custom",
    customLink: link,
  };
};

function BannerPreview({ banner, link }: { banner: BannerFormValues; link: string }) {
  if (banner.placement === "promo") {
    return (
      <div className="space-y-3">
        <div className="flex h-20 w-full max-w-[420px] items-center justify-between rounded-xl bg-emerald-600 p-4">
          <div>
            <h3 className="text-2xl font-bold text-white">{banner.title || "Get Your Special Sale"}</h3>
            <p className="text-sm text-white/90">{banner.subtitle || "Up to 40%"}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl text-white">›</div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link2 className="h-4 w-4" />
          <span className="truncate">{link || "No destination selected"}</span>
        </div>
      </div>
    );
  }

  const image =
    banner.image ||
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="space-y-3">
      <div className="relative h-[170px] w-full max-w-[420px] overflow-hidden rounded-xl bg-emerald-600">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="relative flex h-full flex-col justify-center p-4">
          <h3 className="max-w-[70%] text-xl font-bold text-white">{banner.title || "Get Your Special Sale"}</h3>
          <p className="mt-1 max-w-[70%] text-base text-white">{banner.subtitle || "Up to 40%"}</p>
          <div className="mt-3 w-fit rounded-full bg-white px-4 py-2 text-xs font-semibold text-emerald-700">
            {banner.buttonText || "Shop Now"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link2 className="h-4 w-4" />
        <span className="truncate">{link || "No destination selected"}</span>
      </div>
    </div>
  );
}

function ProductSearchPicker({
  products,
  value,
  onChange,
}: {
  products: Product[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Product[]>(products.slice(0, 50));
  const selectedProduct = [...options, ...products].find((product) => product._id === value);

  useEffect(() => {
    const search = query.trim();

    if (!search) {
      setOptions(products.slice(0, 50));
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          limit: "20",
          onlyPublished: "true",
          search,
        });
        const response = await fetch(`${BASE_URL}/product/query?${params.toString()}`);
        if (!response.ok) return;
        const result = await response.json();
        setOptions(result.products || []);
      } catch (error) {
        console.error("Failed to search products", error);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query, products]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" className="h-11 w-full justify-between">
          <span className="truncate">{selectedProduct ? selectedProduct.title : "Search and select product"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput value={query} onValueChange={setQuery} placeholder="Search products..." />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              {options.map((product) => (
                <CommandItem
                  key={product._id}
                  value={product._id}
                  onSelect={() => {
                    onChange(product._id);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <Check className={`h-4 w-4 ${value === product._id ? "opacity-100" : "opacity-0"}`} />
                  <div className="min-w-0">
                    <div className="truncate font-medium">{product.title}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {product.brand || "No brand"} - {formatCurrency(product.effectivePrice || product.price || 0)}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function BannersPage() {
  const { banners, isLoading } = useBannerStore();
  const { categories } = useCategoryStore();
  const { products } = useProductStore();
  const { fetchBanners, createBanner, updateBanner, deleteBanner } = useBanner();
  const { fetchCategories } = useCategory();
  const { fetchProductsWithQuery } = useProduct();
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues,
  });

  const previewBanner = form.watch();
  const placement = form.watch("placement");
  const destinationType = form.watch("destinationType");
  const generatedLink = buildBannerLink(previewBanner);
  const activeBanners = banners.filter((banner) => banner.isActive).length;
  const sliderBanners = banners.filter((banner) => banner.placement !== "promo").length;
  const promoBanners = banners.filter((banner) => banner.placement === "promo").length;

  useEffect(() => {
    fetchBanners();
    fetchCategories();
    fetchProductsWithQuery(`${BASE_URL}/product/query?limit=100&onlyPublished=true`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    form.reset(defaultValues);
    setEditingBanner(null);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    form.reset({
      placement: banner.placement || "slider",
      title: banner.title || banner.name || "",
      subtitle: banner.subtitle || "",
      buttonText: banner.buttonText || "Shop Now",
      ...parseBannerLink(banner.link || "/pages/explore"),
      image: banner.image || "",
      status: banner.isActive ? "active" : "inactive",
      sortOrder: Number(banner.sortOrder) || 0,
    });
  };

  async function onSubmit(data: BannerFormValues) {
    const payload = {
      placement: data.placement,
      title: data.title,
      subtitle: data.subtitle,
      buttonText: data.buttonText,
      link: buildBannerLink(data),
      image: data.image,
      isActive: data.status === "active",
      sortOrder: data.sortOrder,
    };

    if (editingBanner) {
      await updateBanner(editingBanner._id, payload);
    } else {
      await createBanner(payload);
    }

    resetForm();
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-3 md:p-8">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-md bg-emerald-50 p-3 text-emerald-600">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Slider Banners</p>
                <p className="text-2xl font-semibold">{sliderBanners}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-md bg-blue-50 p-3 text-blue-600">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Slides</p>
                <p className="text-2xl font-semibold">{activeBanners}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-md bg-amber-50 p-3 text-amber-600">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Home Promo</p>
                <p className="text-2xl font-semibold">{promoBanners}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <div className="absolute left-0 top-2 h-6 w-1 bg-emerald-500" />
                  <h1 className="pl-6 text-xl font-semibold">{editingBanner ? "Edit Banner" : "Add Banner"}</h1>
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="placement" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner Type*</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select banner type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="slider">Home Slider Banner</SelectItem>
                            <SelectItem value="promo">Small Home Promo Button</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Slider appears at the top. Promo appears as the small button below popular products.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Small Title*</FormLabel>
                        <FormControl><Input className="h-11" placeholder="Get Your Special Sale" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="subtitle" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcontent*</FormLabel>
                        <FormControl><Textarea className="min-h-20" placeholder="Up to 40% off selected products" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField control={form.control} name="buttonText" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Label*</FormLabel>
                          <FormControl><Input className="h-11" placeholder="Shop Now" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="sortOrder" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slide Order</FormLabel>
                          <FormControl><Input className="h-11" type="number" {...field} onChange={(event) => field.onChange(Number.parseInt(event.target.value) || 0)} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="destinationType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Destination*</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="explore">Filtered Explore Products</SelectItem>
                            <SelectItem value="product">Single Product Details</SelectItem>
                            <SelectItem value="custom">Custom Link</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {destinationType === "explore" && (
                      <div className="space-y-4 rounded-md border p-4">
                        <FormField control={form.control} name="categoryId" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Advertised Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "all"}>
                              <FormControl>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="All products" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all">All products</SelectItem>
                                {categories.map((category) => (
                                  <SelectItem key={category._id} value={category._id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="searchQuery" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Search Filter</FormLabel>
                            <FormControl><Input className="h-11" placeholder="e.g. shoes, cream, iPhone" {...field} /></FormControl>
                            <FormDescription>Optional. The app opens Explore already filtered to this search.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    )}
                    {destinationType === "product" && (
                      <FormField control={form.control} name="productId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Advertised Product*</FormLabel>
                          <FormControl>
                            <ProductSearchPicker products={products} value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormDescription>The app opens this product details page so the customer can buy it.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    {destinationType === "custom" && (
                      <FormField control={form.control} name="customLink" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Destination*</FormLabel>
                          <FormControl><Input className="h-11" placeholder="/pages/explore or https://example.com" {...field} /></FormControl>
                          <FormDescription>Use a valid app route or a full website URL.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                      <Link2 className="h-4 w-4" />
                      <span className="truncate">{generatedLink}</span>
                    </div>
                    {placement === "slider" && (
                      <FormField control={form.control} name="image" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Banner Image*</FormLabel>
                          <FormControl>
                            <ImageUpload
                              value={field.value ? [field.value] : []}
                              onChange={(value) => field.onChange(value[value.length - 1] || "")}
                              onRemove={() => field.onChange("")}
                              maxImages={1}
                            />
                          </FormControl>
                          <FormDescription>Use a wide image. The app shows this as a 170px tall slider card.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                            <FormItem className="flex items-center space-x-2">
                              <FormControl><RadioGroupItem value="active" /></FormControl>
                              <FormLabel className="font-normal">Active</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl><RadioGroupItem value="inactive" /></FormControl>
                              <FormLabel className="font-normal">Inactive</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3">
                      <Button className="flex-1" type="submit" disabled={isLoading}>
                        {isLoading ? <Loader size="small" /> : editingBanner ? <><Save className="h-4 w-4" /> Save</> : <><Plus className="h-4 w-4" /> Add</>}
                      </Button>
                      {editingBanner && <Button type="button" variant="outline" onClick={resetForm}><X className="h-4 w-4" /> Cancel</Button>}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <div className="absolute left-0 top-2 h-6 w-1 bg-emerald-500" />
                  <h2 className="pl-6 text-xl font-semibold">App Preview</h2>
                </div>
                <BannerPreview banner={previewBanner} link={generatedLink} />
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-md">
            <CardContent className="p-0 md:p-6">
              <div className="relative mb-6 hidden md:block">
                <div className="absolute left-0 top-2 h-6 w-1 bg-emerald-500" />
                <h1 className="pl-6 text-xl font-semibold">Banner Slider</h1>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Preview</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banners.map((banner) => (
                      <TableRow key={banner._id}>
                        <TableCell>
                          {banner.placement === "promo" ? (
                            <div className="flex h-16 w-28 items-center justify-between rounded-md bg-emerald-600 p-2 text-white">
                              <span className="line-clamp-2 text-xs font-semibold">{banner.title || "Promo"}</span>
                              <span className="text-lg">›</span>
                            </div>
                          ) : (
                            <div
                              className="h-16 w-28 overflow-hidden rounded-md bg-cover bg-center bg-gray-100"
                              style={{ backgroundImage: banner.image ? `url(${banner.image})` : undefined }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={banner.placement === "promo" ? "secondary" : "outline"}>
                            {banner.placement === "promo" ? "Small Promo" : "Slider"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{banner.title || banner.name || "Untitled banner"}</div>
                          <div className="max-w-xs truncate text-sm text-muted-foreground">{banner.subtitle || "No subcontent"}</div>
                          <div className="mt-1 text-xs text-muted-foreground">Button: {banner.buttonText || "Shop Now"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[220px] truncate text-sm">{banner.link || "No destination"}</div>
                          <div className="text-xs text-muted-foreground">Order {Number(banner.sortOrder) || 0}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={banner.isActive ? "default" : "secondary"}>{banner.isActive ? "Active" : "Inactive"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(banner)}><Edit className="mr-1 h-3 w-3" /> Edit</Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={() => setDeletingBanner(banner)}><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && banners.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No banners yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        title="Delete Banner"
        description={`Are you sure you want to delete ${deletingBanner?.title || "this banner"}?`}
        isOpen={Boolean(deletingBanner)}
        onClose={() => setDeletingBanner(null)}
        onConfirm={() => {
          if (deletingBanner) deleteBanner(deletingBanner._id);
          setDeletingBanner(null);
        }}
      />
    </div>
  );
}
