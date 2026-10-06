"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, TicketSlash } from "lucide-react";

import Editor from "@/components/editor";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useBlog } from "@/hooks/useBlog";
import { useBlogStore } from "@/store/blogStore";
import ImageUpload from "@/components/Image-upload";
import TagInput from "@/components/tag-input";
import type { Blog } from "@/store/blogStore";

const blogSchema = z.object({
  title: z.string().min(3, { message: "Blog title must be at least 3 characters." }),
  content: z.string().min(10, { message: "Blog content must be at least 10 characters." }),
  categories: z.array(z.string()).min(1, { message: "Select at least one category." }),
  tags: z.array(z.string()).optional().default([]),
  thumbnail: z.array(z.string()).max(1, { message: "Upload only one thumbnail." }).optional().default([]),
  status: z.enum(["published", "draft"]),
  showOnHome: z.boolean().optional().default(false),
});

type BlogFormValues = z.infer<typeof blogSchema>;

const defaultValues: BlogFormValues = {
  title: "",
  content: "",
  categories: [],
  tags: [],
  thumbnail: [],
  status: "draft",
  showOnHome: false,
};

const getCategoryIds = (categories: Blog["categories"]) =>
  (categories || [])
    .map((category) => (typeof category === "string" ? category : category._id))
    .filter(Boolean);

const getBlogValues = (blog?: Blog | null): BlogFormValues => {
  if (!blog) return defaultValues;

  return {
    title: blog.title || "",
    content: blog.content || "",
    categories: getCategoryIds(blog.categories),
    tags: blog.tags || [],
    thumbnail: blog.thumbnail ? [blog.thumbnail] : [],
    status: blog.isPublished ? "published" : "draft",
    showOnHome: Boolean(blog.showOnHome),
  };
};

interface BlogFormProps {
  blog?: Blog | null;
  mode?: "create" | "edit";
}

export default function BlogForm({ blog = null, mode = "create" }: BlogFormProps) {
  const router = useRouter();
  const { createBlog, updateBlog, fetchBlogCategories } = useBlog();
  const { categories, isLoading } = useBlogStore();
  const isEditMode = mode === "edit";

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: getBlogValues(blog),
  });

  useEffect(() => {
    fetchBlogCategories();
  }, []);

  useEffect(() => {
    form.reset(getBlogValues(blog));
  }, [blog, form]);

  const clearForm = () => {
    form.reset(getBlogValues(isEditMode ? blog : null));
  };

  async function onSubmit(data: BlogFormValues) {
    const payload = {
      title: data.title,
      content: data.content,
      categories: data.categories,
      tags: data.tags || [],
      thumbnail: data.thumbnail?.[0] || undefined,
      status: data.status,
      showOnHome: data.showOnHome,
    };

    const savedBlog =
      isEditMode && blog?._id
        ? await updateBlog(blog._id, payload)
        : await createBlog(payload);

    if (savedBlog) {
      router.push("/blog/list");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-4">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[400px_1fr]">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Blog Info</h2>
            <p className="text-sm text-muted-foreground">
              Add the main story details, publishing status, and a simple cover image.
            </p>
          </div>
          <Card className="p-6">
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title*</FormLabel>
                    <FormControl>
                      <Input className="h-11" placeholder="Enter blog title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value || []}
                        onChange={field.onChange}
                        onRemove={(url) => field.onChange((field.value || []).filter((item) => item !== url))}
                        maxImages={1}
                      />
                    </FormControl>
                    <FormDescription>PNG or JPG, up to 2MB.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagInput value={field.value || []} onChange={field.onChange} placeholder="Add tag" />
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

              <FormField
                control={form.control}
                name="showOnHome"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-medium">Show on mobile home</FormLabel>
                      <FormDescription>
                        One published blog can appear as a full-width card in the mobile home product feed.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[400px_1fr]">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Categories</h2>
            <p className="text-sm text-muted-foreground">Choose where this blog should appear.</p>
          </div>
          <Card className="p-6">
            <FormField
              control={form.control}
              name="categories"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {categories
                      .filter((category) => category.isActive)
                      .map((category) => (
                        <FormField
                          key={category._id}
                          control={form.control}
                          name="categories"
                          render={({ field }) => (
                            <FormItem className="flex items-start gap-3 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(category._id)}
                                  onCheckedChange={(checked) => {
                                    const value = field.value || [];
                                    field.onChange(
                                      checked
                                        ? [...value, category._id]
                                        : value.filter((id) => id !== category._id),
                                    );
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-medium">{category.name}</FormLabel>
                                {category.description && (
                                  <p className="text-sm text-muted-foreground">{category.description}</p>
                                )}
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                  </div>
                  {categories.length === 0 && (
                    <div className="rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground">
                      Create a blog category before publishing blog posts.
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[400px_1fr]">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Content</h2>
            <p className="text-sm text-muted-foreground">Write the article body shown to customers.</p>
          </div>
          <Card className="p-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Content*</FormLabel>
                  <FormControl>
                    <Editor editorState={field.value} setEditorState={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background px-6 py-3">
          <div className="flex items-center justify-end gap-4">
            <Button onClick={clearForm} variant="outline" type="button">
              <TicketSlash className="mr-2 h-4 w-4 text-red-600" />
              Clear Form
            </Button>
            <Button variant="outline" type="button" onClick={() => router.push("/blog/list")}>
              <Eye className="mr-2 h-4 w-4" />
              Blog List
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader size="small" /> : isEditMode ? "Update Blog" : "Create Blog"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
