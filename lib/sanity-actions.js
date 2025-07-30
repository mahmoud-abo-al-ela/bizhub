"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import {
  sendApprovalNotification,
  sendRejectionNotification,
} from "@/lib/email";

/**
 * Creates a company document from an approved submission
 * @param {string} submissionId - The ID of the approved submission
 * @returns {Promise<{success: boolean, message?: string, companyId?: string}>}
 */
export async function createCompanyFromSubmission(submissionId) {
  try {
    // Get the submission document
    const submission = await backendClient.getDocument(submissionId);
    if (!submission) {
      return { success: false, message: "Submission not found" };
    }

    // Generate a unique slug for the company
    const baseSlug = slugify(submission.companyName);
    const existingWithSlug = await backendClient.fetch(
      `*[_type == "company" && slug.current == $slug][0]`,
      { slug: baseSlug }
    );

    // If slug exists, append a random string
    const slug = existingWithSlug
      ? `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`
      : baseSlug;

    // Create company document
    const company = await backendClient.create({
      _type: "company",
      companyName: submission.companyName,
      email: submission.email,
      description: submission.description,
      services: submission.services || [],
      planType: submission.planType || "free",
      billingCycle: submission.billingCycle,
      logo: submission.logo,
      featured:
        submission.planType === "professional" ||
        submission.planType === "enterprise",
      premium: submission.planType === "enterprise",
      isActive: true,
      createdAt: new Date().toISOString(),
      slug: {
        _type: "slug",
        current: slug,
      },
      originalSubmission: {
        _type: "reference",
        _ref: submission._id,
      },
      // Copy payment-related fields if they exist
      ...(submission.stripeCustomerId && {
        stripeCustomerId: submission.stripeCustomerId,
      }),
      ...(submission.stripeSubscriptionId && {
        stripeSubscriptionId: submission.stripeSubscriptionId,
      }),
      ...(submission.currentPeriodEnd && {
        currentPeriodEnd: submission.currentPeriodEnd,
      }),
      ...(submission.lastPaymentDate && {
        lastPaymentDate: submission.lastPaymentDate,
      }),
    });

    // Update the submission to mark it as processed
    await backendClient
      .patch(submissionId)
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

/**
 * Updates the status of a company submission
 * @param {string} submissionId - The ID of the submission
 * @param {string} status - The new status (approved, rejected)
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function updateSubmissionStatus(submissionId, status) {
  try {
    // Get the submission document
    const submission = await backendClient.getDocument(submissionId);
    if (!submission) {
      return { success: false, message: "Submission not found" };
    }

    // Update the status
    await backendClient.patch(submissionId).set({ status }).commit();

    // If approved and it's a free plan or a paid plan that's already paid, create company
    if (
      status === "approved" &&
      (submission.planType === "free" ||
        (["professional", "enterprise"].includes(submission.planType) &&
          submission.paymentStatus === "paid"))
    ) {
      // Only create company if not already processed
      if (!submission.processedToCompany) {
        const result = await createCompanyFromSubmission(submissionId);
        if (!result.success) {
          return {
            success: false,
            message: `Status updated but company creation failed: ${result.message}`,
          };
        }
      }
    }

    // Send appropriate notification email
    if (status === "approved") {
      await sendApprovalNotification(submission);
    } else if (status === "rejected") {
      await sendRejectionNotification(submission);
    }

    revalidatePath("/admin/submissions");
    return { success: true, message: `Submission ${status} successfully` };
  } catch (error) {
    console.error(`Error updating submission status:`, error);
    return { success: false, message: error.message };
  }
}

/**
 * Updates the payment status of a company submission
 * @param {string} submissionId - The ID of the submission
 * @param {string} paymentStatus - The new payment status (pending, paid, failed)
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function updatePaymentStatus(submissionId, paymentStatus) {
  try {
    // Get the submission document
    const submission = await backendClient.getDocument(submissionId);
    if (!submission) {
      return { success: false, message: "Submission not found" };
    }

    // Update the payment status
    await backendClient.patch(submissionId).set({ paymentStatus }).commit();

    // If payment is now paid AND submission is approved AND not processed yet, create company
    if (
      paymentStatus === "paid" &&
      submission.status === "approved" &&
      !submission.processedToCompany
    ) {
      const result = await createCompanyFromSubmission(submissionId);
      if (!result.success) {
        return {
          success: true, // Still mark as success since payment status was updated
          message: `Payment status updated but company creation failed: ${result.message}`,
        };
      }
    }

    revalidatePath("/admin/submissions");
    return {
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
    };
  } catch (error) {
    console.error(`Error updating payment status:`, error);
    return { success: false, message: error.message };
  }
}
