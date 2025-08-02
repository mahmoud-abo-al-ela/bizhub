"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CompanyCarousel from "./CompanyCarousel";
import { urlFor } from "@/sanity/lib/image";

export default function FeaturedCompanies({ initialCompanies = [] }) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);

        // If we already have companies from server component, use those
        if (initialCompanies && initialCompanies.length > 0) {
          setCompanies(initialCompanies);
          setIsLoading(false);
          return;
        }

        // Otherwise fetch from API
        const response = await fetch("/api/featured-companies");
        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }

        const data = await response.json();
        const formattedCompanies = data.map((company) => ({
          id: company._id,
          name: company.companyName,
          description: company.description,
          services: company.services,
          logo: company.logo ? urlFor(company.logo).url() : null,
        }));

        setCompanies(formattedCompanies);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [initialCompanies]);

  return (
    <section className="py-16 bg-blue-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Featured Companies</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover our network of trusted companies and service providers.
        </p>

        <div className="mb-10">
          <CompanyCarousel companies={companies} isLoading={isLoading} />
        </div>

        <Link href="/companies">
          <Button className="bg-blue-500 hover:bg-blue-400 cursor-pointer">
            View All Companies <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
