
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8 text-primary">About IntelliJob</h1>
        
        <div className="space-y-6 text-gray-700">
          <p>
            IntelliJob was founded with a simple yet powerful mission: to transform 
            the job hunting experience by harnessing the potential of artificial intelligence. 
            We believe that finding the right job shouldn't be a matter of luck or 
            endless hours of searching through irrelevant listings.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary">Our Mission</h2>
          <p>
            Our mission is to connect talented individuals with opportunities that 
            truly match their skills, experience, and career aspirations. We're dedicated 
            to making job hunting smarter, more efficient, and ultimately more successful.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary">Our Technology</h2>
          <p>
            At the heart of IntelliJob is our advanced AI matching algorithm. This technology 
            analyzes your skills, experience, and preferences to identify job opportunities 
            that represent the best possible match. Unlike traditional job boards that rely on 
            keyword matching, our system understands the nuances of your professional profile 
            and the specific requirements of each position.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary">Our Values</h2>
          <ul className="list-disc pl-5 space-y-3">
            <li><span className="font-medium">Innovation:</span> We constantly push the boundaries of what's possible in job matching technology.</li>
            <li><span className="font-medium">User-Centric:</span> Every feature we develop is designed with our users' needs in mind.</li>
            <li><span className="font-medium">Integrity:</span> We believe in transparent practices and respecting user privacy.</li>
            <li><span className="font-medium">Quality:</span> We're committed to providing high-quality matches rather than quantity.</li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;
