import { urlFor } from "@/sanity/lib/image";
import Navigation from "@/app/(client)/_components/Navigation";
import CompanyGrid from "@/app/(client)/_components/CompanyGrid";
import Footer from "@/app/(client)/_components/Footer";
import { getApprovedCompanies } from "@/sanity/queries";
import CompaniesClient from "./CompaniesClient";

export default async function CompaniesPage() {
  const sanityCompanies = await getApprovedCompanies();

  const companies = sanityCompanies.map((company) => ({
    id: company._id,
    name: company.companyName,
    description: company.description,
    services: company.services,
    logo: company.logo ? urlFor(company.logo).url() : null,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      <Navigation />
      <CompaniesClient companies={companies} />
      <Footer />
    </div>
  );
}
