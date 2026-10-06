"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { BASE_URL } from "@/utils/constants";

type VerifyState = "loading" | "success" | "failed";

export default function PaystackCallbackPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const { token } = useAuthStore();
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("Verifying Paystack payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setState("failed");
        setMessage("No Paystack payment reference was found.");
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/order/paystack/verify/${encodeURIComponent(reference)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Payment verification failed.");
        }

        if (data.order?.paymentStatus === "paid") {
          setState("success");
          setMessage("Payment verified and order marked as paid.");
          return;
        }

        setState("failed");
        setMessage("Payment was not successful. The order remains unpaid.");
      } catch (error: any) {
        setState("failed");
        setMessage(error.message || "Payment verification failed.");
      }
    };

    verifyPayment();
  }, [reference, token]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-3 md:p-8">
      <Card className="mx-auto mt-20 max-w-xl border-0 shadow-md">
        <CardContent className="flex flex-col items-center p-8 text-center">
          {state === "loading" && <Loader2 className="mb-5 h-12 w-12 animate-spin text-primary" />}
          {state === "success" && <CheckCircle2 className="mb-5 h-12 w-12 text-emerald-600" />}
          {state === "failed" && <XCircle className="mb-5 h-12 w-12 text-red-600" />}

          <h1 className="text-2xl font-semibold">
            {state === "loading" ? "Verifying Payment" : state === "success" ? "Payment Successful" : "Payment Failed"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{message}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/order/list">
              <Button>View Orders</Button>
            </Link>
            <Link href="/products/list">
              <Button variant="outline">Back to Products</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
