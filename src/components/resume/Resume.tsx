import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { User, Book, Briefcase, Award, Star, Users } from "lucide-react";

const Resume = () => {
  const { toast } = useToast();
  const [personalDetails, setPersonalDetails] = useState({
    firstName: "",
    lastName: "",
    profilePicture: "",
  });

  const handleSave = () => {
    // Here you would typically save the data to your backend
    toast({
      title: "Success",
      description: "Your resume has been saved successfully.",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonalDetails(prev => ({
          ...prev,
          profilePicture: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-6">Resume Builder</h2>
      
      <Accordion type="single" collapsible defaultValue="personal-details">
        {/* Personal Details Section */}
        <AccordionItem value="personal-details">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Details
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={personalDetails.profilePicture} />
                    <AvatarFallback>
                      {personalDetails.firstName?.[0]}{personalDetails.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <Input
                    placeholder="First Name"
                    value={personalDetails.firstName}
                    onChange={(e) =>
                      setPersonalDetails((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Last Name"
                    value={personalDetails.lastName}
                    onChange={(e) =>
                      setPersonalDetails((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Education Section */}
        <AccordionItem value="education">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Education
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              <Input placeholder="Degree" />
              <Input placeholder="School Name" />
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" placeholder="Start Date" />
                <Input type="date" placeholder="End Date" />
              </div>
              <Button variant="outline" className="w-full">
                Add Education
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Work Experience Section */}
        <AccordionItem value="work-experience">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Work Experience
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              <Input placeholder="Company Name" />
              <Input placeholder="Job Title" />
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" placeholder="Start Date" />
                <Input type="date" placeholder="End Date" />
              </div>
              <Textarea placeholder="Job Description" />
              <Button variant="outline" className="w-full">
                Add Work Experience
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Certificates Section */}
        <AccordionItem value="certificates">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificates
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              <Input placeholder="Certificate Name" />
              <Input placeholder="Issuing Organization" />
              <Input type="date" placeholder="Date Obtained" />
              <Button variant="outline" className="w-full">
                Add Certificate
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Skills Section */}
        <AccordionItem value="skills">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Skills
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              <Input placeholder="Add a skill" />
              <Button variant="outline" className="w-full">
                Add Skill
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* References Section */}
        <AccordionItem value="references">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              References
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              <Input placeholder="Reference Name" />
              <Input placeholder="Job Title" />
              <Input placeholder="Company" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Phone Number" type="tel" />
              <Button variant="outline" className="w-full">
                Add Reference
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSave}>Save Resume</Button>
      </div>
    </div>
  );
};

export default Resume;