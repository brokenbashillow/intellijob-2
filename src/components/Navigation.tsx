import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignInForm from "./auth/SignInForm";
import SignUpForm from "./auth/SignUpForm";

const Navigation = () => {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold text-primary">IntelliJob</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-charcoal hover:text-primary transition-colors"
              onClick={() => setIsSignInOpen(true)}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
            <Button
              variant="outline"
              className="text-primary border-primary hover:bg-primary hover:text-white transition-all"
              onClick={() => setIsSignUpOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Sign Up
            </Button>
          </div>
        </div>
      </div>

      <SignInForm isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
      <SignUpForm isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />
    </nav>
  );
};

export default Navigation;