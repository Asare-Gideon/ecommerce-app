"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { BookOpenText, Eye, FileText, Home, Pencil, Plus, Search, Trash2 } from "lucide-react";

import AnalyticsCard from "@/components/analytics-card";
import ConfirmDialog from "@/components/confirm-dialog";
import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBlog } from "@/hooks/useBlog";
import { Blog, useBlogStore } from "@/store/blogStore";

const removeHtmlTags = (value: string) => value.replace(/<\/?.+?>/g, "").trim();

export default function BlogListPage() {
  const { fetchBlogs, fetchBlogCategories, togglePublish, deleteBlog } = useBlog();
  const { blogs, categories, stats, isLoading } = useBlogStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBlogId, setSelectedBlogId] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const publishedCount = useMemo(() => blogs.filter((blog) => blog.isPublished).length, [blogs]);
  const draftCount = useMemo(() => blogs.filter((blog) => !blog.isPublished).length, [blogs]);

  useEffect(() => {
    fetchBlogCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(currentPage),
      limit: "10",
      search: deferredSearch || "all",
      category,
      status,
      sort: "createdAt:desc",
    });
    fetchBlogs(`?${params.toString()}`);
  }, [currentPage, deferredSearch, category, status]);

  const handleDelete = (blog: Blog) => {
    setSelectedBlogId(blog._id);
    setOpenDeleteDialog(true);
  };

  const handlePublish = (blog: Blog) => {
    setSelectedBlogId(blog._id);
    setOpenPublishDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-3 md:p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <AnalyticsCard
            title="Total Blogs"
            value={stats?.total || blogs.length}
            trend={{ value: "all articles", positive: true }}
            icon={BookOpenText}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />
          <AnalyticsCard
            title="Published"
            value={publishedCount}
            trend={{ value: "visible to customers", positive: true }}
            icon={Eye}
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
          />
          <AnalyticsCard
            title="Drafts"
            value={draftCount}
            trend={{ value: "not published yet", positive: false }}
            icon={FileText}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-50"
          />
        </div>

        <Card className="border-0 p-0 m-0 shadow-md relative">
          <CardContent className="px-0 mx-0 md:p-6">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative">
                <div className="absolute left-0 top-2 w-1 h-6 bg-emerald-500" />
                <h1 className="text-xl font-semibold pl-6">Blogs</h1>
              </div>
              <Link href="/blog/create">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create Blog
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 px-2 md:grid-cols-3 md:px-0">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1.5 block">General Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search blogs..."
                    className="h-11 pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1.5 block">Category</label>
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1.5 block">Status</label>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="relative mt-6 overflow-x-auto rounded-lg border border-gray-200 shadow-md">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                  <Loader />
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Blog</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Home</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog) => (
                    <TableRow key={blog._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-14 overflow-hidden rounded-md border bg-gray-100">
                            <img
                              src={blog.thumbnail || "/placeholder.svg"}
                              alt={blog.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="max-w-md">
                            <div className="font-medium text-gray-900">{blog.title}</div>
                            <div className="line-clamp-1 text-sm text-gray-500">
                              {removeHtmlTags(blog.content)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {blog.categories?.map((item) => (
                            <Badge key={item._id} variant="secondary">
                              {item.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{blog.views || 0}</TableCell>
                      <TableCell>{format(new Date(blog.createdAt), "yyyy-MM-dd")}</TableCell>
                      <TableCell>
                        {blog.showOnHome ? (
                          <Badge variant="outline" className="gap-1">
                            <Home className="h-3 w-3" />
                            Featured
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={blog.isPublished ? "default" : "secondary"}>
                          {blog.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Link href={`/blog/edit/${blog._id}`}>
                            <Button variant="outline" size="sm">
                              <Pencil className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => handlePublish(blog)}>
                            <Eye className="mr-1 h-3 w-3" />
                            {blog.isPublished ? "Unpublish" : "Publish"}
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(blog)}>
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && blogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        No blogs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-2 py-4">
              <div className="text-sm text-gray-600">Total {stats?.total || 0}</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {stats?.page || currentPage} of {stats?.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= (stats?.totalPages || 1)}
                  onClick={() => setCurrentPage((page) => page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        title="Delete Blog"
        description="Are you sure you want to delete this blog?"
        isOpen={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={() => {
          deleteBlog(selectedBlogId);
          setOpenDeleteDialog(false);
        }}
      />
      <ConfirmDialog
        title="Change Blog Status"
        description="Confirm to change this blog status."
        isOpen={openPublishDialog}
        onClose={() => setOpenPublishDialog(false)}
        onConfirm={() => {
          togglePublish(selectedBlogId);
          setOpenPublishDialog(false);
        }}
      />
    </div>
  );
}
