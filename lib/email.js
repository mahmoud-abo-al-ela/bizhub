import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmailWithTimeout(emailOptions) {
  try {
    console.log("Attempting to send email to:", emailOptions.to);
    console.log("Email subject:", emailOptions.subject);
    const { data, error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error("Email sending error:", error);
      return { success: false, error };
    }

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: error.message || error };
  }
}

export async function sendSubmissionConfirmation(company) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured. Email sending disabled.");
    return { success: false, error: "Email sending not configured" };
  }

  return sendEmailWithTimeout({
    from: `BizHub <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
    to: company.email,
    subject: "Application Received - BizHub",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for your submission!</h2>
        <p>Dear ${company.companyName},</p>
        <p>We have received your application to join our platform. Our team will review your submission and get back to you shortly.</p>
        <p>Here's a summary of your submission:</p>
        <ul>
          <li><strong>Company Name:</strong> ${company.companyName}</li>
          <li><strong>Email:</strong> ${company.email}</li>
          <li><strong>Services:</strong> ${company.services.join(", ")}</li>
          <li><strong>Submission Date:</strong> ${new Date(company.submissionDate).toLocaleDateString()}</li>
        </ul>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>BizHub Team</p>
      </div>
    `,
  });
}

export async function sendApprovalNotification(company) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured. Email sending disabled.");
    return { success: false, error: "Email sending not configured" };
  }

  return sendEmailWithTimeout({
    from: `BizHub <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
    to: company.email,
    subject: "Congratulations! Your Application has been Approved - BizHub",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">🎉 Congratulations!</h2>
        <p>Dear ${company.companyName},</p>
        <p>Great news! Your application to join BizHub has been <strong>approved</strong>.</p>
        <p>Your company is now featured in our directory and visible to potential customers.</p>
        <p>Here's what you can expect:</p>
        <ul>
          <li>Your company profile is now live on our platform</li>
          <li>Customers can discover your services: ${company.services?.join(", ") || "N/A"}</li>
          <li>You'll start receiving inquiries from interested clients</li>
        </ul>
        <p>Thank you for joining our platform!</p>
        <p>Best regards,<br>BizHub Team</p>
      </div>
    `,
  });
}

export async function sendRejectionNotification(company) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured. Email sending disabled.");
    return { success: false, error: "Email sending not configured" };
  }

  return sendEmailWithTimeout({
    from: `BizHub <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
    to: company.email,
    subject: "Application Update - BizHub",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Application Update</h2>
        <p>Dear ${company.companyName},</p>
        <p>Thank you for your interest in joining BizHub. After careful review, we are unable to approve your application at this time.</p>
        <p>This decision was based on our current platform requirements and guidelines.</p>
        <p>You're welcome to resubmit your application in the future if your company profile changes.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>BizHub Team</p>
      </div>
    `,
  });
}
