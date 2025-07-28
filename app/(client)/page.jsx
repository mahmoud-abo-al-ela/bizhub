import Navigation from "@/app/(client)/_components/Navigation";
import Hero from "@/app/(client)/_components/Hero";
import Features from "@/app/(client)/_components/Features";
import Footer from "@/app/(client)/_components/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import CompanyCard from "@/app/(client)/_components/CompanyCard";
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

      {/* Companies Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Featured Companies</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover our network of trusted companies and service providers.
          </p>

          {companies.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          )}

          <Link href="/companies">
            <Button className="bg-blue-500 hover:bg-blue-400 cursor-pointer">
              View All Companies <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
