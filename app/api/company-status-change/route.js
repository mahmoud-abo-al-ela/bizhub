import { NextResponse } from "next/server";
import {
  sendApprovalNotification,
  sendRejectionNotification,
} from "@/lib/email";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

const secret = process.env.SANITY_WEBHOOK_SECRET;

export async function POST(req) {
  console.log("Webhook received at", new Date().toISOString());

  // Log environment variables (remove in production)
  console.log("RESEND_API_KEY:", !!process.env.RESEND_API_KEY);
  console.log("SANITY_WEBHOOK_SECRET:", !!process.env.SANITY_WEBHOOK_SECRET);

  // Read headers and body
  const signature = req.headers.get(SIGNATURE_HEADER_NAME);
  const bodyText = await req.text();
  console.log("Signature:", signature);
  console.log("Body text:", bodyText);

  // Verify signature
  if (!secret) {
    console.error("SANITY_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { success: false, message: "Server configuration error" },
      { status: 500 }
    );
  }

  if (!(await isValidSignature(bodyText, signature, secret))) {
    console.error("Signature verification failed");
    return NextResponse.json(
      { success: false, message: "Invalid signature" },
      { status: 401 }
    );
  }

  // Parse JSON
  let body;
  try {
    body = JSON.parse(bodyText);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return NextResponse.json(
      { success: false, message: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const { email, companyName, services, status, previousStatus } = body;
  const company = {
    email,
    companyName,
    services: Array.isArray(services) ? services : [],
  };

  console.log("Webhook payload:", body);
  console.log("Company:", company);
  console.log("Status change:", { previousStatus, status });

  // Validate company data
  if (!email || !companyName) {
    console.error("Missing required fields:", { email, companyName });
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  // Handle status changes
  try {
    if (status === "approved" && previousStatus !== "approved") {
      console.log("Sending approval notification to:", email);
      const result = await sendApprovalNotification(company);
      if (!result.success) {
        console.error("Approval email failed:", result.error);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to send approval email",
            error: result.error,
          },
          { status: 500 }
        );
      }
    } else if (status === "rejected" && previousStatus !== "rejected") {
      console.log("Sending rejection notification to:", email);
      const result = await sendRejectionNotification(company);
      if (!result.success) {
        console.error("Rejection email failed:", result.error);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to send rejection email",
            error: result.error,
          },
          { status: 500 }
        );
      }
    } else {
      console.log("No email sent: Status unchanged or invalid");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }

  console.log("Webhook processed successfully");
  return NextResponse.json({
    success: true,
    message: "Status changed and email sent (if applicable)",
  });
}
