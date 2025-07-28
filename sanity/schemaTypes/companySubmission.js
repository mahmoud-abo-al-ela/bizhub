export default {
  name: "companySubmission",
  title: "Company Submissions",
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
    },
  ],
  preview: {
    select: {
      title: "companyName",
      subtitle: "status",
      media: "logo",
    },
  },
};
