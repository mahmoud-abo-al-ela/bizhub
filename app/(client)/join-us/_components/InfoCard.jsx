import { Card, CardContent } from "@/components/ui/card";

export default function InfoCard() {
  return (
    <div className="mt-8 text-center">
      <Card className="bg-blue-100 border-blue-100">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <p className="text-sm text-muted-foreground">
            Our team will review your submission within 2-3 business days. Once
            approved, your company will be featured in our directory and you'll
            receive a confirmation email.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
