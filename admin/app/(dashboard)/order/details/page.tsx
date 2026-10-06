"use client";

import type React from "react";

import { RotatingLines } from "react-loader-spinner";
import { useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { CreditCard, Mail, MapPin, PackageOpen, Phone, Receipt, Truck, User as UserIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrder } from "@/hooks/useOrder";
import { useSearchParams } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";
import ConfirmDialog from "@/components/confirm-dialog";
import { BASE_URL, formatCurrency } from "@/utils/constants";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";

// Types (unchanged)
type Image = {
  name: string;
  url: string;
  _id: string;
  id: string;
};

type Product = {
  _id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  price: number;
  quantity: number;
  images: Image[];
  brand: string;
  sold: number;
  isPublished: boolean;
  colors: string[];
  sizes: string[];
  ratings: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  publishedAt: string | null;
  averageRating: number;
  id: string;
  effectivePrice?: number;
  hasDiscount?: boolean;
};

type OrderProduct = {
  product?: Product;
  quantity: number;
  price?: number;
  chosenColors?: string[];
  chosenSize?: string;
  chosenColor?: string;
  _id: string;
};

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalOrders?: number;
  totalSpent?: number;
};

type Address = {
  _id?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  default?: boolean;
};

type Order = {
  _id: string;
  user?: User | string;
  products: OrderProduct[];
  totalAmount: number;
  subtotalAmount?: number;
  shippingAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  shippingMethod?: string;
  status: "pending" | "processing" | "completed" | "delivered" | "canceled";
  paymentMethod: string;
  paymentGateway?: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  shippingAddress?: Address | string;
  transactionId?: string;
  paidAt?: string;
  deliveredAt?: string;
  canceledReason?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  delivered: "bg-purple-100 text-purple-800",
  canceled: "bg-red-100 text-red-800",
};

const statusOrder = ["pending", "processing", "completed", "delivered", "canceled"];

const getCustomer = (order?: Order) =>
  order?.user && typeof order.user === "object" ? order.user : undefined;

const getAddress = (address?: Address | string) =>
  address && typeof address === "object" ? address : undefined;

const formatAddress = (address?: Address | string) => {
  if (!address) return "No delivery address attached to this order.";
  if (typeof address === "string") return address;

  return [
    address.address,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ") || "No delivery address attached to this order.";
};

const formatPaymentLabel = (value?: string) =>
  value ? value.replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "Not provided";

const getProductImage = (product?: Product) =>
  product?.images?.[0]?.url || "/placeholder.svg";

const getProductTitle = (product?: Product) => product?.title || "Deleted product";

const getLineUnitPrice = (item: OrderProduct) =>
  Number(item.price ?? item.product?.effectivePrice ?? item.product?.price ?? 0);

const getStatusClassName = (status?: string) =>
  statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";

export default function OrderDetailPage() {
  const { getOneOrder, updateOrder } = useOrder();
  const { isLoading, error } = useOrderStore();
  const token = useAuthStore((state) => state.token);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [orderData, setOrderData] = useState<Order | undefined>();
  const [shippingAddress, setShippingAddress] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const searchParams = useSearchParams();
  const [newSelecteStatus, setNewSeletedStatus] = useState("");
  const id = searchParams.get("id") as any;

  const handleStatusChange = (newStatus: string) => {
    setOpenAlertDialog(true);
    setNewSeletedStatus(newStatus);
  };

  const isStatusDisabled = (status: string) => {
    const currentIndex = statusOrder.indexOf(orderStatus);
    const statusIndex = statusOrder.indexOf(status);
    return statusIndex < currentIndex;
  };

  const handleNextImage = () => {
    const images = orderData?.products?.[0]?.product?.images || [];
    if (!images.length) return;
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % images.length
    );
  };

  const handlePrevImage = () => {
    const images = orderData?.products?.[0]?.product?.images || [];
    if (!images.length) return;
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + images.length) % images.length
    );
  };

  const getOrder = async () => {
    const responseOrder = await getOneOrder(id);
    setOrderData(responseOrder);
  };

  useEffect(() => {
    getOrder();
  }, []);

  useEffect(() => {
    if (orderData) {
      setOrderStatus(orderData.status as any);
      setShippingAddress(formatAddress(orderData.shippingAddress));
    }
  }, [orderData]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress(e.target.value);
  };

  const handleAddressUpdate = async () => {
    if (!address?._id) {
      toast({
        variant: "destructive",
        title: "Address cannot be updated",
        description: "This order does not have a saved address record attached.",
      });
      return;
    }

    const response = await fetch(`${BASE_URL}/address/update/${address._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ address: shippingAddress }),
    });

    if (!response.ok) {
      toast({
        variant: "destructive",
        title: "Address update failed",
        description: "Please check the address and try again.",
      });
      return;
    }

    const updatedAddress = await response.json();
    setOrderData((current) =>
      current ? { ...current, shippingAddress: updatedAddress } : current
    );
    setShippingAddress(formatAddress(updatedAddress));
    setIsEditingAddress(false);
    toast({ title: "Address updated successfully" });
  };

  const customer = getCustomer(orderData);
  const address = getAddress(orderData?.shippingAddress);
  const productCount = orderData?.products?.reduce((total, item) => total + Number(item.quantity || 0), 0) || 0;

  if (!isLoading && !orderData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <PackageOpen className="h-12 w-12 text-gray-400" />
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">Order not found</h1>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          {error?.message || "This order could not be loaded. Check the order id or try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="py-14 px-4 md:px-6 2xl:px-20 2xl:container 2xl:mx-auto">
      <ConfirmDialog
        title="Update order Status"
        description="You wont be able change it back again. Are you sure?"
        isOpen={openAlertDialog}
        confirmText="Yes, Continue"
        onClose={() => setOpenAlertDialog(false)}
        onConfirm={async () => {
          let res = await updateOrder(id, { status: newSelecteStatus as any });
          if (!res) return;
          setOrderStatus(newSelecteStatus as any);
        }}
      />

      {isLoading ? (
        <>
          <div className="w-full h-[60vh] justify-center flex items-center">
            <RotatingLines
              visible={true}
              strokeColor="#2563eb"
              width="60"
              strokeWidth="2"
              animationDuration="0.75"
              ariaLabel="rotating-lines-loading"
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
            <div className="flex flex-col">
              <h1 className="text-2xl lg:text-3xl font-semibold leading-8 text-gray-800 break-all">
                Order #{orderData?._id?.slice(-8).toUpperCase() || "Not found"}
              </h1>
              <p className="text-base font-medium leading-6 text-gray-600">
                {orderData && format(new Date(orderData.createdAt), "PPP")} at{" "}
                {orderData && format(new Date(orderData.createdAt), "p")}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {productCount} item{productCount === 1 ? "" : "s"} • {formatPaymentLabel(orderData?.paymentStatus)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select onValueChange={handleStatusChange} value={orderStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={orderStatus} />
                </SelectTrigger>
                <SelectContent>
                  {statusOrder.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      disabled={isStatusDisabled(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge
                className={`text-sm px-3 py-1 ${getStatusClassName(orderStatus)}`}
              >
                {formatPaymentLabel(orderStatus)}
              </Badge>
              <Badge
                className={`text-sm px-3 py-1 ${
                  orderData?.paymentStatus === "paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : orderData?.paymentStatus === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                }`}
              >
                Payment: {formatPaymentLabel(orderData?.paymentStatus)}
              </Badge>
            </div>
          </div>

          <div className="mt-10 flex flex-col xl:flex-row justify-center items-stretch w-full xl:space-x-8 space-y-4 md:space-y-6 xl:space-y-0">
            <div className="flex flex-col justify-start items-start w-full space-y-4 md:space-y-6 xl:space-y-8">
              <div className="flex flex-col justify-start items-start bg-gray-50 px-4 py-4 md:py-6 md:p-6 xl:p-8 w-full">
                <p className="text-lg md:text-xl font-semibold leading-6 xl:leading-5 text-gray-800">
                  Customer's Cart
                </p>
                {orderData?.products.map((item, index) => {
                  const product = item.product;
                  const unitPrice = getLineUnitPrice(item);
                  const lineTotal = unitPrice * Number(item.quantity || 0);
                  const productImages = product?.images || [];

                  return (
                  <div
                    key={item._id}
                    className="mt-4 md:mt-6 flex flex-col md:flex-row justify-start items-start md:items-center md:space-x-6 xl:space-x-8 w-full"
                  >
                    <div className="pb-4 md:pb-8 w-full md:w-40">
                      <Dialog>
                        <DialogTrigger>
                          <Image
                            className="w-full hidden md:block"
                            src={
                              getProductImage(product)
                            }
                            alt={getProductTitle(product)}
                            width={150}
                            height={150}
                          />
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <div className="relative">
                            <Button
                              className="absolute top-2 right-2 z-10"
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                document.querySelector("dialog")?.close()
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Image
                              src={
                                productImages[currentImageIndex]?.url ||
                                getProductImage(product)
                              }
                              alt={getProductTitle(product)}
                              width={600}
                              height={600}
                              className="rounded-lg object-cover w-full h-auto"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center">
                              <Button
                                onClick={handlePrevImage}
                                size="icon"
                                variant="ghost"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  className="w-6 h-6"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                              </Button>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center">
                              <Button
                                onClick={handleNextImage}
                                size="icon"
                                variant="ghost"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  className="w-6 h-6"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="border-b border-gray-200 md:flex-row flex-col flex justify-between items-start w-full pb-8 space-y-4 md:space-y-0">
                      <div className="w-full flex flex-col justify-start items-start space-y-8">
                        <h3 className="text-xl xl:text-2xl font-semibold leading-6 text-gray-800">
                          {getProductTitle(product)}
                        </h3>
                        <div className="flex justify-start items-start flex-col space-y-2">
                          <p className="text-sm leading-none text-gray-800">
                            <span className="text-gray-300">Brand: </span>{" "}
                            {product?.brand || "Not provided"}
                          </p>
                          <p className="text-sm leading-none text-gray-800">
                            <span className="text-gray-300">Variant: </span>{" "}
                            {[item.chosenSize, item.chosenColor || item.chosenColors?.[0]]
                              .filter(Boolean)
                              .join(" / ") || "No variant selected"}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between space-x-8 items-start w-full">
                        <p className="text-base xl:text-lg leading-6 text-gray-800">
                          {formatCurrency(unitPrice)}
                        </p>
                        <p className="text-base xl:text-lg leading-6 text-gray-800">
                          {item.quantity}
                        </p>
                        <p className="text-base xl:text-lg font-semibold leading-6 text-gray-800">
                          {formatCurrency(lineTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
              <div className="flex justify-center flex-col md:flex-row items-stretch w-full space-y-4 md:space-y-0 md:space-x-6 xl:space-x-8">
                <div className="flex flex-col px-4 py-6 md:p-6 xl:p-8 w-full bg-gray-50 space-y-6">
                  <h3 className="text-xl font-semibold leading-5 text-gray-800">
                    Summary
                  </h3>
                  <div className="flex justify-center items-center w-full space-y-4 flex-col border-gray-200 border-b pb-4">
                    <div className="flex justify-between w-full">
                      <p className="text-base leading-4 text-gray-800">
                        Subtotal
                      </p>
                      <p className="text-base leading-4 text-gray-600">
                        {formatCurrency(orderData?.subtotalAmount ?? orderData?.totalAmount)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center w-full">
                      <p className="text-base leading-4 text-gray-800">
                        Shipping
                      </p>
                      <p className="text-base leading-4 text-gray-600">
                        {formatCurrency(orderData?.shippingAmount || 0)}
                      </p>
                    </div>
                    {Number(orderData?.discountAmount || 0) > 0 && (
                      <div className="flex justify-between items-center w-full">
                        <p className="text-base leading-4 text-gray-800">
                          Discount
                        </p>
                        <p className="text-base leading-4 text-emerald-700">
                          -{formatCurrency(orderData?.discountAmount || 0)}
                        </p>
                      </div>
                    )}
                    {Number(orderData?.taxAmount || 0) > 0 && (
                      <div className="flex justify-between items-center w-full">
                        <p className="text-base leading-4 text-gray-800">
                          Tax
                        </p>
                        <p className="text-base leading-4 text-gray-600">
                          {formatCurrency(orderData?.taxAmount || 0)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <p className="text-base font-semibold leading-4 text-gray-800">
                      Total
                    </p>
                    <p className="text-base font-semibold leading-4 text-gray-600">
                      {formatCurrency(orderData?.totalAmount)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-center px-4 py-6 md:p-6 xl:p-8 w-full bg-gray-50 space-y-6">
                  <h3 className="text-xl font-semibold leading-5 text-gray-800">
                    Fulfillment
                  </h3>
                  <div className="flex justify-between items-start w-full">
                    <div className="flex justify-center items-center space-x-4">
                      <div className="w-8 h-8">
                        <Truck className="w-full h-full" />
                      </div>
                      <div className="flex flex-col justify-start items-center">
                        <p className="text-lg leading-6 font-semibold text-gray-800">
                          {orderData?.shippingMethod || "Shipping"}
                          <br />
                          <span className="font-normal">
                            {orderData?.deliveredAt
                              ? `Delivered ${format(new Date(orderData.deliveredAt), "PPP")}`
                              : "Delivery timing depends on selected method"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold leading-6 text-gray-800">
                      {formatCurrency(orderData?.shippingAmount || 0)}
                    </p>
                  </div>
                  <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span>{formatPaymentLabel(orderData?.paymentMethod)} • {formatPaymentLabel(orderData?.paymentStatus)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Receipt className="h-4 w-4 text-gray-500" />
                      <span>{orderData?.transactionId || "No transaction reference yet"}</span>
                    </div>
                    {orderData?.paidAt && (
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <span>Paid {format(new Date(orderData.paidAt), "PPP p")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 w-full xl:w-96 flex justify-between items-center md:items-start px-4 py-6 md:p-6 xl:p-8 flex-col">
              <h3 className="text-xl font-semibold leading-5 text-gray-800">
                Customer
              </h3>
              <div className="flex flex-col md:flex-row xl:flex-col justify-start items-stretch h-full w-full md:space-x-6 lg:space-x-8 xl:space-x-0">
                <div className="flex flex-col justify-start items-start flex-shrink-0">
                  <div className="flex justify-center w-full md:justify-start items-center space-x-4 py-8 border-b border-gray-200">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                      <UserIcon className="h-7 w-7" />
                    </div>
                    <div className="flex justify-start items-start flex-col space-y-2">
                      <p className="text-base font-semibold leading-4 text-left text-gray-800">
                        {customer ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim() : "Customer unavailable"}
                      </p>
                      <p className="text-sm leading-5 text-gray-600">
                        {customer?.totalOrders ?? "0"} previous order{customer?.totalOrders === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center text-gray-800 md:justify-start items-center space-x-4 py-4 border-b border-gray-200 w-full">
                    <Mail />
                    <p className="cursor-pointer text-sm leading-5">
                      {customer?.email || address?.email || "No email provided"}
                    </p>
                  </div>

                  <div className="flex justify-center text-gray-800 md:justify-start items-center space-x-4 py-4 border-b border-gray-200 w-full">
                    <Phone />
                    <p className="cursor-pointer text-sm leading-5">
                      {customer?.phone || address?.phoneNumber || "No phone provided"}
                    </p>
                  </div>

                  <div className="flex justify-center text-gray-800 md:justify-start items-center space-x-4 py-4 border-b border-gray-200 w-full">
                    <Receipt />
                    <p className="cursor-pointer text-sm leading-5">
                      Lifetime spend: {formatCurrency(customer?.totalSpent || 0)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between xl:h-full items-stretch w-full flex-col mt-6 md:mt-0">
                  <div className="flex justify-center md:justify-start xl:flex-col flex-col md:space-x-6 lg:space-x-8 xl:space-x-0 space-y-4 xl:space-y-12 md:space-y-0 md:flex-row items-center md:items-start">
                    <div className="flex justify-center md:justify-start items-center md:items-start flex-col space-y-4 xl:mt-8">
                      <div className="flex items-center gap-2 text-gray-800">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <p className="text-base font-semibold leading-4 text-center md:text-left">
                          Shipping Address
                        </p>
                      </div>
                      <div className="w-48 lg:w-full xl:w-56 text-center md:text-left text-sm leading-5 text-gray-600">
                        <p>{shippingAddress}</p>
                        {address?.phoneNumber && <p className="mt-2">Phone: {address.phoneNumber}</p>}
                        {address?.email && <p>Email: {address.email}</p>}
                      </div>
                    </div>
                    <div className="flex justify-center md:justify-start items-center md:items-start flex-col space-y-4">
                      <p className="text-base font-semibold leading-4 text-center md:text-left text-gray-800">
                        Billing Address
                      </p>
                      <p className="w-48 lg:w-full xl:w-56 text-center md:text-left text-sm leading-5 text-gray-600">
                        {shippingAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full mt-4 justify-center items-center md:justify-start md:items-start">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="mt-8 md:mt-0 py-5 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2  font-medium w-96 2xl:w-full text-base leading-4 text-primary"
                        >
                          Edit Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Shipping Address</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="shipping-address"
                              className="text-right"
                            >
                              Address
                            </Label>
                            <Input
                              id="shipping-address"
                              value={shippingAddress}
                              onChange={handleAddressChange}
                              className="col-span-3"
                            />
                          </div>
                        </div>
                        <Button onClick={handleAddressUpdate}>
                          Update Address
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
