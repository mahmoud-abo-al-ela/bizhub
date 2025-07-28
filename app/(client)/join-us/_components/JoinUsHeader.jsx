"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function JoinUsHeader() {
  const router = useRouter();

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
      </div>

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Building2 className="h-4 w-4" />
          Company Registration
        </div>
        <h1 className="text-4xl font-bold mb-4">
          Join Our{" "}
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            Business Directory
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get your company listed in our directory and connect with potential
          clients. All submissions are reviewed to ensure quality.
        </p>
      </div>
    </>
  );
}
