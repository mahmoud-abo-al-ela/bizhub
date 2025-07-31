export default {
  name: "applications",
  title: "Applications",
  type: "document",
  fields: [
    {
      name: "companyName",
      title: "Company Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "email",
      title: "Contact Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    },
    {
      name: "description",
      title: "Company Description",
      type: "text",
      validation: (Rule) => Rule.required().min(10),
    },
    {
      name: "logo",
      title: "Company Logo",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "services",
      title: "Services Offered",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.required().min(1),
    },
    {
      name: "planType",
      title: "Plan Type",
      type: "string",
      options: {
        list: [
          { title: "Free Starter", value: "free" },
          { title: "Professional", value: "professional" },
          { title: "Enterprise", value: "enterprise" },
        ],
      },
      initialValue: "free",
      readOnly: true, // Cannot be edited once submitted
    },
    {
      name: "billingCycle",
      title: "Billing Cycle",
      type: "string",
      options: {
        list: [
          { title: "Monthly", value: "monthly" },
          { title: "Yearly", value: "yearly" },
        ],
      },
      readOnly: true, // Cannot be edited once submitted
      hidden: ({ document }) => document?.planType === "free", // Hide for free plan
    },
    {
      name: "featured",
      title: "Featured Listing",
      type: "boolean",
      description: "Display this company in featured sections",
      initialValue: false,
      hidden: ({ document }) => document?.planType === "free", // Hide for free plan
    },
    {
      name: "premium",
      title: "Premium Placement",
      type: "boolean",
      description: "Give this company premium placement (Enterprise plan)",
      initialValue: false,
      hidden: ({ document }) => document?.planType !== "enterprise", // Only show for enterprise plan
    },
    // Payment-related fields - only visible for paid plans
    {
      name: "paymentStatus",
      title: "Payment Status",
      type: "string",
      options: {
        list: [
          { title: "Not Applicable", value: "na" },
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Failed", value: "failed" },
        ],
      },
      initialValue: "na",
      hidden: ({ document }) => document?.planType === "free", // Hide for free plan
      readOnly: true, // Cannot be edited once submitted
    },
    {
      name: "stripeCustomerId",
      title: "Stripe Customer ID",
      type: "string",
      hidden: ({ document }) => document?.planType === "free", // Hide for free plan
      readOnly: true, // Cannot be edited once submitted
    },
    {
      name: "stripeSubscriptionId",
      title: "Stripe Subscription ID",
      type: "string",
      hidden: ({ document }) => document?.planType === "free", // Hide for free plan
      readOnly: true, // Cannot be edited once submitted
    },
    {
      name: "subscriptionStatus",
      title: "Subscription Status",
      type: "string",
      options: {
        list: [
          { title: "Not Applicable", value: "na" },
          { title: "Active", value: "active" },
          { title: "Past Due", value: "past_due" },
          { title: "Canceled", value: "canceled" },
          { title: "Unpaid", value: "unpaid" },
          { title: "Incomplete", value: "incomplete" },
        ],
      },
      initialValue: "na",
      hidden: ({ document }) => document?.planType === "free", // Hide for free plan
    },
    {
      name: "currentPeriodEnd",
      title: "Current Period End",
      type: "datetime",
      hidden: ({ document }) => document?.planType === "free", // Hide for free plan
      readOnly: true, // Cannot be edited once submitted
    },
    {
      name: "lastPaymentDate",
      title: "Last Payment Date",
      type: "datetime",
      hidden: ({ document }) => document?.planType === "free", // Hide for free plan
      readOnly: true, // Cannot be edited once submitted
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      initialValue: "pending",
    },
    {
      name: "submissionDate",
      title: "Submission Date",
      type: "datetime",
      initialValue: new Date().toISOString(),
      readOnly: true, // Cannot be edited
    },
    {
      name: "approvalDate",
      title: "Approval Date",
      type: "datetime",
      readOnly: true, // Auto-generated, cannot be edited
    },
    {
      name: "processedToCompany",
      title: "Processed to Company",
      type: "boolean",
      description: "Whether this application has been processed into a company",
      initialValue: false,
      readOnly: true, // Auto-managed by the system
    },
    {
      name: "companyReference",
      title: "Company Reference",
      type: "reference",
      to: [{ type: "company" }],
      description: "Reference to the company created from this application",
      readOnly: true, // Auto-managed by the system
    },
    {
      name: "approvalEmailSent",
      title: "Approval Email Sent",
      type: "boolean",
      description: "Whether approval notification email has been sent",
      initialValue: false,
      readOnly: true, // Auto-managed by the system
    },
    {
      name: "rejectionEmailSent",
      title: "Rejection Email Sent",
      type: "boolean",
      description: "Whether rejection notification email has been sent",
      initialValue: false,
      readOnly: true, // Auto-managed by the system
    },
  ],
  preview: {
    select: {
      title: "companyName",
      subtitle: "status",
      media: "logo",
      plan: "planType",
      payment: "paymentStatus",
    },
    prepare(selection) {
      const { title, subtitle, media, plan, payment } = selection;
      const planLabels = {
        free: "Free",
        professional: "Pro",
        enterprise: "Enterprise",
      };

      return {
        title,
        subtitle: `${planLabels[plan] || "Free"} | Status: ${subtitle} ${
          plan !== "free"
            ? `| Payment: ${payment === "paid" ? "✅" : "❌"}`
            : ""
        }`,
        media,
      };
    },
  },
  // Define custom document actions
  __experimental_actions: ["create", "update", "publish", "delete"],
};
