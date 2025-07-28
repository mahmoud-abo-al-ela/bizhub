"use client";

import CompanyCard from "./CompanyCard";
import { motion } from "framer-motion";

export default function CompanyGrid({ companies }) {
  if (!companies || companies.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-medium text-gray-600">
          No companies found
        </h3>
        <p className="text-gray-500 mt-2">
          Check back later or adjust your filters
        </p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {companies.map((company, index) => (
        <motion.div
          key={company.id || index}
          className="transform transition-transform hover:scale-[1.02] duration-300"
          variants={item}
          whileHover={{
            scale: 1.03,
            transition: { duration: 0.2 },
          }}
        >
          <CompanyCard company={company} />
        </motion.div>
      ))}
    </motion.div>
  );
}
