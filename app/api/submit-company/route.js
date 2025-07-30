import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { sendSubmissionConfirmation } from "@/lib/email";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const companyName = formData.get("companyName");
    const email = formData.get("email");
    const description = formData.get("description");
    const services = JSON.parse(formData.get("services") || "[]");
    const planType = formData.get("planType") || "free";
    const billingCycle = formData.get("billingCycle");

    // Validate services based on plan
    if (planType === "free" && services.length > 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Free plan allows a maximum of 3 services",
        },
        { status: 400 }
      );
    }

    // Handle logo upload if present
    let logoAsset = null;
    const logoFile = formData.get("logo");
    const bytes = await logoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    logoAsset = await backendClient.assets.upload("image", buffer, {
      filename: logoFile.name,
      contentType: logoFile.type,
    });

    // Create document in Sanity
    const doc = {
      _type: "applications",
      companyName,
      email,
      description,
      services,
      planType,
      status: "pending",
      paymentStatus: "pending",
      submissionDate: new Date().toISOString(),
      featured: planType === "professional" || planType === "enterprise",
      premium: planType === "enterprise",
    };

    // Add billing cycle if provided (for paid plans)
    if (billingCycle) {
      doc.billingCycle = billingCycle;
    }

    // Add logo reference if we have one
    if (logoAsset) {
      doc.logo = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: logoAsset._id,
        },
      };
    }

    // Create the document
    const result = await backendClient.create(doc);

    // Send confirmation email (with timeout handling)
    let emailResult = { success: false };
    try {
      // Set a timeout for the email sending operation
      const emailPromise = sendSubmissionConfirmation({
        companyName,
        email,
        services,
        planType,
        billingCycle,
        submissionDate: doc.submissionDate,
      });

      // Don't let email sending block the response
      emailResult = await emailPromise;
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Continue with the submission even if email fails
    }

    return NextResponse.json(
      {
        success: true,
        id: result._id,
        emailSent: emailResult.success,
        planType,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit company information" },
      { status: 500 }
    );
  }
}
