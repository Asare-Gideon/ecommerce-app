"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, FolderTree, Pencil, Plus, Save, Trash2, X } from "lucide-react";

import AnalyticsCard from "@/components/analytics-card";
import ConfirmDialog from "@/components/confirm-dialog";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBlog } from "@/hooks/useBlog";
import { BlogCategory, useBlogStore } from "@/store/blogStore";

export default function BlogCategoriesPage() {
  const {
    fetchBlogCategories,
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory,
  } = useBlog();
  const { categories, isLoading } = useBlogStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const activeCount = useMemo(() => categories.filter((category) => category.isActive).length, [categories]);
  const inactiveCount = useMemo(() => categories.filter((category) => !category.isActive).length, [categories]);

  useEffect(() => {
    fetchBlogCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    if (editingCategory) {
      await updateBlogCategory(editingCategory._id, {
        name,
        description,
        isActive: editingCategory.isActive,
      });
    } else {
      await createBlogCategory({
        name,
        description,
        isActive: true,
      });
    }

    resetForm();
  };

  const handleEdit = (category: BlogCategory) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || "");
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-3 md:p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <AnalyticsCard
            title="Total Categories"
            value={categories.length}
            trend={{ value: "blog groups", positive: true }}
            icon={FolderTree}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />
          <AnalyticsCard
            title="Active"
            value={activeCount}
            trend={{ value: "available for posts", positive: true }}
            icon={Plus}
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
          />
          <AnalyticsCard
            title="Inactive"
            value={inactiveCount}
            trend={{ value: "hidden categories", positive: false }}
            icon={AlertTriangle}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-50"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="relative mb-6">
                <div className="absolute left-0 top-2 w-1 h-6 bg-emerald-500" />
                <h1 className="text-xl font-semibold pl-6">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h1>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1.5 block">Name*</label>
                  <Input
                    className="h-11"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Buying Guides"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1.5 block">Description</label>
                  <Textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Short description for this blog category"
                    className="min-h-28"
                  />
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1" disabled={isLoading || !name.trim()} onClick={handleSubmit}>
                    {isLoading ? (
                      <Loader size="small" />
                    ) : editingCategory ? (
                      <>
                        <Save className="h-4 w-4" />
                        Save
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add
                      </>
                    )}
                  </Button>
                  {editingCategory && (
                    <Button variant="outline" onClick={resetForm}>
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-0 md:p-6">
              <div className="relative mb-6 hidden md:block">
                <div className="absolute left-0 top-2 w-1 h-6 bg-emerald-500" />
                <h1 className="text-xl font-semibold pl-6">Blog Categories</h1>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category._id}>
                        <TableCell>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">{category.slug}</div>
                        </TableCell>
                        <TableCell className="max-w-md text-muted-foreground">
                          {category.description || "No description"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                              <Pencil className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() => {
                                setDeleteCategoryId(category._id);
                                setOpenDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && categories.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                          No blog categories yet.
                        </TableCell>
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
        title="Delete Blog Category"
        description="Are you sure you want to delete this blog category?"
        isOpen={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={() => {
          deleteBlogCategory(deleteCategoryId);
          setOpenDeleteDialog(false);
        }}
      />
    </div>
  );
}
