
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

interface ResumeProps {
  onSave?: () => void;
}

const Resume = ({ onSave }: ResumeProps) => {
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
    await handleSave();
    if (onSave) {
      onSave();
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-3 md:p-6 space-y-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Resume Builder</h2>
      
      {!hasResumeData && (
        <Alert className="mb-4 md:mb-6 bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800 text-sm md:text-base">
            We've initialized your resume with information from your assessment. Please complete and save your resume to unlock full job recommendations.
          </AlertDescription>
        </Alert>
      )}
      
      <Accordion type="single" collapsible defaultValue="personal-details" className="w-full">
        <AccordionItem value="personal-details">
          <AccordionTrigger className="text-base md:text-lg font-semibold py-3 px-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Personal Details</span>
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
          <AccordionTrigger className="text-base md:text-lg font-semibold py-3 px-2">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Skills</span>
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
          <AccordionTrigger className="text-base md:text-lg font-semibold py-3 px-2">
            <div className="flex items-center gap-2">
              <Book className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Education</span>
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
          <AccordionTrigger className="text-base md:text-lg font-semibold py-3 px-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Work Experience</span>
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
          <AccordionTrigger className="text-base md:text-lg font-semibold py-3 px-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Certificates</span>
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
          <AccordionTrigger className="text-base md:text-lg font-semibold py-3 px-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">References</span>
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

      <div className="flex justify-end pt-4 md:pt-6">
        <Button onClick={handleSaveWithCallback} className="w-full md:w-auto">Save Resume</Button>
      </div>
    </div>
  );
};

export default Resume;
