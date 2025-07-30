import { sanityFetch } from "../lib/live";
import {
  // Company queries
  COMPANIES_QUERY,
  FEATURED_COMPANIES_QUERY,
  COMPANY_BY_SLUG_QUERY,
  // Legacy queries
  APPROVED_COMPANIES_QUERY,
} from "./query";

// Company queries
const getCompanies = async () => {
  try {
    const { data } = await sanityFetch({ query: COMPANIES_QUERY });
    return data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
};

const getFeaturedCompanies = async () => {
  try {
    const { data } = await sanityFetch({ query: FEATURED_COMPANIES_QUERY });
    return data;
  } catch (error) {
    console.error("Error fetching featured companies:", error);
    return [];
  }
};

const getCompanyBySlug = async (slug) => {
  try {
    const { data } = await sanityFetch({
      query: COMPANY_BY_SLUG_QUERY,
      params: { slug },
    });
    return data;
  } catch (error) {
    console.error(`Error fetching company with slug ${slug}:`, error);
    return null;
  }
};

// Legacy functions for backward compatibility
const getApprovedCompanies = async () => {
  try {
    const { data } = await sanityFetch({ query: APPROVED_COMPANIES_QUERY });
    return data;
  } catch (error) {
    console.error("Error fetching approved companies:", error);
    return [];
  }
};

export {
  // Company queries
  getCompanies,
  getFeaturedCompanies,
  getCompanyBySlug,
  // Legacy exports for backward compatibility
  getApprovedCompanies,
};
