export default {
  name: "company",
  title: "Companies",
  type: "document",
  fields: [
    {
      name: "companyName",
      title: "Company Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "companyName",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "email",
      title: "Contact Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    },
    {
      name: "phone",
      title: "Phone Number",
      type: "string",
    },
    {
      name: "website",
      title: "Website",
      type: "url",
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
      name: "location",
      title: "Location",
      type: "object",
      fields: [
        {
          name: "address",
          title: "Address",
          type: "string",
        },
        {
          name: "city",
          title: "City",
          type: "string",
        },
        {
          name: "state",
          title: "State/Province",
          type: "string",
        },
        {
          name: "country",
          title: "Country",
          type: "string",
        },
        {
          name: "postalCode",
          title: "Postal Code",
          type: "string",
        },
        {
          name: "coordinates",
          title: "Coordinates",
          type: "geopoint",
        },
      ],
    },
    {
      name: "socialMedia",
      title: "Social Media",
      type: "object",
      fields: [
        {
          name: "linkedin",
          title: "LinkedIn",
          type: "url",
        },
        {
          name: "twitter",
          title: "Twitter",
          type: "url",
        },
        {
          name: "facebook",
          title: "Facebook",
          type: "url",
        },
        {
          name: "instagram",
          title: "Instagram",
          type: "url",
        },
      ],
    },
    {
      name: "gallery",
      title: "Image Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      hidden: ({ document }) => document?.planType === "free", // Hide for free plan
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
      readOnly: true, // Cannot be changed directly - requires plan upgrade
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
      hidden: ({ document }) => document?.planType === "free", // Hide for free plan
    },
    {
      name: "featured",
      title: "Featured Listing",
      type: "boolean",
      description: "Display this company in featured sections",
      initialValue: false,
      readOnly: ({ document }) => document?.planType === "free", // Free plans cannot be featured
      hidden: ({ document }) => document?.planType === "free", // Hide for free plan
    },
    {
      name: "premium",
      title: "Premium Placement",
      type: "boolean",
      description: "Give this company premium placement (Enterprise plan)",
      initialValue: false,
      readOnly: ({ document }) => document?.planType !== "enterprise", // Only enterprise can be premium
      hidden: ({ document }) => document?.planType !== "enterprise", // Only show for enterprise plan
    },
    {
      name: "rating",
      title: "Average Rating",
      type: "number",
      validation: (Rule) => Rule.min(0).max(5),
      readOnly: true, // Auto-calculated from reviews
    },
    {
      name: "reviewCount",
      title: "Review Count",
      type: "number",
      initialValue: 0,
      readOnly: true, // Auto-calculated from reviews
    },
    // Payment-related fields
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
    },
    {
      name: "stripeCustomerId",
      title: "Stripe Customer ID",
      type: "string",
      hidden: ({ document }) => document?.planType === "free", // Hide for free plan
    },
    {
      name: "stripeSubscriptionId",
      title: "Stripe Subscription ID",
      type: "string",
      hidden: ({ document }) => document?.planType === "free", // Hide for free plan
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
    },
    {
      name: "lastPaymentDate",
      title: "Last Payment Date",
      type: "datetime",
      hidden: ({ document }) => document?.planType === "free", // Hide for free plan
    },
    {
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: new Date().toISOString(),
      readOnly: true, // Cannot be edited
    },
    {
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
      initialValue: new Date().toISOString(),
    },
    {
      name: "originalSubmission",
      title: "Original Submission",
      type: "reference",
      to: [{ type: "applications" }],
      weak: true,
      readOnly: true, // Cannot be edited
    },
    {
      name: "isActive",
      title: "Active Listing",
      type: "boolean",
      description: "Whether this company is active in the directory",
      initialValue: true,
    },
    {
      name: "adminNotes",
      title: "Admin Notes",
      type: "text",
      description: "Internal notes for administrators",
    },
  ],
  preview: {
    select: {
      title: "companyName",
      subtitle: "planType",
      media: "logo",
      featured: "featured",
      payment: "paymentStatus",
      isActive: "isActive",
    },
    prepare(selection) {
      const { title, subtitle, media, featured, payment, isActive } = selection;
      const planLabels = {
        free: "Free",
        professional: "Pro",
        enterprise: "Enterprise",
      };

      const statusIndicator = !isActive ? "🔒 " : featured ? "⭐ " : "";

      return {
        title,
        subtitle: `${statusIndicator}${planLabels[subtitle] || "Free"} ${payment === "paid" ? "✅" : ""}`,
        media,
      };
    },
  },
};
