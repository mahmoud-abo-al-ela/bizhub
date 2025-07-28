import { sanityFetch } from "../lib/live";
import { APPROVED_COMPANIES_QUERY, FEATURED_COMPANIES_QUERY } from "./query";

const getApprovedCompanies = async () => {
  try {
    const { data } = await sanityFetch({ query: APPROVED_COMPANIES_QUERY });
    return data;
  } catch (error) {
    console.error("Error fetching approved companies:", error);
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

export { getApprovedCompanies, getFeaturedCompanies };
