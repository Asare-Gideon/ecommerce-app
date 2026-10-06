"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertTriangle, Edit, PackageOpen, Plus, Save, Truck, Trash2, X } from "lucide-react";

import AnalyticsCard from "@/components/analytics-card";
import ConfirmDialog from "@/components/confirm-dialog";
import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks/useSettings";
import { ShippingMethod, useSettingsStore } from "@/store/settingsStore";
import { formatCurrency } from "@/utils/constants";

const shippingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().max(500).optional().default(""),
  amount: z.number().min(0, "Amount must be positive"),
  estimatedDays: z.string().optional().default(""),
  status: z.enum(["active", "inactive"]),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

const defaultValues: ShippingFormValues = {
  name: "",
  description: "",
  amount: 0,
  estimatedDays: "",
  status: "active",
};

export default function ShippingMethodsPage() {
  const { settings, isLoading } = useSettingsStore();
  const { fetchSettings, createShippingMethod, updateShippingMethod, deleteShippingMethod } = useSettings();
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [deletingMethod, setDeletingMethod] = useState<ShippingMethod | null>(null);

  const methods = settings?.shippingMethods || [];
  const activeMethods = methods.filter((method) => method.isActive).length;
  const freeMethods = methods.filter((method) => Number(method.amount) === 0).length;

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const resetForm = () => {
    form.reset(defaultValues);
    setEditingMethod(null);
  };

  const handleEdit = (method: ShippingMethod) => {
    setEditingMethod(method);
    form.reset({
      name: method.name,
      description: method.description || "",
      amount: Number(method.amount) || 0,
      estimatedDays: method.estimatedDays || "",
      status: method.isActive ? "active" : "inactive",
    });
  };

  async function onSubmit(data: ShippingFormValues) {
    const payload = {
      name: data.name,
      description: data.description,
      amount: data.amount,
      estimatedDays: data.estimatedDays,
      isActive: data.status === "active",
    };

    if (editingMethod) {
      await updateShippingMethod(editingMethod._id, payload);
    } else {
      await createShippingMethod(payload);
    }
    resetForm();
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-3 md:p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <AnalyticsCard title="Shipping Methods" value={methods.length} trend={{ value: "delivery options", positive: true }} icon={Truck} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
          <AnalyticsCard title="Active Methods" value={activeMethods} trend={{ value: "available at checkout", positive: true }} icon={PackageOpen} iconColor="text-green-600" iconBgColor="bg-green-50" />
          <AnalyticsCard title="Free Shipping" value={freeMethods} trend={{ value: "zero cost methods", positive: true }} icon={AlertTriangle} iconColor="text-yellow-600" iconBgColor="bg-yellow-50" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="relative mb-6">
                <div className="absolute left-0 top-2 w-1 h-6 bg-emerald-500" />
                <h1 className="text-xl font-semibold pl-6">{editingMethod ? "Edit Shipping" : "Add Shipping"}</h1>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name*</FormLabel>
                      <FormControl><Input className="h-11" placeholder="Standard Shipping" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea className="min-h-24" placeholder="Delivers within 3-5 business days." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="amount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl><Input className="h-11" type="number" step="0.01" {...field} onChange={(event) => field.onChange(Number.parseFloat(event.target.value) || 0)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="estimatedDays" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimate</FormLabel>
                        <FormControl><Input className="h-11" placeholder="3-5 business days" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
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
                      {isLoading ? <Loader size="small" /> : editingMethod ? <><Save className="h-4 w-4" /> Save</> : <><Plus className="h-4 w-4" /> Add</>}
                    </Button>
                    {editingMethod && <Button type="button" variant="outline" onClick={resetForm}><X className="h-4 w-4" /> Cancel</Button>}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-0 md:p-6">
              <div className="relative mb-6 hidden md:block">
                <div className="absolute left-0 top-2 w-1 h-6 bg-emerald-500" />
                <h1 className="text-xl font-semibold pl-6">Shipping Methods</h1>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {methods.map((method) => (
                      <TableRow key={method._id}>
                        <TableCell>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-muted-foreground">{method.estimatedDays || "No estimate"}</div>
                        </TableCell>
                        <TableCell className="max-w-md text-muted-foreground">{method.description || "No description"}</TableCell>
                        <TableCell>{formatCurrency(method.amount)}</TableCell>
                        <TableCell><Badge variant={method.isActive ? "default" : "secondary"}>{method.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(method)}><Edit className="mr-1 h-3 w-3" /> Edit</Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={() => setDeletingMethod(method)}><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && methods.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No shipping methods yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        title="Delete Shipping Method"
        description={`Are you sure you want to delete ${deletingMethod?.name || "this method"}?`}
        isOpen={Boolean(deletingMethod)}
        onClose={() => setDeletingMethod(null)}
        onConfirm={() => {
          if (deletingMethod) deleteShippingMethod(deletingMethod._id);
          setDeletingMethod(null);
        }}
      />
    </div>
  );
}
