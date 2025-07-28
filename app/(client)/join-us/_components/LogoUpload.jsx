"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function LogoUpload({ setValue }) {
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
      setValue("logo", file);

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

  return (
    <div className="space-y-2">
      <Label htmlFor="logo">Company Logo</Label>
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
    </div>
  );
}
