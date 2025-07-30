"use client";

import { Suspense } from "react";
import JoinUsHeader from "./_components/JoinUsHeader";
import CompanyForm from "./_components/CompanyForm";
import InfoCard from "./_components/InfoCard";
import FormSkeleton from "./_components/FormSkeleton";

// Main content component that uses useSearchParams
function JoinUsContent() {
  return (
    <>
      <CompanyForm />
      <InfoCard />
    </>
  );
}

// Page component that doesn't use useSearchParams directly
export default function JoinUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-100 to-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <JoinUsHeader />
        <Suspense fallback={<FormSkeleton />}>
          <JoinUsContent />
        </Suspense>
      </div>
    </div>
  );
}
