"use server";

import { Resend } from "resend";
import { createPaymentLink } from "@/actions/createPaymentLink";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || "noreply@example.com";

/**
 * Sends a confirmation email when a company submits an application
 * @param {Object} company - The submitted company data
 */
export async function sendSubmissionConfirmation(company) {
  try {
    const planName =
      company.planType === "professional"
        ? "Professional"
        : company.planType === "enterprise"
          ? "Enterprise"
          : "Free Starter";

    const reviewTime =
      company.planType === "professional"
        ? "24 hours"
        : company.planType === "enterprise"
          ? "12 hours"
          : "2-3 business days";

    await resend.emails.send({
      from: fromEmail,
      to: company.email,
      subject: `Application Received - ${planName} Plan`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5; text-align: center; margin-top: 30px;">Application Received</h1>
          
          <p>Dear ${company.companyName},</p>
          
          <p>Thank you for submitting your application for our <strong>${planName} Plan</strong>. Our team will review your submission within <strong>${reviewTime}</strong>.</p>
          
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Application Details:</h3>
            <p><strong>Company:</strong> ${company.companyName}</p>
            <p><strong>Email:</strong> ${company.email}</p>
            <p><strong>Plan:</strong> ${planName}</p>
            ${company.billingCycle ? `<p><strong>Billing Cycle:</strong> ${company.billingCycle === "yearly" ? "Yearly" : "Monthly"}</p>` : ""}
            <p><strong>Services:</strong> ${Array.isArray(company.services) ? company.services.join(", ") : company.services}</p>
            <p><strong>Submission Date:</strong> ${new Date(company.submissionDate || Date.now()).toLocaleDateString()}</p>
          </div>
          
          <p>What happens next?</p>
          <ul>
            <li>Our team will review your application</li>
            <li>You'll receive an email with the approval decision</li>
            ${company.planType !== "free" ? `<li>If approved, you'll receive a payment link to activate your ${planName} Plan</li>` : ""}
            <li>Once ${company.planType !== "free" ? "approved and payment is complete" : "approved"}, your company will be listed in our directory</li>
          </ul>
          
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          
          <p>Thank you for choosing our platform!</p>
          
          <p>Best regards,<br>The Business Directory Team</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending submission confirmation email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sends an approval notification email
 * @param {Object} company - The approved company data
 */
export async function sendApprovalNotification(company) {
  try {
    let paymentLinkHtml = "";
    let subject = "";

    // For paid plans, generate a payment link and include it in the email
    if (
      (company.planType === "professional" ||
        company.planType === "enterprise") &&
      company.paymentStatus !== "paid"
    ) {
      try {
        // Create payment link
        const { url } = await createPaymentLink(company);

        if (url) {
          paymentLinkHtml = `
            <div style="margin: 20px 0; text-align: center;">
              <p style="margin-bottom: 15px; font-weight: bold;">Complete your registration by making a payment:</p>
              <a href="${url}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Complete Payment
              </a>
            </div>
            <p>Your company profile will be live after your payment is processed.</p>
          `;

          subject = `Your ${company.planType === "professional" ? "Professional" : "Enterprise"} Plan Application is Approved!`;
        }
      } catch (error) {
        console.error("Error creating payment link:", error);
      }
    } else {
      // For free plans or already paid plans
      subject = "Your Company Application is Approved!";
    }

    const planName =
      company.planType === "professional"
        ? "Professional"
        : company.planType === "enterprise"
          ? "Enterprise"
          : "Free Starter";

    await resend.emails.send({
      from: fromEmail,
      to: company.email,
      subject: subject || `Your ${planName} Plan Application is Approved!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5; text-align: center; margin-top: 30px;">Application Approved!</h1>
          
          <p>Dear ${company.companyName},</p>
          
          <p>We're pleased to inform you that your application for the <strong>${planName} Plan</strong> has been approved!</p>
          
          ${
            paymentLinkHtml ||
            `
            <p>Your company profile is now live on our platform. Visitors can now find your business in our directory.</p>
          `
          }
          
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Application Details:</h3>
            <p><strong>Company:</strong> ${company.companyName}</p>
            <p><strong>Plan:</strong> ${planName}</p>
            ${company.billingCycle ? `<p><strong>Billing Cycle:</strong> ${company.billingCycle === "yearly" ? "Yearly" : "Monthly"}</p>` : ""}
            <p><strong>Submission Date:</strong> ${new Date(company.submissionDate || Date.now()).toLocaleDateString()}</p>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Thank you for choosing our platform!</p>
          
          <p>Best regards,<br>The Business Directory Team</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending approval email:", error);
    return { success: false, error: error.message };
  }
}

export async function sendRejectionNotification(company) {
  try {
    const planName =
      company.planType === "professional"
        ? "Professional"
        : company.planType === "enterprise"
          ? "Enterprise"
          : "Free Starter";

    await resend.emails.send({
      from: fromEmail,
      to: company.email,
      subject: `Your ${planName} Plan Application Needs Attention`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #DC2626; text-align: center; margin-top: 30px;">Application Update</h1>
          
          <p>Dear ${company.companyName},</p>
          
          <p>Thank you for your application for the <strong>${planName} Plan</strong>.</p>
          
          <p>After reviewing your submission, we've determined that some additional information or adjustments are needed before we can approve your listing.</p>
          
          <p>Our team will be reaching out to you shortly with specific details about what needs to be addressed.</p>
          
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Application Details:</h3>
            <p><strong>Company:</strong> ${company.companyName}</p>
            <p><strong>Plan:</strong> ${planName}</p>
            ${company.billingCycle ? `<p><strong>Billing Cycle:</strong> ${company.billingCycle === "yearly" ? "Yearly" : "Monthly"}</p>` : ""}
            <p><strong>Submission Date:</strong> ${new Date(company.submissionDate || Date.now()).toLocaleDateString()}</p>
          </div>
          
          <p>If you have any questions or would like to provide additional information, please reply to this email.</p>
          
          <p>Thank you for your understanding!</p>
          
          <p>Best regards,<br>The Business Directory Team</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending rejection email:", error);
    return { success: false, error: error.message };
  }
}

export async function sendPaymentConfirmation(company) {
  try {
    const planName =
      company.planType === "professional"
        ? "Professional"
        : company.planType === "enterprise"
          ? "Enterprise"
          : "Free Starter";

    const billingText =
      company.billingCycle === "yearly" ? "yearly billing" : "monthly billing";

    await resend.emails.send({
      from: fromEmail,
      to: company.email,
      subject: `Payment Confirmed - Your ${planName} Plan is Now Active!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10B981; text-align: center; margin-top: 30px;">Payment Successful!</h1>
          
          <p>Dear ${company.companyName},</p>
          
          <p>Thank you for your payment! Your <strong>${planName} Plan</strong> with ${billingText} is now active.</p>
          
          <p>Your company profile is now live on our platform. Visitors can find your business in our directory.</p>
          
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Subscription Details:</h3>
            <p><strong>Company:</strong> ${company.companyName}</p>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Billing Cycle:</strong> ${company.billingCycle === "yearly" ? "Yearly" : "Monthly"}</p>
            <p><strong>Status:</strong> Active</p>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Thank you for choosing our platform!</p>
          
          <p>Best regards,<br>The Business Directory Team</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
    return { success: false, error: error.message };
  }
}
