"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Box,
  PackageOpen,
  AlertTriangle,
} from "lucide-react";
import { useCategoryStore } from "@/store/categoryStore";
import { useCategory } from "@/hooks/useCategory";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryTable } from "@/components/categoryTable";
import ConfirmDialog from "@/components/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import AnalyticsCard from "@/components/analytics-card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CategoriesPage() {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const { categories } = useCategoryStore();
  const { fetchCategories, toggleAtive } = useCategory();
  const { deleteCategory } = useCategory();
  const [totalActiveCat, seTotalActiveCat] = useState(0);
  const [totalInactiveCat, seTotalInactiveCat] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories) {
      let ac = 0;
      let ic = 0;
      for (let cat of categories) {
        if (cat.isActive) {
          ac += 1;
        } else ic += 1;
      }
      seTotalActiveCat(ac);
      seTotalInactiveCat(ic);
    }
  }, [categories]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-3  md:p-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <AnalyticsCard
            title="Total Categories"
            value={categories.length}
            trend={{
              value: "↝ total number of categories",
              positive: true,
            }}
            icon={Box}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />

          <AnalyticsCard
            title="Active Categories"
            value={totalActiveCat}
            trend={{ value: "↑ working categories", positive: true }}
            icon={PackageOpen}
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
          />
          <AnalyticsCard
            title="Non-Active Categories"
            value={totalInactiveCat}
            trend={{
              value: "↓ Non-working categories",
              positive: false,
            }}
            icon={AlertTriangle}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-50"
          />
        </div>

        {/* Products Table Card */}
        <Card className="border-0 p-0 m-0 shadow-md relative ">
          <CardContent className=" px-0 mx-0 md:p-6 ">
            <div className="mb-8 flex-row flex w-full justify-between">
              <div className="relative">
                <div className="absolute left-0 top-2 w-1 h-6 bg-emerald-500" />
                <h1 className="text-xl font-semibold pl-6">Categories</h1>
              </div>
              <Link href={"/category/create"}>
                <Button>
                  <Plus size={18} /> Add Category
                </Button>
              </Link>
            </div>

            <CategoryTable
              data={categories as any}
              onDelete={(id) => {
                setOpenDeleteDialog(true);
                setCategoryId(id);
              }}
              onEdit={(id) => {
                router.push(`/category/edit?id=${id}`);
              }}
              onStatusChange={(id) => {
                setOpenStatusDialog(true);
                setCategoryId(id);
              }}
            />
          </CardContent>
        </Card>
      </div>
      <ConfirmDialog
        title="Delete Category"
        description="Are you sure you want to delete this category?"
        isOpen={openDeleteDialog}
        confirmText="Yes"
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={() => {
          deleteCategory(categoryId);
        }}
      />
      <ConfirmDialog
        title="Change Category Status"
        description="Confirm to change this product stauts"
        isOpen={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        onConfirm={() => {
          toggleAtive(categoryId);
        }}
      />
    </div>
  );
}
