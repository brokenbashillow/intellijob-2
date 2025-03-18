
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Book, Briefcase, Award, Users, Wrench } from "lucide-react";
import { useResumeData } from "@/hooks/useResumeData";
import { PersonalDetailsSection } from "./PersonalDetailsSection";
import { EducationSection } from "./EducationSection";
import { WorkExperienceSection } from "./WorkExperienceSection";
import { CertificatesSection } from "./CertificatesSection";
import { ReferencesSection } from "./ReferencesSection";
import { SkillsSection } from "./SkillsSection";
import { useToast } from "@/components/ui/use-toast";

interface ResumeProps {
  onSave?: () => void;
}

const Resume = ({ onSave }: ResumeProps) => {
  const { toast } = useToast();
  const {
    personalDetails,
    setPersonalDetails,
    education,
    setEducation,
    workExperience,
    setWorkExperience,
    certificates,
    setCertificates,
    references,
    setReferences,
    skills,
    setSkills,
    isLoading,
    hasResumeData,
    handleSave,
    handleImageUpload,
  } = useResumeData();

  const handleSaveWithCallback = async () => {
    try {
      // Validate required fields before saving
      if (workExperience.length === 0) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please add at least one work experience entry before saving.",
        });
        return;
      }

      // Check if there are any technical skills
      const hasTechnicalSkills = skills.some(skill => skill.type === 'technical');
      if (!hasTechnicalSkills) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please add at least one technical skill before saving.",
        });
        return;
      }

      // Check if there are any soft skills
      const hasSoftSkills = skills.some(skill => skill.type === 'soft');
      if (!hasSoftSkills) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please add at least one soft skill before saving.",
        });
        return;
      }

      await handleSave();
      toast({
        title: "Success",
        description: "Resume saved successfully and assessment updated.",
      });
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save resume. Please try again.",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-6">Resume Builder</h2>
      
      {!hasResumeData && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800">
            We've initialized your resume with information from your assessment. Please complete and save your resume to unlock full job recommendations.
          </AlertDescription>
        </Alert>
      )}
      
      <Accordion type="single" collapsible defaultValue="personal-details">
        <AccordionItem value="personal-details">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Details
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <PersonalDetailsSection
              personalDetails={personalDetails}
              setPersonalDetails={setPersonalDetails}
              handleImageUpload={handleImageUpload}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="skills">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Skills
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <SkillsSection
              skills={skills}
              setSkills={setSkills}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="education">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Education
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EducationSection
              education={education}
              setEducation={setEducation}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="work-experience">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Work Experience
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <WorkExperienceSection
              workExperience={workExperience}
              setWorkExperience={setWorkExperience}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="certificates">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificates
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CertificatesSection
              certificates={certificates}
              setCertificates={setCertificates}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="references">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              References
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ReferencesSection
              references={references}
              setReferences={setReferences}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSaveWithCallback}>Save Resume</Button>
      </div>
    </div>
  );
};

export default Resume;
