"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, X, Crown, Zap, Star } from "lucide-react";
import Image from "next/image";

import ServicesInput from "./ServicesInput";
import SubmitButton from "./SubmitButton";

// Plan configurations
const planConfigs = {
  free: {
    name: "Free Starter",
    maxServices: 3,
    icon: Star,
    color: "blue",
    featured: false,
  },
  professional: {
    name: "Professional",
    maxServices: Infinity,
    icon: Zap,
    color: "blue",
    featured: true,
  },
  enterprise: {
    name: "Enterprise",
    maxServices: Infinity,
    icon: Crown,
    color: "indigo",
    featured: false,
  },
};

export default function CompanyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") || "free";

  // Determine which plan is selected
  const [selectedPlan, setSelectedPlan] = useState(
    planConfigs[planParam] || planConfigs.free
  );

  // Create dynamic form schema based on selected plan
  const getFormSchema = (plan) => {
    return z.object({
      companyName: z.string().min(1, { message: "Company name is required" }),
      email: z.string().email({ message: "Invalid email address" }),
      description: z
        .string()
        .min(10, { message: "Description must be at least 10 characters" }),
      logo: z.instanceof(File, { message: "Logo is required" }),
      services: z
        .array(z.string())
        .min(1, { message: "At least one service is required" })
        .max(plan.maxServices, {
          message: `Free plan allows a maximum of ${plan.maxServices} services`,
        }),
      planType: z.string(),
      billingCycle: z.enum(["monthly", "yearly"]).optional(),
    });
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(getFormSchema(selectedPlan)),
    defaultValues: {
      companyName: "",
      email: "",
      description: "",
      logo: null,
      services: [],
      planType: planParam,
      billingCycle: planParam !== "free" ? "monthly" : undefined,
    },
  });

  // Effect to update form when plan changes
  useEffect(() => {
    setSelectedPlan(planConfigs[planParam] || planConfigs.free);
    setValue("planType", planParam);
    if (planParam === "free") {
      setValue("billingCycle", undefined);
    } else {
      setValue("billingCycle", "monthly");
    }
    // Reset validation with new schema
    reset(undefined, {
      keepValues: true,
      resolver: zodResolver(
        getFormSchema(planConfigs[planParam] || planConfigs.free)
      ),
    });
  }, [planParam, setValue, reset]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const services = watch("services");
  const billingCycle = watch("billingCycle");

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File too large. Please select an image under 5MB");
        return;
      }
      setLogo(file);
      setValue("logo", file, { shouldValidate: true });

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setValue("logo", null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Create FormData object for file upload
      const formData = new FormData();
      formData.append("companyName", data.companyName);
      formData.append("email", data.email);
      formData.append("description", data.description);
      formData.append("services", JSON.stringify(data.services));
      formData.append("planType", data.planType);

      if (data.billingCycle) {
        formData.append("billingCycle", data.billingCycle);
      }

      // Get logo from state since it's managed by the LogoUpload component
      const logo = data.logo;
      if (logo) {
        formData.append("logo", logo);
      }

      // For all plans, just submit the form - payment will happen after approval
      const response = await fetch("/api/submit-company", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Submission failed");
      }

      // Show different messages based on plan type
      if (data.planType === "professional" || data.planType === "enterprise") {
        toast.success(
          "Application submitted successfully! After approval, you'll receive a payment link via email."
        );
      } else {
        toast.success(
          "Application submitted successfully! We'll review it shortly."
        );
      }

      router.push("/");
    } catch (error) {
      toast.error(
        "There was an error submitting your application. Please try again."
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const PlanIcon = selectedPlan.icon;

  return (
    <Card className={`shadow-xl border-${selectedPlan.color}-100`}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-full bg-${selectedPlan.color}-100`}>
            <PlanIcon className={`h-5 w-5 text-${selectedPlan.color}-500`} />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {selectedPlan.name} Plan
          </span>
          {selectedPlan.featured && (
            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
              Featured Listing
            </span>
          )}
        </div>
        <CardTitle className="text-2xl">Company Information</CardTitle>
        <CardDescription>
          Please provide accurate information about your company. Required
          fields are marked with *
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              {...register("companyName")}
              placeholder="Enter your company name"
              className="border-blue-100 focus:border-blue-200"
            />
            {errors.companyName && (
              <p className="text-red-500 text-sm">
                {errors.companyName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="contact@company.com"
                className="border-blue-100 focus:border-blue-200"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Billing Cycle Selection - Only for paid plans */}
            {planParam !== "free" && (
              <div className="space-y-2">
                <Label htmlFor="billingCycle">Billing Cycle *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={billingCycle === "monthly" ? "default" : "outline"}
                    className={`flex-1 cursor-pointer ${
                      billingCycle === "monthly"
                        ? `bg-${planParam === "enterprise" ? "indigo" : "blue"}-500 hover:bg-${planParam === "enterprise" ? "indigo" : "blue"}-400`
                        : `border-${planParam === "enterprise" ? "indigo" : "blue"}-100 hover:border-${planParam === "enterprise" ? "indigo" : "blue"}-200 hover:bg-${planParam === "enterprise" ? "indigo" : "blue"}-100`
                    }`}
                    onClick={() => setValue("billingCycle", "monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    type="button"
                    variant={billingCycle === "yearly" ? "default" : "outline"}
                    className={`flex-1 cursor-pointer ${
                      billingCycle === "yearly"
                        ? `bg-${planParam === "enterprise" ? "indigo" : "blue"}-500 hover:bg-${planParam === "enterprise" ? "indigo" : "blue"}-400`
                        : `border-${planParam === "enterprise" ? "indigo" : "blue"}-100 hover:border-${planParam === "enterprise" ? "indigo" : "blue"}-200 hover:bg-${planParam === "enterprise" ? "indigo" : "blue"}-100`
                    }`}
                    onClick={() => setValue("billingCycle", "yearly")}
                  >
                    Yearly (17% off)
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Company Logo *</Label>
            <div className="border-2 border-dashed border-blue-100 rounded-lg p-6 text-center hover:border-blue-200 transition-colors">
              <input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />

              {logoPreview ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-48 mb-4 mx-auto">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("logo")?.click()}
                      className="border-blue-100 hover:border-blue-200 cursor-pointer text-blue-600 hover:text-blue-500 hover:bg-blue-100 transition-all duration-200"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change Logo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removeLogo}
                      className="border-red-100 hover:border-red-200 cursor-pointer text-red-600 hover:text-red-500 hover:bg-red-100 transition-all duration-200"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("logo")?.click()}
                    className="border-blue-100 hover:border-blue-200 cursor-pointer text-blue-600 hover:text-blue-500 hover:bg-blue-100 transition-all duration-200"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Max file size: 5MB. Supported formats: JPG, PNG, SVG
                  </p>
                </>
              )}
            </div>
            {errors.logo && (
              <p className="text-red-500 text-sm">{errors.logo.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Company Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your company, what you do, and what makes you unique..."
              className="min-h-[120px] border-blue-100 focus:border-blue-200"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Services */}
          <ServicesInput
            services={services}
            setValue={setValue}
            maxServices={selectedPlan.maxServices}
            planName={selectedPlan.name}
          />
          {errors.services && (
            <p className="text-red-500 text-sm">{errors.services.message}</p>
          )}

          {/* Payment Information - Only for paid plans */}
          {planParam === "professional" && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-600 mb-2 flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Professional Plan Information
              </h3>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground mb-2">
                  After your application is approved, you'll receive a payment
                  link via email.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {billingCycle === "monthly" ? "$29/month" : "$290/year"}
                  </div>
                  {billingCycle === "yearly" && (
                    <span className="text-green-600 text-xs">
                      Save $58/year
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Enterprise Contact - Only for enterprise plan */}
          {planParam === "enterprise" && (
            <div className="bg-indigo-50 p-4 rounded-md">
              <h3 className="font-medium text-indigo-600 mb-2 flex items-center">
                <Crown className="h-4 w-4 mr-2" />
                Enterprise Plan Information
              </h3>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  After your application is approved, you'll receive a payment
                  link via email.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <div className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
                    {billingCycle === "monthly" ? "$99/month" : "$990/year"}
                  </div>
                  {billingCycle === "yearly" && (
                    <span className="text-green-600 text-xs">
                      Save $198/year
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <SubmitButton isSubmitting={isSubmitting} planType={planParam} />
        </form>
      </CardContent>
    </Card>
  );
}
