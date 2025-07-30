"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const planInfo = {
  free: {
    title: "What happens next?",
    description:
      "Our team will review your submission within 2-3 business days. Once approved, your company will be featured in our directory and you'll receive a confirmation email.",
    icon: Clock,
    color: "blue",
  },
  professional: {
    title: "Professional Plan Benefits",
    description:
      "Your application will be reviewed within 24 hours. Once approved, your company will receive featured placement in our directory, unlimited service listings, and priority support.",
    icon: Zap,
    color: "blue",
  },
  enterprise: {
    title: "Enterprise Plan Benefits",
    description:
      "Your application will be reviewed within 12 hours. Your company will receive premium placement, unlimited service listings, dedicated account manager, and 24/7 support.",
    icon: CheckCircle,
    color: "indigo",
  },
};

// Skeleton for the info card during loading
function InfoCardSkeleton() {
  return (
    <div className="mt-8 text-center">
      <Card className="bg-blue-50 border-blue-100 animate-pulse">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center mb-3">
            <div className="h-9 w-9 rounded-full bg-blue-200"></div>
          </div>
          <div className="h-6 w-48 bg-blue-200 rounded mx-auto mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-blue-100 rounded"></div>
            <div className="h-4 w-5/6 bg-blue-100 rounded mx-auto"></div>
            <div className="h-4 w-4/6 bg-blue-100 rounded mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Content component that uses useSearchParams
function InfoCardContent() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") || "free";

  // Validate plan parameter
  const validPlans = ["free", "professional", "enterprise"];
  const validPlan = validPlans.includes(planParam) ? planParam : "free";

  const info = planInfo[validPlan] || planInfo.free;
  const InfoIcon = info.icon;

  return (
    <div className="mt-8 text-center">
      <Card className={`bg-${info.color}-100 border-${info.color}-100`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center mb-3">
            <div className={`p-2 rounded-full bg-${info.color}-200`}>
              <InfoIcon className={`h-5 w-5 text-${info.color}-600`} />
            </div>
          </div>
          <h3 className="font-semibold mb-2">{info.title}</h3>
          <p className="text-sm text-muted-foreground">{info.description}</p>

          {validPlan !== "free" && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-sm font-medium text-blue-600">
                {validPlan === "professional"
                  ? "14-day free trial included"
                  : "Custom onboarding included"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main component with Suspense
export default function InfoCard() {
  return (
    <Suspense fallback={<InfoCardSkeleton />}>
      <InfoCardContent />
    </Suspense>
  );
}
