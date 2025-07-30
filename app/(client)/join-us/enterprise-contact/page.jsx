"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Home, Crown } from "lucide-react";
import Link from "next/link";

export default function EnterpriseContact() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customer");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-indigo-100 to-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="shadow-xl border-indigo-100">
          <CardHeader className="text-center border-b border-indigo-100 pb-6">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-indigo-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-indigo-600">
              Thank You for Your Interest!
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-8 space-y-6">
            <div className="text-center">
              <p className="text-xl mb-2">
                Your Enterprise Application Has Been Received
              </p>
              <p className="text-muted-foreground">
                Our dedicated enterprise team will contact you within 24 hours
                to discuss your custom requirements.
              </p>
            </div>

            <div className="bg-indigo-50 p-6 rounded-lg">
              <h3 className="font-medium text-lg mb-4">What happens next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="bg-indigo-100 rounded-full p-1 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span>Our enterprise team will review your application</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-indigo-100 rounded-full p-1 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span>
                    You'll receive a call or email within 24 hours to discuss
                    your needs
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-indigo-100 rounded-full p-1 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span>
                    We'll create a custom plan tailored to your business
                    requirements
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-indigo-100 rounded-full p-1 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span>
                    Upon approval, your company will receive premium placement
                    in our directory
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="flex-1 border-indigo-100 hover:border-indigo-200 cursor-pointer"
              >
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Button>
              <Button
                onClick={() => router.push("/companies")}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
              >
                Browse Companies
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground pt-4">
              <p>
                If you need immediate assistance, please contact our enterprise
                team at{" "}
                <Link
                  href="mailto:enterprise@bizhub.com"
                  className="text-indigo-500 hover:underline"
                >
                  enterprise@bizhub.com
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
