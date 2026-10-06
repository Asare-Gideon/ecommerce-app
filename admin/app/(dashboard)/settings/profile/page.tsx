"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { Mail, Phone, Save, UserCog } from "lucide-react";

import Loader from "@/components/loader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { BASE_URL } from "@/utils/constants";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
  const { user, token, updateUser, isLoading, setLoading } = useAuthStore();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user?.id) {
      toast({ variant: "destructive", title: "Profile unavailable", description: "Please login again." });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${BASE_URL}/user/update/${user.id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      updateUser({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        phone: response.data.phone,
      });
      toast({ title: "Profile updated successfully" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error.response?.data?.message || "Something went wrong please try again later",
      });
    } finally {
      setLoading(false);
    }
  }

  const initials = `${user?.firstName?.[0] || "A"}${user?.lastName?.[0] || "D"}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-3 md:p-8">
        <Card className="mb-6 border-0 shadow-md">
          <CardContent className="flex flex-col items-center gap-6 p-6 md:flex-row">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <div className="relative mb-2 inline-block md:block">
                <div className="absolute left-0 top-2 h-6 w-1 bg-emerald-500" />
                <h1 className="pl-6 text-xl font-semibold">Profile Settings</h1>
              </div>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:gap-5">
                <span className="inline-flex items-center justify-center gap-2 md:justify-start">
                  <Mail className="h-4 w-4" />
                  {user?.email || "No email"}
                </span>
                <span className="inline-flex items-center justify-center gap-2 md:justify-start">
                  <Phone className="h-4 w-4" />
                  {user?.phone || "No phone"}
                </span>
              </div>
            </div>
            <Button variant="outline" className="gap-2" type="button" disabled>
              <UserCog className="h-4 w-4" />
              Admin
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="relative mb-6">
              <div className="absolute left-0 top-2 h-6 w-1 bg-emerald-500" />
              <h2 className="pl-6 text-xl font-semibold">Personal Information</h2>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl><Input className="h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl><Input className="h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input className="h-11" type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input className="h-11" type="tel" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader size="small" /> : <><Save className="h-4 w-4" /> Save Changes</>}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
