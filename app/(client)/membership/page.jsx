"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Zap, Crown, Check } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState } from "react";

const page = () => {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const plans = [
    {
      name: "Free Starter",
      description: "Perfect for small businesses getting started",
      price: { monthly: 0, yearly: 0 },
      icon: <Star className="h-6 w-6" />,
      features: [
        "Basic company listing",
        "Up to 3 services",
        "Standard support",
      ],
      cta: "Get Started Free",
      popular: false,
      route: "/join-us",
    },
    {
      name: "Professional",
      description: "For growing businesses that need more visibility",
      price: { monthly: 29, yearly: 290 },
      icon: <Zap className="h-6 w-6" />,
      features: [
        "Featured company listing",
        "Unlimited services",
        "Priority support",
        "Basic analytics",
      ],
      cta: "Start Pro Trial",
      popular: true,
      route: "/join-us?plan=professional",
    },
    {
      name: "Enterprise",
      description: "For large organizations with custom needs",
      price: { monthly: 99, yearly: 990 },
      icon: <Crown className="h-6 w-6" />,
      features: [
        "Premium placement",
        "Unlimited everything",
        "24/7 dedicated support",
        "Advanced analytics",
      ],
      cta: "Contact Sales",
      popular: false,
      route: "/join-us?plan=enterprise",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-background py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="hover:bg-blue-50 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-500 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Crown className="h-4 w-4" />
            Membership Plans
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Select the membership tier that best fits your business needs. All
            plans include our core directory features with varying levels of
            visibility and support.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-gray-200 p-1 rounded-lg">
            <Button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white text-foreground shadow-sm hover:bg-gray-100"
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-100 bg-transparent"
              }`}
            >
              Monthly
            </Button>
            <Button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                billingCycle === "yearly"
                  ? "bg-white text-foreground shadow-sm hover:bg-gray-100"
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-100 bg-transparent"
              }`}
            >
              Yearly
              <Badge
                variant="secondary"
                className="ml-2 bg-green-100 text-green-700 text-xs"
              >
                Save 17%
              </Badge>
            </Button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-blue-500 shadow-lg scale-105"
                  : "border-blue-500/20 hover:border-blue-500/40"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-primary-foreground px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div
                  className={`mx-auto p-3 rounded-full mb-4 ${
                    plan.popular
                      ? "bg-blue-500 text-primary-foreground"
                      : "bg-blue-500/10 text-primary"
                  }`}
                >
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>

                <div className="mt-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">
                      ${plan.price[billingCycle]}
                    </span>
                    {plan.price[billingCycle] > 0 && (
                      <span className="text-muted-foreground">
                        /{billingCycle === "monthly" ? "mo" : "yr"}
                      </span>
                    )}
                  </div>
                  {billingCycle === "yearly" && plan.price.yearly > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ${(plan.price.yearly / 12).toFixed(0)}/month billed
                      annually
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <Button
                  onClick={() => router.push(plan.route)}
                  variant={plan.popular ? "default" : "outline"}
                  className={`w-full mb-6 cursor-pointer ${
                    plan.popular
                      ? "bg-blue-500 hover:bg-blue-400"
                      : "border-blue-500/30 hover:border-blue-500/50 hover:bg-gray-100"
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="bg-blue-50 border-blue-500/20">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold text-center mb-6">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">
                  Can I upgrade or downgrade anytime?
                </h4>
                <p className="text-muted-foreground">
                  Yes, you can change your plan at any time. Changes take effect
                  immediately, and billing is prorated.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Is there a setup fee?</h4>
                <p className="text-muted-foreground">
                  No setup fees for any plan. You only pay the monthly or yearly
                  subscription cost.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">
                  What payment methods do you accept?
                </h4>
                <p className="text-muted-foreground">
                  We accept all major credit cards, PayPal, and bank transfers
                  for Enterprise plans.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Is there a free trial?</h4>
                <p className="text-muted-foreground">
                  Professional and Enterprise plans include a 14-day free trial.
                  No credit card required.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;
