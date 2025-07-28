"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

export default function CompanyCard({ company }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="relative h-[320px] w-full perspective-1000 group cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={handleFlip}
    >
      <div
        className={`relative w-full h-full transition-all duration-500 transform-style-3d shadow-lg hover:shadow-xl rounded-xl ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front of card */}
        <Card
          className={`absolute w-full h-full backface-hidden p-6 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-50 border border-blue-200 rounded-xl ${
            isFlipped ? "opacity-0" : "opacity-100"
          } transition-all duration-300 hover:border-indigo-300 hover:shadow-indigo-100/50`}
        >
          <div className="relative w-full h-36 mb-6 transition-transform duration-300 group-hover:scale-110">
            {company.logo ? (
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                fill
                className="object-contain drop-shadow-md"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-200 to-blue-200 rounded-full shadow-inner">
                <span className="text-2xl font-bold text-indigo-600">
                  {company.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold text-center mb-2 text-indigo-900">
            {company.name}
          </h3>
          {company.services && company.services.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-1">
              {company.services.slice(0, 2).map((service, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-indigo-200 text-indigo-800 border-indigo-300 hover:bg-indigo-300"
                >
                  {service}
                </Badge>
              ))}
              {company.services.length > 2 && (
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-200 text-blue-800 border-blue-300"
                >
                  +{company.services.length - 2}
                </Badge>
              )}
            </div>
          )}
        </Card>

        {/* Back of card */}
        <Card
          className={`absolute w-full h-full backface-hidden p-6 flex flex-col rotate-y-180 bg-gradient-to-br from-indigo-100 to-blue-50 border border-indigo-200 rounded-xl ${
            isFlipped ? "opacity-100" : "opacity-0"
          } shadow-lg`}
        >
          <h3 className="text-xl font-bold mb-3 border-b border-indigo-200 pb-2 text-indigo-800">
            {company.name}
          </h3>
          <p className="text-sm mb-4 flex-grow overflow-y-auto pr-1 max-h-[120px] scrollbar-thin text-indigo-950">
            {company.description}
          </p>

          {company.services && company.services.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 text-indigo-800">
                Services:
              </h4>
              <div className="flex flex-wrap gap-1">
                {company.services.map((service, index) => (
                  <Badge
                    key={index}
                    className="text-xs bg-indigo-200 text-indigo-800 hover:bg-indigo-300 transition-colors"
                  >
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
