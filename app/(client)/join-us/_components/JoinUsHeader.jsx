"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Star, Zap, Crown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const planIcons = {
  free: Star,
  professional: Zap,
  enterprise: Crown,
};

const planDescriptions = {
  free: "Get your company listed in our directory and connect with potential clients. All submissions are reviewed to ensure quality.",
  professional:
    "Upgrade to our Professional plan for enhanced visibility, unlimited services, and priority support.",
  enterprise:
    "Our Enterprise plan offers premium placement, unlimited services, and dedicated 24/7 support for large organizations.",
};

const planTitles = {
  free: "Join Our Free Directory",
  professional: "Start Your Professional Membership",
  enterprise: "Enterprise Membership Application",
};

// Skeleton for the header during loading
function HeaderSkeleton() {
  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <div className="h-10 w-32 bg-blue-50 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-blue-50 rounded animate-pulse ml-auto"></div>
      </div>

      <div className="text-center mb-12">
        <div className="h-8 w-40 bg-blue-100 rounded-full mx-auto mb-4 animate-pulse"></div>
        <div className="h-10 w-72 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
        <div className="h-6 w-full max-w-md bg-gray-100 rounded mx-auto animate-pulse"></div>
      </div>
    </>
  );
}

// Content component that uses useSearchParams
function HeaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") || "free";

  // Validate plan parameter
  const validPlans = ["free", "professional", "enterprise"];
  const validPlan = validPlans.includes(planParam) ? planParam : "free";

  const PlanIcon = planIcons[validPlan] || Building2;
  const description = planDescriptions[validPlan] || planDescriptions.free;
  const title = planTitles[validPlan] || planTitles.free;

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="hover:bg-blue-100 text-blue-600 hover:text-blue-500 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("/membership")}
          className="hover:bg-blue-100 text-blue-600 hover:text-blue-500 cursor-pointer ml-auto"
        >
          View All Plans
        </Button>
      </div>

      <div className="text-center mb-12">
        <div
          className={`inline-flex items-center gap-2 ${
            validPlan === "professional"
              ? "bg-blue-100 text-blue-600"
              : validPlan === "enterprise"
                ? "bg-indigo-100 text-indigo-600"
                : "bg-blue-100 text-blue-600"
          } px-4 py-2 rounded-full text-sm font-medium mb-4`}
        >
          <PlanIcon className="h-4 w-4" />
          {validPlan === "free"
            ? "Free Starter Plan"
            : validPlan === "professional"
              ? "Professional Plan"
              : "Enterprise Plan"}
        </div>
        <h1 className="text-4xl font-bold mb-4">
          {title.split(" ").slice(0, -1).join(" ")}{" "}
          <span
            className={`bg-gradient-to-r ${
              validPlan === "professional"
                ? "from-blue-500 to-blue-600"
                : validPlan === "enterprise"
                  ? "from-indigo-500 to-indigo-600"
                  : "from-blue-500 to-blue-600"
            } bg-clip-text text-transparent`}
          >
            {title.split(" ").slice(-1)}
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      </div>
    </>
  );
}

// Main component with Suspense
export default function JoinUsHeader() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderContent />
    </Suspense>
  );
}
