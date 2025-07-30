import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PaymentSuccessSkeleton() {
  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-md border border-gray-100 animate-pulse">
        <div className="p-6 border-b border-gray-100 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 mb-4"></div>
          <div className="h-7 w-48 bg-gray-200 rounded mb-2"></div>
        </div>

        <div className="p-6 space-y-6">
          {/* Success message */}
          <div className="flex justify-center">
            <div className="h-5 w-64 bg-gray-200 rounded"></div>
          </div>

          {/* Subscription details box */}
          <div className="bg-green-50 rounded-lg p-4 space-y-3">
            <div className="h-5 w-48 bg-green-100 rounded mb-3"></div>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 w-full bg-green-100 rounded"></div>
              ))}
            </div>
          </div>

          {/* What's next box */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-4">
            <div className="h-5 w-32 bg-blue-100 rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-blue-100"></div>
                  <div className="h-4 w-full bg-blue-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="h-10 w-full bg-green-100 rounded"></div>
            <div className="h-10 w-full bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
