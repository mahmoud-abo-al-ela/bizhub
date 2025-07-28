import JoinUsHeader from "./_components/JoinUsHeader";
import CompanyForm from "./_components/CompanyForm";
import InfoCard from "./_components/InfoCard";

const JoinUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-100 to-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <JoinUsHeader />
        <CompanyForm />
        <InfoCard />
      </div>
    </div>
  );
};

export default JoinUs;
