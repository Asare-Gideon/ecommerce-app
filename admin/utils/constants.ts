import { Clock, Package2, ShoppingCart, X } from "lucide-react";

const DEFAULT_API_URL = "https://shop-api.54-90-159-53.sslip.io/api/v1";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL;
export const API_ORIGIN = new URL(BASE_URL).origin;

export const formatCurrency = (value: number | string | null | undefined, currency = "GHS") => {
  const currencyCode = String(currency || "GHS").toUpperCase();
  const amount = Number(value || 0).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currencyCode === "GHS" ? "GH\u20B5" : `${currencyCode} `}${amount}`;
};

export const orderStatusCards = [
  {
    title: "Pending Order",
    value: "0",
    icon: Clock,
    borderColor: "border-l-yellow-500",
    iconColor: "text-yellow-500",
    iconBgColor: "bg-yellow-50",
  },
  {
    title: "Processing Order",
    value: "0",
    icon: ShoppingCart,
    borderColor: "border-l-blue-500",
    iconColor: "text-blue-500",
    iconBgColor: "bg-blue-50",
  },
  {
    title: "Completed Order",
    value: "0",
    icon: Package2,
    borderColor: "border-l-green-500",
    iconColor: "text-green-500",
    iconBgColor: "bg-green-50",
  },
  {
    title: "Delivered Order",
    value: "0",
    icon: Package2,
    borderColor: "border-l-purple-500",
    iconColor: "text-purple-500",
    iconBgColor: "bg-purple-50",
  },
  {
    title: "Cancelled Order",
    value: "0",
    icon: X,
    borderColor: "border-l-red-500",
    iconColor: "text-red-500",
    iconBgColor: "bg-red-50",
  },
];
