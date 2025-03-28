
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8 text-primary">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <p>
            At IntelliJob, we take your privacy very seriously. This Privacy Policy 
            explains how we collect, use, and protect your personal information.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary">Information We Collect</h2>
          <p>
            <strong>We only collect data that you explicitly provide in the assessment form.</strong> 
            This includes:
          </p>
          <ul className="list-disc pl-5 space-y-3 mt-2">
            <li>Education information (degrees, institutions)</li>
            <li>Work experience details</li>
            <li>Technical and soft skills</li>
            <li>Location preferences</li>
            <li>Any other information you choose to provide in your profile</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary">How We Use Your Information</h2>
          <p>
            The information you provide is used solely for the purpose of:
          </p>
          <ul className="list-disc pl-5 space-y-3 mt-2">
            <li>Matching you with suitable job opportunities</li>
            <li>Improving our AI matching algorithms</li>
            <li>Personalizing your job search experience</li>
            <li>Communicating with you about potential opportunities</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary">Data Protection</h2>
          <p>
            We implement a variety of security measures to maintain the safety of your 
            personal information. Your personal data is contained behind secured networks 
            and is only accessible by a limited number of persons who have special access 
            rights and are required to keep the information confidential.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary">Data Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personally identifiable 
            information to outside parties without your consent, except when required by law.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary">Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-3 mt-2">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of any inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            <a href="mailto:privacy@intellijob.com" className="text-primary hover:underline">
              privacy@intellijob.com
            </a>
          </p>
          
          <p className="mt-8 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
