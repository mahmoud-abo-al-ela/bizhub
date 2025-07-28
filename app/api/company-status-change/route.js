import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import {
  sendApprovalNotification,
  sendRejectionNotification,
} from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();

    // Log the incoming webhook payload for debugging
    console.log("Received webhook payload:", JSON.stringify(body, null, 2));

    // Handle webhook payload (different structure than manual calls)
    let documentId, newStatus, company;

    if (body._id && body.status) {
      // Webhook payload
      documentId = body._id;
      newStatus = body.status;
      company = body;

      console.log("Processing webhook payload:", {
        documentId,
        newStatus,
        companyName: company.companyName,
        email: company.email,
        previousStatus: body.previousStatus,
      });
    } else {
      // Manual API call payload
      documentId = body.documentId;
      newStatus = body.newStatus;

      console.log("Processing manual API call:", { documentId, newStatus });

      if (!documentId || !newStatus) {
        return NextResponse.json(
          { success: false, message: "Missing required fields" },
          { status: 400 }
        );
      }

      // Fetch the company document for manual calls
      try {
        company = await backendClient.getDocument(documentId);
        console.log(
          "Fetched company document:",
          company
            ? {
                id: company._id,
                name: company.companyName,
                email: company.email,
                status: company.status,
              }
            : "Not found"
        );

        if (!company) {
          return NextResponse.json(
            { success: false, message: "Company submission not found" },
            { status: 404 }
          );
        }
      } catch (fetchError) {
        console.error("Error fetching company document:", fetchError);
        return NextResponse.json(
          { success: false, message: "Failed to fetch company information" },
          { status: 500 }
        );
      }
    }

    // Validate status
    if (!["approved", "rejected"].includes(newStatus)) {
      console.log("Invalid status value:", newStatus);
      return NextResponse.json(
        { success: false, message: "Invalid status value" },
        { status: 400 }
      );
    }

    // For webhook calls, the status is already updated in Sanity
    // For manual calls, update the status
    if (!body._id) {
      try {
        console.log("Updating company status in Sanity:", {
          documentId,
          newStatus,
        });
        await backendClient
          .patch(documentId)
          .set({ status: newStatus })
          .commit();
      } catch (updateError) {
        console.error("Error updating company status:", updateError);
        return NextResponse.json(
          { success: false, message: "Failed to update company status" },
          { status: 500 }
        );
      }
    }

    // Check if email is available in the company object
    if (!company.email) {
      console.error("Missing email address in company data:", company);
      return NextResponse.json({
        success: true,
        status: newStatus,
        emailSent: false,
        message: "Status updated but email not sent: missing email address",
      });
    }

    // Send appropriate email notification
    let emailResult = { success: false };
    try {
      console.log(`Sending ${newStatus} notification for company:`, {
        id: documentId,
        name: company.companyName,
        email: company.email,
      });

      if (newStatus === "approved") {
        emailResult = await sendApprovalNotification(company);
      } else if (newStatus === "rejected") {
        emailResult = await sendRejectionNotification(company);
      }

      console.log(`${newStatus} email result:`, emailResult);
    } catch (emailError) {
      console.error(`Failed to send ${newStatus} notification:`, emailError);
      emailResult = { success: false, error: emailError.message };
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      emailSent: emailResult?.success || false,
    });
  } catch (error) {
    console.error("Status change error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process status change" },
      { status: 500 }
    );
  }
}
