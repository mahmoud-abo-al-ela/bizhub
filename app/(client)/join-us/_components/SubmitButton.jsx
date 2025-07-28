import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function SubmitButton({ isSubmitting }) {
  return (
    <div className="flex justify-end pt-6">
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="bg-blue-500 hover:bg-blue-400 text-white min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Submitting...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Submit Application
          </>
        )}
      </Button>
    </div>
  );
}
