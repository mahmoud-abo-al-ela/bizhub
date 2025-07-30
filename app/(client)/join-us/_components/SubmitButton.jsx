import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Zap, Crown } from "lucide-react";

const planButtonText = {
  free: "Submit Free Application",
  professional: "Start Professional Trial",
  enterprise: "Submit Enterprise Application",
};

const planIcons = {
  free: Star,
  professional: Zap,
  enterprise: Crown,
};

export default function SubmitButton({ isSubmitting, planType = "free" }) {
  const buttonText = planButtonText[planType] || "Submit Application";
  const PlanIcon = planIcons[planType] || CheckCircle;

  return (
    <div className="flex justify-end pt-6">
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className={`${
          planType === "professional"
            ? "bg-blue-500 hover:bg-blue-400"
            : planType === "enterprise"
              ? "bg-indigo-600 hover:bg-indigo-500"
              : "bg-blue-500 hover:bg-blue-400"
        } text-white min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Submitting...
          </>
        ) : (
          <>
            <PlanIcon className="h-4 w-4 mr-2" />
            {buttonText}
          </>
        )}
      </Button>
    </div>
  );
}
