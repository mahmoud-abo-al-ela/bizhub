"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Building2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

const Footer = () => {
  const router = useRouter();

  return (
    <footer className="bg-gradient-to-b from-background to-blue-100 border-t border-blue-100">
      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white border-0 shadow-2xl">
            <CardContent className="p-12 text-center space-y-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold">
                Ready to Grow Your Business?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Join our network of verified service providers and connect with
                clients who need your expertise.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button
                  size="lg"
                  onClick={() => router.push("/join-us")}
                  className="bg-white text-blue-500 hover:bg-white/90 font-semibold shadow-lg cursor-pointer"
                >
                  List Your Business
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Button
                  size="lg"
                  className="bg-white text-blue-500 hover:bg-white/90 cursor-pointer"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">BizHub</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The trusted platform connecting businesses with verified service
              providers across all industries.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="font-semibold text-card-foreground">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button className="hover:text-blue-500 transition-colors">
                  Browse Companies
                </button>
              </li>
              <li>
                <button className="hover:text-blue-500 transition-colors">
                  Search Services
                </button>
              </li>
              <li>
                <button className="hover:text-blue-500 transition-colors">
                  Categories
                </button>
              </li>
              <li>
                <button className="hover:text-blue-500 transition-colors">
                  Reviews
                </button>
              </li>
            </ul>
          </div>

          {/* For Businesses */}
          <div className="space-y-4">
            <h3 className="font-semibold text-card-foreground">
              For Businesses
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button
                  onClick={() => router.push("/join-us")}
                  className="hover:text-blue-500 transition-colors"
                >
                  List Your Business
                </button>
              </li>
              <li>
                <button className="hover:text-blue-500 transition-colors">
                  Pricing
                </button>
              </li>
              <li>
                <button className="hover:text-blue-500 transition-colors">
                  Success Stories
                </button>
              </li>
              <li>
                <button className="hover:text-blue-500 transition-colors">
                  Resources
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-card-foreground">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button className="hover:text-blue-500 transition-colors">
                  Help Center
                </button>
              </li>
              <li>
                <button className="hover:text-blue-500 transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button className="hover:text-blue-500 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="hover:text-blue-500 transition-colors">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-blue-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 BizHub. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button className="hover:text-blue-500 transition-colors">
              Privacy
            </button>
            <button className="hover:text-blue-500 transition-colors">
              Terms
            </button>
            <button className="hover:text-blue-500 transition-colors">
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
