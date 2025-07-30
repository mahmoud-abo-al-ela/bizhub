import { NextResponse } from "next/server";
import {
  sendApprovalNotification,
  sendRejectionNotification,
} from "@/lib/email";
import { backendClient } from "@/sanity/lib/backendClient";
import { updateSubmissionStatus } from "@/lib/sanity-actions";

export async function POST(req) {
  try {
    const body = await req.json();

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
  } catch (error) {
    console.error("Error changing company status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to change status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
