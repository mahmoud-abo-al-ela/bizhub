import { defineQuery } from "next-sanity";

// Company queries
const COMPANIES_QUERY =
  defineQuery(`*[_type == "company"] | order(companyName asc) {
  _id,
  companyName,
  slug,
  description,
  services[],
  logo,
  website,
  featured,
  premium,
  planType,
  rating,
  reviewCount
}`);

const FEATURED_COMPANIES_QUERY =
  defineQuery(`*[_type == "company" && featured == true] | order(premium desc, rating desc) [0...6] {
  _id,
  companyName,
  slug,
  description,
  services[],
  logo,
  website,
  featured,
  premium,
  planType,
  rating,
  reviewCount
}`);

const COMPANY_BY_SLUG_QUERY =
  defineQuery(`*[_type == "company" && slug.current == $slug][0] {
  _id,
  companyName,
  slug,
  description,
  services[],
  logo,
  website,
  location,
  socialMedia,
  gallery,
  featured,
  premium,
  planType,
  rating,
  reviewCount,
  "reviews": *[_type == "review" && company._ref == ^._id && isPublished == true] | order(createdAt desc) {
    _id,
    title,
    content,
    rating,
    reviewer,
    reviewerPosition,
    reviewerCompany,
    isVerified,
    createdAt,
    response
  }
}`);

// Legacy queries for backward compatibility
const APPROVED_COMPANIES_QUERY = defineQuery(`*[_type == "company"] {
  _id,
  companyName,
  description,
  services[],
  logo
}`);

export {
  // Company queries
  COMPANIES_QUERY,
  FEATURED_COMPANIES_QUERY,
  COMPANY_BY_SLUG_QUERY,
  // Legacy queries
  APPROVED_COMPANIES_QUERY,
};
