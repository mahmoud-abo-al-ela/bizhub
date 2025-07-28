import CompanyGrid from "@/app/(client)/_components/CompanyGrid";
export default function CompaniesClient({ companies }) {
  return (
    <div className="container mx-auto px-4 pt-12 pb-8 flex-grow">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          Our{" "}
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            Business Directory
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Discover our network of trusted business partners and service
          providers.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <CompanyGrid companies={companies} />
      </div>
    </div>
  );
}
