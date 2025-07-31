"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Building2 } from "lucide-react";
import PaymentSuccessSkeleton from "./_components/PaymentSuccessSkeleton";

// Main component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const companyId = searchParams.get("company_id");

  const [paymentInfo, setPaymentInfo] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // If we have a session_id, fetch payment info from the session
        if (sessionId) {
          const sessionResponse = await fetch(
            `/api/payment/session?session_id=${sessionId}`
          );
          if (!sessionResponse.ok) {
            throw new Error("Failed to fetch payment information");
          }
          const sessionData = await sessionResponse.json();
          setPaymentInfo(sessionData);

          // Extract company ID from metadata if available
          const metadataCompanyId = sessionData.metadata?.companyId;
          if (metadataCompanyId) {
            const companyResponse = await fetch(
              `/api/company?id=${metadataCompanyId}`
            );
            if (companyResponse.ok) {
              const companyData = await companyResponse.json();
              setCompanyInfo(companyData);
            }
          }
        }
        // If we have a company_id directly, fetch company info
        else if (companyId) {
          const companyResponse = await fetch(`/api/company?id=${companyId}`);
          if (!companyResponse.ok) {
            throw new Error("Failed to fetch company information");
          }
          const companyData = await companyResponse.json();
          setCompanyInfo(companyData);
        } else {
          throw new Error("No session ID or company ID provided");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [sessionId, companyId]);

  // Extract relevant information
  const planType =
    companyInfo?.planType || paymentInfo?.metadata?.planType || "professional";
  const billingCycle =
    companyInfo?.billingCycle ||
    paymentInfo?.metadata?.billingCycle ||
    "monthly";
  const companyName =
    companyInfo?.companyName ||
    paymentInfo?.metadata?.companyName ||
    "Your company";

  const planLabel =
    planType === "professional"
      ? "Professional"
      : planType === "enterprise"
        ? "Enterprise"
        : "Free Starter";

  const billingLabel = billingCycle === "yearly" ? "Yearly" : "Monthly";
  const amountLabel =
    billingCycle === "yearly"
      ? planType === "professional"
        ? "$290/year"
        : "$990/year"
      : planType === "professional"
        ? "$29/month"
        : "$99/month";

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg">Loading payment information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg text-red-600">Error: {error}</p>
              <Button onClick={() => router.push("/")} className="mt-4">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <Card className="border-green-100 shadow-lg">
        <CardHeader className="text-center border-b border-green-50 pb-6">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="text-green-600 h-6 w-6" />
          </div>
          <CardTitle className="text-2xl text-green-700">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg">
                Thank you for your payment. Your {planLabel} Plan subscription
                is now active!
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-green-800">
                Subscription Details
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Company:</div>
                <div className="font-medium">{companyName}</div>

                <div className="text-gray-600">Plan:</div>
                <div className="font-medium">{planLabel}</div>

                <div className="text-gray-600">Billing:</div>
                <div className="font-medium">{billingLabel}</div>

                <div className="text-gray-600">Amount:</div>
                <div className="font-medium">{amountLabel}</div>

                <div className="text-gray-600">Status:</div>
                <div className="font-medium text-green-600">
                  {companyInfo?.subscriptionStatus ||
                    paymentInfo?.subscription?.status ||
                    "Active"}
                </div>

                <div className="text-gray-600">Subscription ID:</div>
                <div className="font-medium text-xs break-all">
                  {companyInfo?.stripeSubscriptionId ||
                    paymentInfo?.subscription}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <div className="bg-blue-100 rounded-full p-1 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>
                    Your company profile is now active in our directory
                  </span>
                </li>
                <li className="flex gap-2">
                  <div className="bg-blue-100 rounded-full p-1 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>
                    You'll receive a confirmation email with your subscription
                    details
                  </span>
                </li>
                <li className="flex gap-2">
                  <div className="bg-blue-100 rounded-full p-1 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>
                    You can manage your subscription through your account
                    settings
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => router.push("/")}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
              <Button
                onClick={() => router.push("/companies")}
                variant="outline"
                className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
              >
                <Building2 className="mr-2 h-4 w-4" />
                Browse Companies
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrapper component with Suspense
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessSkeleton />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
