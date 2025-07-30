"use client";

import { Button } from "@/components/ui/button";
import { Building2, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const navItems = [
    { label: "Home", path: "/" },
    { label: "Companies", path: "/companies" },
    { label: "Membership", path: "/membership" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-sky-300 to-sky-400 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">BizHub</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => {
                  router.push(item.path);
                }}
                className={`hover:text-blue-500 cursor-pointer hover:bg-blue-50 ${
                  pathname === item.path
                    ? "text-blue-500"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button
              onClick={() => router.push("/membership")}
              className="bg-blue-500 hover:bg-blue-400 cursor-pointer"
            >
              List Your Business
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => {
                    router.push(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start cursor-pointer"
                >
                  {item.label}
                </Button>
              ))}
              <Button
                onClick={() => {
                  router.push("/membership");
                  setIsMobileMenuOpen(false);
                }}
                className="bg-blue-500 hover:bg-blue-400 mt-2 cursor-pointer"
              >
                List Your Business
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
