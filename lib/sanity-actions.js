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
      // Set payment status based on plan type
      paymentStatus: submission.planType === "free" ? "na" : "pending",
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

    // If approved, handle based on plan type
    if (status === "approved") {
      // For free plans, create company immediately
      if (submission.planType === "free" && !submission.processedToCompany) {
        const result = await createCompanyFromSubmission(submissionId);
        if (!result.success) {
          return {
            success: false,
            message: `Status updated but company creation failed: ${result.message}`,
          };
        }
      }
      // For paid plans, don't create company yet - wait for payment
      else if (
        ["professional", "enterprise"].includes(submission.planType) &&
        !submission.processedToCompany
      ) {
        console.log(
          `Approved paid application ${submission.companyName} - waiting for payment completion`
        );
        // Don't create company yet - it will be created when payment is completed
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

    // If payment is now paid and application is approved, create company
    if (
      paymentStatus === "paid" &&
      submission.status === "approved" &&
      !submission.processedToCompany
    ) {
      console.log(
        `Payment completed for approved application ${submission.companyName} - creating company`
      );

      const result = await createCompanyFromSubmission(submissionId);
      if (!result.success) {
        return {
          success: false,
          message: `Payment status updated but company creation failed: ${result.message}`,
        };
      }

      console.log(
        `Company created successfully for ${submission.companyName} after payment completion`
      );
    }
    // If payment is now paid and company already exists, update the company document
    else if (
      paymentStatus === "paid" &&
      submission.status === "approved" &&
      submission.processedToCompany
    ) {
      // Find the company document that was created from this submission
      const company = await backendClient.fetch(
        `*[_type == "company" && originalSubmission._ref == $submissionId][0]`,
        { submissionId }
      );

      if (company) {
        // Update the company's payment status
        await backendClient
          .patch(company._id)
          .set({
            paymentStatus: "paid",
            subscriptionStatus: "active",
            lastPaymentDate: new Date().toISOString(),
          })
          .commit();

        console.log(
          `Updated company ${company.companyName} payment status to paid`
        );
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
