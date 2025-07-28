import { defineQuery } from "next-sanity";

const COMPANY_SUBMISSION_TYPE = "companySubmission";
const APPROVED_STATUS = "approved";
const LIMIT = 3;

const APPROVED_COMPANIES_QUERY =
  defineQuery(`*[_type == "${COMPANY_SUBMISSION_TYPE}" && status == "${APPROVED_STATUS}"] {
  _id,
  companyName,
  description,
  services,
  logo
}`);

const FEATURED_COMPANIES_QUERY =
  defineQuery(`*[_type == "${COMPANY_SUBMISSION_TYPE}" && status == "${APPROVED_STATUS}"] | order(submissionDate desc)[0...${LIMIT}] {
  _id,
  companyName,
  description,
  services,
  logo
}`);

export { APPROVED_COMPANIES_QUERY, FEATURED_COMPANIES_QUERY };
