"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-background to-sky-200 overflow-hidden">
      {/* Background decoration */}

      <div className="container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
            <Building2 className="h-4 w-4" />
            Trusted Business Directory
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
            Discover{" "}
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Trusted <br />
            </span>
            Service Providers
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl">
            Our platform helps users find verified companies offering various
            services across different industries. Connect with reliable
            businesses that meet your specific needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-blue-500 hover:bg-blue-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => router.push("/join-us")}
            >
              List Your Business
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-blue-500 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
            >
              Browse Companies
            </Button>
          </div>

          <div className="flex items-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">500+</div>
              <div className="text-sm text-muted-foreground">
                Verified Companies
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">50+</div>
              <div className="text-sm text-muted-foreground">
                Service Categories
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">10k+</div>
              <div className="text-sm text-muted-foreground">
                Happy Connections
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-300 to-sky-400 rounded-3xl transform rotate-6 opacity-20" />
          <Image
            src="/hero-business-BBt9_ESz.jpg"
            alt="Business Network Illustration"
            width={600}
            height={400}
            className="relative rounded-3xl shadow-2xl w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
