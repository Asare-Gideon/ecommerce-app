"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, CreditCard, Smartphone, Truck, Wallet } from "lucide-react";

import AnalyticsCard from "@/components/analytics-card";
import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useSettings } from "@/hooks/useSettings";
import { PaymentMethod, useSettingsStore } from "@/store/settingsStore";

const methodIcons: Record<string, typeof CreditCard> = {
  "credit-card": CreditCard,
  "mobile-money": Smartphone,
  "payment-on-delivery": Truck,
};

const methodHints: Record<string, string> = {
  "credit-card": "Customers pay by card through Paystack.",
  "mobile-money": "Customers pay with mobile money through Paystack.",
  "payment-on-delivery": "Customer pays when the order is delivered.",
};

export default function PaymentsPage() {
  const { settings, isLoading } = useSettingsStore();
  const { fetchSettings, updateActivePaymentMethods } = useSettings();
  const [activeCodes, setActiveCodes] = useState<string[]>([]);

  const methods = useMemo(() => settings?.paymentMethods || [], [settings]);
  const activeMethods = methods.filter((method) => activeCodes.includes(method.code));
  const paystackMethods = methods.filter((method) => method.gateway === "paystack");
  const hasChanges =
    methods.length > 0 &&
    methods.some((method) => method.isActive !== activeCodes.includes(method.code));

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    setActiveCodes(methods.filter((method) => method.isActive).map((method) => method.code));
  }, [methods]);

  const toggleMethod = (method: PaymentMethod) => {
    setActiveCodes((current) =>
      current.includes(method.code)
        ? current.filter((code) => code !== method.code)
        : [...current, method.code]
    );
  };

  const handleSave = async () => {
    if (activeCodes.length === 0) return;
    await updateActivePaymentMethods(activeCodes);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-3 md:p-8">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnalyticsCard title="Payment Methods" value={methods.length} trend={{ value: "fixed options", positive: true }} icon={CreditCard} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
          <AnalyticsCard title="Active Methods" value={activeMethods.length} trend={{ value: "shown at checkout", positive: true }} icon={Wallet} iconColor="text-green-600" iconBgColor="bg-green-50" />
          <AnalyticsCard title="Paystack Methods" value={paystackMethods.length} trend={{ value: "card and mobile money", positive: true }} icon={CheckCircle2} iconColor="text-sky-600" iconBgColor="bg-sky-50" />
          <AnalyticsCard title="Manual Method" value={methods.length - paystackMethods.length} trend={{ value: "delivery payment", positive: true }} icon={Truck} iconColor="text-amber-600" iconBgColor="bg-amber-50" />
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="p-0 md:p-6">
            <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between md:p-0 md:pb-6">
              <div className="relative">
                <div className="absolute left-0 top-2 h-6 w-1 bg-emerald-500" />
                <h1 className="pl-6 text-xl font-semibold">Payment Methods</h1>
                <p className="mt-1 pl-6 text-sm text-muted-foreground">
                  Select the fixed methods customers can use during checkout.
                </p>
              </div>
              <Button onClick={handleSave} disabled={isLoading || !hasChanges || activeCodes.length === 0} className="h-11 w-full md:w-auto">
                {isLoading ? <Loader size="small" /> : "Save Selection"}
              </Button>
            </div>

            {activeCodes.length === 0 && (
              <div className="m-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 md:m-0 md:mb-5">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                Select at least one payment method before saving.
              </div>
            )}

            <div className="divide-y">
              {methods.map((method) => {
                const Icon = methodIcons[method.code] || CreditCard;
                const checked = activeCodes.includes(method.code);

                return (
                  <div
                    key={method._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleMethod(method)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") toggleMethod(method);
                    }}
                    className="flex w-full flex-col gap-4 p-5 text-left transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold">{method.name}</h2>
                          <Badge variant={checked ? "default" : "secondary"}>{checked ? "Active" : "Hidden"}</Badge>
                          <Badge variant="outline" className={method.gateway === "paystack" ? "border-sky-200 bg-sky-50 text-sky-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
                            {method.gateway === "paystack" ? "Paystack" : "Manual"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{method.description || methodHints[method.code]}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{methodHints[method.code]}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span className="text-sm font-medium">{checked ? "Selected" : "Not selected"}</span>
                      <Checkbox checked={checked} aria-label={`Use ${method.name}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
