"use client"
import {
  DollarSign,
  Download,
  ShoppingCart,
  SlidersHorizontal,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Overview from "./_components/sections/overview";
import SalesBreakdown from "./_components/sections/break-downs";
import ReportFilterDialog from "@/components/reportFilterDialog";
import { useState } from "react";


export default function SalesManagementPage() {
  const [isOpen, setIsOpen] = useState(false)


  const handleDialog = () => {
    setIsOpen( (prev) => !prev);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex md:flex-row flex-col md:items-center justify-between space-y-2">
        <h2 className=" text-2xl md:text-3xl font-bold tracking-tight">Sales Management</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={handleDialog}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="breakdowns">Breakdowns</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics" className="space-y-4">
          <Overview />
        </TabsContent>
        <TabsContent value="breakdowns" className="space-y-4">
          <SalesBreakdown />
        </TabsContent>
      </Tabs>

      <ReportFilterDialog isOpen={isOpen} setIsOpen={handleDialog} />
    </div>
  );
}
