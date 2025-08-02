import Navigation from "@/app/(client)/_components/Navigation";
import Hero from "@/app/(client)/_components/Hero";
import Features from "@/app/(client)/_components/Features";
import Footer from "@/app/(client)/_components/Footer";
import FeaturedCompanies from "@/app/(client)/_components/FeaturedCompanies";
import { urlFor } from "@/sanity/lib/image";
import { getFeaturedCompanies } from "@/sanity/queries";

export default async function Home() {
  const sanityCompanies = await getFeaturedCompanies();

  const companies = sanityCompanies.map((company) => ({
    id: company._id,
    name: company.companyName,
    description: company.description,
    services: company.services,
    logo: company.logo ? urlFor(company.logo).url() : null,
  }));

  return (
    <div>
      <Navigation />
      <Hero />
      <Features />
      <FeaturedCompanies initialCompanies={companies} />
      <Footer />
    </div>
  );
}
