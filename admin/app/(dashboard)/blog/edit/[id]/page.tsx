"use client";

import BlogForm from "@/components/blog-form";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { useBlog } from "@/hooks/useBlog";
import type { Blog } from "@/store/blogStore";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getBlog } = useBlog();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadBlog() {
      if (!params.id) return;
      setIsLoading(true);
      const result = await getBlog(params.id);
      if (mounted) {
        setBlog(result || null);
        setIsLoading(false);
      }
    }

    loadBlog();

    return () => {
      mounted = false;
    };
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-semibold">Blog not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          This blog could not be loaded. It may have been deleted or you may need to refresh the page.
        </p>
        <Button type="button" onClick={() => router.push("/blog/list")}>
          Back to Blogs
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto w-full pt-10">
        <div className="mb-8 flex items-center justify-between px-4">
          <div>
            <p className="text-sm text-muted-foreground">Edit article</p>
            <h1 className="text-2xl font-semibold">{blog.title}</h1>
          </div>
          <Button type="button" variant="outline" onClick={() => router.push("/blog/list")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Blog List
          </Button>
        </div>
        <BlogForm blog={blog} mode="edit" />
      </div>
    </div>
  );
}
