"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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

import LogoUpload from "./LogoUpload";
import ServicesInput from "./ServicesInput";
import SubmitButton from "./SubmitButton";

const formSchema = z.object({
  companyName: z.string().min(1, { message: "Company name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  logo: z.instanceof(File).optional(),
  services: z
    .array(z.string())
    .min(1, { message: "At least one service is required" }),
});

export default function CompanyForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      email: "",
      description: "",
      logo: null,
      services: [],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const services = watch("services");

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Create FormData object for file upload
      const formData = new FormData();
      formData.append("companyName", data.companyName);
      formData.append("email", data.email);
      formData.append("description", data.description);
      formData.append("services", JSON.stringify(data.services));

      // Get logo from state since it's managed by the LogoUpload component
      const logo = data.logo;
      if (logo) {
        formData.append("logo", logo);
      }

      // Send to API
      const response = await fetch("/api/submit-company", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Submission failed");
      }

      toast.success(
        "Application submitted successfully! We'll review it shortly."
      );
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

  return (
    <Card className="shadow-xl border-blue-100">
      <CardHeader>
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
              required
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
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Logo Upload */}
          <LogoUpload setValue={setValue} />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Company Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your company, what you do, and what makes you unique..."
              className="min-h-[120px] border-blue-100 focus:border-blue-200"
              required
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Services */}
          <ServicesInput services={services} setValue={setValue} />
          {errors.services && (
            <p className="text-red-500 text-sm">{errors.services.message}</p>
          )}

          {/* Submit Button */}
          <SubmitButton isSubmitting={isSubmitting} />
        </form>
      </CardContent>
    </Card>
  );
}
