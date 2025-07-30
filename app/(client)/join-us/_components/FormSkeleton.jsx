import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function FormSkeleton() {
  return (
    <>
      {/* Form Skeleton */}
      <Card className="shadow-xl border-blue-100 animate-pulse mb-8">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-7 w-64 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-full bg-gray-100 rounded"></div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Company Name Field */}
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-100 rounded"></div>
          </div>

          {/* Email & Billing Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-10 w-full bg-gray-100 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-gray-200 rounded"></div>
              <div className="h-10 w-full bg-gray-100 rounded"></div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-40 w-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
              <div className="h-8 w-32 bg-gray-100 rounded"></div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-40 bg-gray-200 rounded"></div>
            <div className="h-24 w-full bg-gray-100 rounded"></div>
          </div>

          {/* Services */}
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-100 rounded"></div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 w-24 bg-blue-100 rounded-full"
                ></div>
              ))}
            </div>
          </div>

          {/* Plan Info Box */}
          <div className="h-24 w-full bg-blue-50 rounded"></div>

          {/* Submit Button */}
          <div className="h-12 w-full bg-blue-200 rounded-md"></div>
        </CardContent>
      </Card>
    </>
  );
}
