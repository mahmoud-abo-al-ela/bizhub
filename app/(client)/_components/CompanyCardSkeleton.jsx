"use client";

import { Card } from "@/components/ui/card";

export default function CompanyCardSkeleton() {
  return (
    <Card className="w-full h-[320px] p-6 flex flex-col items-center justify-center bg-white border border-blue-100 rounded-xl shadow-lg">
      {/* Logo skeleton */}
      <div className="relative w-full h-36 mb-6 bg-gray-200 animate-pulse rounded-lg"></div>

      {/* Title skeleton */}
      <div className="w-3/4 h-6 bg-gray-200 animate-pulse rounded-md mb-3"></div>

      {/* Service badges skeleton */}
      <div className="flex flex-wrap justify-center gap-1.5 mt-1">
        <div className="w-16 h-5 bg-gray-200 animate-pulse rounded-full"></div>
        <div className="w-20 h-5 bg-gray-200 animate-pulse rounded-full"></div>
      </div>
    </Card>
  );
}
