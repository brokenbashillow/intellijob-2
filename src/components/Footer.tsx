import { Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary/5 mt-20 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">IntelliJob</h3>
          <p className="text-muted-foreground">
            Making job hunting smarter and easier for everyone.
          </p>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-muted-foreground hover:text-primary">About Us</a>
            </li>
            <li>
              <a href="#" className="text-muted-foreground hover:text-primary">Careers</a>
            </li>
            <li>
              <a href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</a>
            </li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Contact</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>123 Job Street, Career City</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>contact@intellijob.com</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} IntelliJob. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;