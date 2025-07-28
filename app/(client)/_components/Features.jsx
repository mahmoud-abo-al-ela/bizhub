import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Shield,
  Users,
  Zap,
  TrendingUp,
  Award,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Verified Companies",
      description:
        "All businesses are thoroughly vetted and verified before being listed on our platform.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Users,
      title: "Trusted Network",
      description:
        "Connect with a curated network of professional service providers across industries.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Zap,
      title: "Quick Matching",
      description:
        "Find the perfect service provider for your needs in seconds with our smart search.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: TrendingUp,
      title: "Quality Reviews",
      description:
        "Make informed decisions with authentic reviews and ratings from real customers.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Award,
      title: "Industry Leaders",
      description:
        "Access top-rated companies that are leaders in their respective fields.",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: CheckCircle,
      title: "Guaranteed Results",
      description:
        "Every partnership is backed by our quality guarantee and customer support.",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Award className="h-4 w-4" />
            Why Choose BizHub
          </div>
          <h2 className="text-4xl font-bold mb-4">
            The{" "}
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Smart Way
            </span>{" "}
            to Find Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We've built the most comprehensive and trusted platform for
            connecting businesses with clients. Here's what makes us different.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group transition-all duration-300 border-gray-100 hover:border-blue-300"
            >
              <CardContent className="p-4 text-center space-y-4">
                <div className="relative mx-auto w-16 h-16">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl transform rotate-6 opacity-20 group-hover:rotate-12 transition-transform duration-300`}
                  />
                  <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-card-foreground group-hover:text-blue-500 transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
