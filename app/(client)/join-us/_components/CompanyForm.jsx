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
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";

import ServicesInput from "./ServicesInput";
import SubmitButton from "./SubmitButton";

const formSchema = z.object({
  companyName: z.string().min(1, { message: "Company name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  logo: z.instanceof(File, { message: "Logo is required" }),
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
          <ServicesInput services={services} setValue={setValue} />
          {errors.services && services.length === 0 && (
            <p className="text-red-500 text-sm">{errors.services.message}</p>
          )}

          {/* Submit Button */}
          <SubmitButton isSubmitting={isSubmitting} />
        </form>
      </CardContent>
    </Card>
  );
}
