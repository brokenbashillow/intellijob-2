
import { Brain, Target, Clock } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Our advanced AI algorithms ensure perfect job matches based on your skills and preferences.",
  },
  {
    icon: Target,
    title: "Precision Search",
    description: "Find exactly what you're looking for with our intelligent search and filtering system.",
  },
  {
    icon: Clock,
    title: "Real-Time Updates",
    description: "Get instant notifications about new opportunities that match your profile.",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animation-hidden text-center mb-16 transition-all duration-700 opacity-0 translate-y-10">
          <h2 className="text-3xl font-bold text-charcoal mb-4">
            Why Choose IntelliJob?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the most advanced job search platform powered by cutting-edge technology.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="animation-hidden p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-700 opacity-0 translate-y-10"
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
