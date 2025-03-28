
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Careers = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8 text-primary">Careers at IntelliJob</h1>
        
        <div className="space-y-6 text-gray-700">
          <p>
            Join our team and help us transform how people find their dream jobs. 
            At IntelliJob, we're looking for passionate individuals who share our 
            vision of making job hunting smarter and more accessible for everyone.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary">Why Work With Us</h2>
          <ul className="list-disc pl-5 space-y-3">
            <li>Work on cutting-edge AI technology that makes a real difference in people's lives</li>
            <li>Flexible work environment with remote options</li>
            <li>Competitive compensation and benefits</li>
            <li>Professional development opportunities</li>
            <li>Collaborative and inclusive company culture</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary">Open Positions</h2>
          
          <div className="space-y-6 mt-4">
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-primary">AI Research Engineer</h3>
              <p className="mt-2">
                We're looking for an experienced AI Research Engineer to help improve 
                our job matching algorithms and develop new AI-powered features.
              </p>
              <Button className="mt-4" variant="outline">
                View Details <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-primary">Frontend Developer</h3>
              <p className="mt-2">
                Join our frontend team to create intuitive and responsive user 
                experiences that make job searching a pleasure.
              </p>
              <Button className="mt-4" variant="outline">
                View Details <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-primary">UX/UI Designer</h3>
              <p className="mt-2">
                Help us design beautiful and intuitive interfaces that simplify 
                the job hunting process for our users.
              </p>
              <Button className="mt-4" variant="outline">
                View Details <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="mb-4">Don't see a position that matches your skills?</p>
            <Button>
              Contact Us
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Careers;
