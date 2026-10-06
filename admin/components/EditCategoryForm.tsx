"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Eye, TicketSlash } from "lucide-react";
import MultiSelect from "./Multi-select";
import Editor from "./editor";
import ImageUpload from "./Image-upload";
import { useProduct } from "@/hooks/useProduct";
import { useProductStore } from "@/store/productStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useCategory } from "@/hooks/useCategory";
import { Category, useCategoryStore } from "@/store/categoryStore";
import Loader from "./loader";
import IconSelector from "./icon-selector";

const productSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  status: z.enum(["active", "not active"]),
  icon: z.string({
    required_error: "Please select category icon.",
  }),
});

type ProductFormValues = z.infer<typeof productSchema>;

const defaultValues: Partial<ProductFormValues> = {
  name: "",
  description: "",
  icon: "",
  status: "active",
};
const initialIcons = [
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/accessories.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/accessory.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/appliance-repair.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/children.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/clothes.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/computer-accessories.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/computer.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/cutlery.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/dress.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/fast-food+(1).png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/fast-food.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/game-controller.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/hamburger.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/healthy-food.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/iphone.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/jacket.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/keyboard-and-mouse.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/lan.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/laundry+(1).png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/laundry.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/masala-dosa.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/monitor.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/online-shopping.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/pizza.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/running-shoes.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/school-bag.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/secuirty.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/shirt.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/shoes.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/small-appliance.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/sneakers.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/speaker.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/travelling.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/usb.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/wedding-dress.png",
  "https://gideon-ecommerce-app-1.s3.eu-north-1.amazonaws.com/ecommerce-icons/wristwatch.png",
];

export default function EditCategoryForm() {
  const router = useRouter();
  const { isLoading, error } = useCategoryStore();
  const { getOneCategory, updateCategory } = useCategory();
  const [icons, setIcons] = useState(initialIcons);
  const [filteredCat, setFilteredCat] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const searchParams = useSearchParams();
  const id = searchParams.get("id") as any;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const clearForm = () => {
    form.reset();
  };

  const handleAddNewIcon = (newIcon: string) => {
    setIcons([...icons, newIcon]);
  };
  const handleGetCategory = async () => {
    let cat = await getOneCategory(id);
    setCategory(cat as any);
  };

  useEffect(() => {
    handleGetCategory();
  }, []);

  useEffect(() => {
    if (category) {
      form.setValue("name", category.name);
      form.setValue("description", category.description);
      form.setValue("icon", category.icon);
      form.setValue("status", category.isActive ? "active" : "not active");
    }
  }, [category]);

  async function onSubmit(data: ProductFormValues) {
    let cat = {
      name: data.name,
      icon: data.icon,
      description: data.description,
      isActive: data.status === "active",
    };
    updateCategory(id, cat);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-4">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[400px_1fr]">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Edit Category Info</h2>
            <p className="text-sm text-muted-foreground">
              You can modify or change category infomation and save
            </p>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name*</FormLabel>
                    <FormControl>
                      <Input
                        className="h-11"
                        placeholder="Enter category name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 ">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <Input
                          className="h-11"
                          type="text"
                          placeholder="Describe the category"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
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
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="active" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Active
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="not active" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Not Active
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      {/* <FormLabel>Icon</FormLabel> */}
                      <FormControl className="">
                        <IconSelector
                          currentIcon={category?.icon}
                          icons={icons}
                          onSelect={(e) => field.onChange(e)}
                          onAddNewIcon={handleAddNewIcon}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-4"></div>
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background px-6 py-3">
          <div className="flex items-center justify-end gap-4">
            <Button onClick={clearForm} variant="outline" type="button">
              <TicketSlash className="mr-2 h-4 w-4 text-red-600" />
              Clear Form
            </Button>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader size="small" /> : "Update Category"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
