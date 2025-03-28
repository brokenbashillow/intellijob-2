
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignUpForm from "./auth/SignUpForm";

const Hero = () => {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-secondary/20 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <span className="animation-hidden inline-block px-4 py-1.5 bg-secondary text-primary rounded-full text-sm font-medium transition-all duration-700 opacity-0 translate-y-10">
            The Future of Job Search
          </span>
          <h1 className="animation-hidden text-4xl md:text-6xl font-bold text-charcoal transition-all duration-700 delay-150 opacity-0 translate-y-10">
            Find Your Dream Job with
            <span className="text-primary"> AI-Powered</span> Precision
          </h1>
          <p className="animation-hidden max-w-2xl mx-auto text-lg text-gray-600 transition-all duration-700 delay-300 opacity-0 translate-y-10">
            IntelliJob uses advanced AI to match you with the perfect opportunities.
            Smart. Simple. Successful.
          </p>
          <div className="animation-hidden flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 transition-all duration-700 delay-500 opacity-0 translate-y-10">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white transition-all transform hover:scale-105"
              onClick={() => setIsSignUpOpen(true)}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      
      <SignUpForm isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />
    </div>
  );
};

export default Hero;
