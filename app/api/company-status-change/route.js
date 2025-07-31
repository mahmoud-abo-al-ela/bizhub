import { NextResponse } from "next/server";
import {
  sendApprovalNotification,
  sendRejectionNotification,
} from "@/lib/email";
import { backendClient } from "@/sanity/lib/backendClient";
import { updateSubmissionStatus } from "@/lib/sanity-actions";

export async function GET() {
  // Handle webhook verification from Sanity
  return NextResponse.json({
    success: true,
    message: "Webhook endpoint is active",
  });
}

export async function POST(req) {
  try {
    const body = await req.json();

    // Log the incoming webhook payload for debugging
    console.log("Received webhook payload:", JSON.stringify(body, null, 2));

    // Handle Sanity webhook payload
    // Sanity webhook sends different payload structure
    if (body.ids || body._type === "applications") {
      // This is a Sanity webhook payload
      console.log("Processing as Sanity webhook");

      // Extract document ID based on the operation type
      let documentId = null;

      if (body.ids) {
        documentId =
          body.ids.created?.[0] ||
          body.ids.updated?.[0] ||
          body.ids.deleted?.[0];
      } else if (body.documentId) {
        documentId = body.documentId;
      } else if (body._id) {
        documentId = body._id;
      }

      console.log("Extracted document ID:", documentId);

      if (!documentId) {
        console.error("No document ID found in webhook payload");
        return NextResponse.json(
          {
            success: false,
            message: "No document ID found in webhook payload",
          },
          { status: 400 }
        );
      }

      // For delete operations, we can't fetch the document
      if (
        body.operation === "delete" ||
        body.ids?.deleted?.includes(documentId)
      ) {
        console.log("Document deletion detected, no further action needed");
        return NextResponse.json({
          success: true,
          message: "Document deletion acknowledged",
        });
      }

      // Fetch the complete application data from Sanity
      console.log("Fetching document from Sanity:", documentId);
      const applicationData = await backendClient.getDocument(documentId);

      if (!applicationData) {
        console.error("Application document not found:", documentId);
        return NextResponse.json(
          {
            success: false,
            message: "Application document not found",
          },
          { status: 404 }
        );
      }

      console.log(
        "Retrieved application data:",
        JSON.stringify(applicationData, null, 2)
      );

      // Extract relevant fields
      const {
        _id: companyId,
        email,
        companyName,
        services,
        status,
        planType,
        billingCycle,
        submissionDate,
      } = applicationData;

      // Only process if status is approved or rejected
      if (status !== "approved" && status !== "rejected") {
        console.log(
          `Status '${status}' not actionable (not approved/rejected)`
        );
        return NextResponse.json({
          success: true,
          message: "Status not changed (not approved/rejected)",
        });
      }

      console.log(
        `Status changed to ${status} for ${companyName} (${planType || "free"} plan) via webhook`
      );

      // Handle status change - this will create company for free plans automatically
      const statusResult = await updateSubmissionStatus(documentId, status);

      if (!statusResult.success) {
        console.error(
          "Failed to update submission status:",
          statusResult.message
        );
        return NextResponse.json(
          {
            success: false,
            message: statusResult.message,
          },
          { status: 400 }
        );
      }

      // Send appropriate notification
      if (status === "approved") {
        console.log("Sending approval notification");
        await sendApprovalNotification(applicationData);
      } else if (status === "rejected") {
        console.log("Sending rejection notification");
        await sendRejectionNotification(applicationData);
      }

      return NextResponse.json({
        success: true,
        message: "Webhook processed, status updated, and notification sent",
        companyId: statusResult.companyId,
        companyCreated: !!statusResult.companyId,
      });
    }
    // Handle manual API calls with the original format
    else {
      console.log("Processing as manual API call");
      const {
        companyId,
        email,
        companyName,
        services,
        status,
        previousStatus,
        planType,
        billingCycle,
        submissionDate,
      } = body;

      // Fetch complete company data if we have an ID
      let company = {
        _id: companyId,
        email,
        companyName,
        services,
        planType,
        billingCycle,
        submissionDate,
      };

      // If we have a company ID, get the full data from Sanity
      if (companyId) {
        const companyData = await backendClient.getDocument(companyId);
        if (companyData) {
          company = companyData;
        }
      }

      console.log(
        `Status changed from ${previousStatus} to ${status} for ${companyName} (${planType || "free"} plan)`
      );

      // Handle status change - this will create company for free plans automatically
      const statusResult = await updateSubmissionStatus(companyId, status);

      if (!statusResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: statusResult.message,
          },
          { status: 400 }
        );
      }

      // Send appropriate notification
      if (status === "approved") {
        await sendApprovalNotification(company);
      } else if (status === "rejected") {
        await sendRejectionNotification(company);
      }

      return NextResponse.json({
        success: true,
        message: "Status changed and email sent",
        companyId: statusResult.companyId,
        companyCreated: !!statusResult.companyId,
      });
    }
  } catch (error) {
    console.error("Error processing company status change:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process status change",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
