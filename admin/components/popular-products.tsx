import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TopProducts from "@/app/(dashboard)/sales/analytics/_components/top-products";
import { useSales } from "@/hooks/useSales";
import { useEffect, useState } from "react";
import type { SalesPerformance } from "@/hooks/useSales";

export default function PopularProducts() {

  return (
    <Card className="max-h-[600px]">
      <CardHeader className="relative">
        <div className="absolute left-0 top-8 w-1 h-6 bg-emerald-500" />
        <CardTitle className="text-lg font-semibold pl-6">Popular Products</CardTitle>
      </CardHeader>
      <CardContent>
       <TopProducts /> 
      </CardContent>
    </Card>
  );
}
