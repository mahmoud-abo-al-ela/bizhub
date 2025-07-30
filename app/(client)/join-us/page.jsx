"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import JoinUsHeader from "./_components/JoinUsHeader";
import CompanyForm from "./_components/CompanyForm";
import InfoCard from "./_components/InfoCard";
import FormSkeleton from "./_components/FormSkeleton";

const JoinUs = () => {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "free";

  // Validate plan parameter
  const validPlans = ["free", "professional", "enterprise"];
  const validPlan = validPlans.includes(plan) ? plan : "free";

  const planTitles = {
    free: "Join Our Free Directory",
    professional: "Start Your Professional Membership",
    enterprise: "Enterprise Membership Application",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-100 to-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <JoinUsHeader title={planTitles[validPlan]} plan={validPlan} />
        <Suspense fallback={<FormSkeleton />}>
          <CompanyForm />
          <InfoCard plan={validPlan} />
        </Suspense>
      </div>
    </div>
  );
};

export default JoinUs;
