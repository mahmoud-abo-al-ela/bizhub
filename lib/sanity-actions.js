"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

export async function createCompanyFromSubmission(applicationId) {
  try {
    // Get the submission document
    const application = await backendClient.getDocument(applicationId);
    if (!application) {
      console.error(`Submission not found: ${applicationId}`);
      return { success: false, message: "Submission not found" };
    }

    console.log(
      `Found submission: ${application.companyName} (${application.planType})`
    );

    // Generate a unique slug for the company
    const baseSlug = slugify(application.companyName);
    const existingWithSlug = await backendClient.fetch(
      `*[_type == "company" && slug.current == $slug][0]`,
      { slug: baseSlug }
    );

    // If slug exists, append a random string
    const slug = existingWithSlug
      ? `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`
      : baseSlug;

    console.log(`Creating company document for: ${application.companyName}`);

    // Create company document
    const company = await backendClient.create({
      _type: "company",
      companyName: application.companyName,
      email: application.email,
      description: application.description,
      services: application.services || [],
      planType: application.planType || "free",
      billingCycle: application.billingCycle,
      logo: application.logo,
      featured:
        application.planType === "professional" ||
        application.planType === "enterprise",
      premium: application.planType === "enterprise",
      isActive: true,
      createdAt: new Date().toISOString(),
      slug: {
        _type: "slug",
        current: slug,
      },
      originalApplication: {
        _type: "reference",
        _ref: application._id,
      },
      // Set payment status based on plan type
      paymentStatus: application.planType === "free" ? "na" : "pending",
      // Copy payment-related fields if they exist
      ...(application.stripeCustomerId && {
        stripeCustomerId: application.stripeCustomerId,
      }),
      ...(application.stripeSubscriptionId && {
        stripeSubscriptionId: application.stripeSubscriptionId,
      }),
      ...(application.subscriptionStatus && {
        subscriptionStatus: application.subscriptionStatus,
      }),
      ...(application.currentPeriodEnd && {
        currentPeriodEnd: application.currentPeriodEnd,
      }),
      ...(application.lastPaymentDate && {
        lastPaymentDate: application.lastPaymentDate,
      }),
    });

    console.log(`Company created successfully: ${company._id}`);

    // Update the submission to mark it as processed
    await backendClient
      .patch(applicationId)
      .set({
        processedToCompany: true,
        companyReference: {
          _type: "reference",
          _ref: company._id,
        },
      })
      .commit();

    revalidatePath("/companies");
    revalidatePath("/");

    return {
      success: true,
      companyId: company._id,
      message: "Company created successfully",
    };
  } catch (error) {
    console.error("Error creating company:", error);
    return { success: false, message: error.message };
  }
}

export async function updateApplicationStatus(applicationId, status) {
  try {
    // Get the submission document
    const application = await backendClient.getDocument(applicationId);
    if (!application) {
      return { success: false, message: "Submission not found" };
    }

    // Update the status and set email flags
    await backendClient
      .patch(applicationId)
      .set({
        status,
        approvalEmailSent: status === "approved" ? true : undefined,
        rejectionEmailSent: status === "rejected" ? true : undefined,
      })
      .commit();

    // If approved, handle based on plan type
    if (status === "approved") {
      // For free plans, create company immediately
      if (application.planType === "free" && !application.processedToCompany) {
        console.log(
          `Approved free application ${application.companyName} - creating company immediately`
        );
        const result = await createCompanyFromSubmission(applicationId);
        if (!result.success) {
          return {
            success: false,
            message: `Status updated but company creation failed: ${result.message}`,
          };
        }
        console.log(
          `Company created successfully for ${application.companyName}`
        );
      }
      // For paid plans, don't create company yet - wait for payment
      else if (
        ["professional", "enterprise"].includes(application.planType) &&
        !application.processedToCompany
      ) {
        console.log(
          `Approved paid application ${application.companyName} - waiting for payment completion`
        );
        // Don't create company yet - it will be created when payment is completed
      }
    }

    revalidatePath("/admin/submissions");
    return { success: true, message: `Submission ${status} successfully` };
  } catch (error) {
    console.error(`Error updating submission status:`, error);
    return { success: false, message: error.message };
  }
}

export async function findApplicationByStripeCustomerId(customerId) {
  try {
    if (!customerId) return null;

    const query = `*[_type == "applications" && stripeCustomerId == $customerId][0]`;
    return await backendClient.fetch(query, { customerId });
  } catch (error) {
    console.error(`Error finding application by Stripe customer ID:`, error);
    return null;
  }
}

export async function findCompanyByApplicationId(applicationId) {
  try {
    if (!applicationId) return null;

    const query = `*[_type == "company" && originalApplication._ref == $applicationId][0]`;
    return await backendClient.fetch(query, { applicationId });
  } catch (error) {
    console.error(`Error finding company by application ID:`, error);
    return null;
  }
}

export async function updatePaymentStatus(applicationId, paymentStatus) {
  try {
    // Get the submission document
    const application = await backendClient.getDocument(applicationId);
    if (!application) {
      return { success: false, message: "Application not found" };
    }

    // Update the payment status
    await backendClient.patch(applicationId).set({ paymentStatus }).commit();

    // If payment is now paid and application is approved, create company
    if (
      paymentStatus === "paid" &&
      application.status === "approved" &&
      !application.processedToCompany
    ) {
      console.log(
        `Payment completed for approved application ${application.companyName} - creating company`
      );

      const result = await createCompanyFromSubmission(applicationId);
      if (!result.success) {
        return {
          success: false,
          message: `Payment status updated but company creation failed: ${result.message}`,
        };
      }

      console.log(
        `Company created successfully for ${application.companyName} after payment completion`
      );
    }
    // If payment is now paid and company already exists, update the company document
    else if (
      paymentStatus === "paid" &&
      application.status === "approved" &&
      application.processedToCompany
    ) {
      // Find the company document that was created from this submission
      const company = await findCompanyByApplicationId(applicationId);

      if (company) {
        // Update the company's payment status and copy subscription details
        const updateData = {
          paymentStatus: "paid",
          lastPaymentDate: new Date().toISOString(),
        };

        await backendClient.patch(company._id).set(updateData).commit();

        console.log(
          `Updated company ${company.companyName} payment status to paid with subscription details`
        );
      }
    }

    revalidatePath("/admin/applications");
    return {
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
    };
  } catch (error) {
    console.error(`Error updating payment status:`, error);
    return { success: false, message: error.message };
  }
}
