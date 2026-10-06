import EditProductForm from "@/components/EditProductForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto w-full pt-16">
        <EditProductForm />
      </div>
    </div>
  );
}
