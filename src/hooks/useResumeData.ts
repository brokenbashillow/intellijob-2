
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { createAssessmentNotification } from "@/services/notificationService";
import { fetchAssessmentData, fetchResumeData, fetchUserProfile, saveResumeData } from "@/services/resumeService";

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  profilePicture?: string;
  educationField?: string;
  industry?: string;
}

export interface EducationItem {
  degree: string;
  school: string;
  startDate: string;
  endDate: string;
}

export interface WorkExperienceItem {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CertificateItem {
  name: string;
  organization: string;
  dateObtained: string;
}

export interface ReferenceItem {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
}

export interface SkillItem {
  id: string;
  name: string;
  type: 'technical' | 'soft';
}

export interface ResumeData {
  personalDetails: PersonalDetails;
  education: EducationItem[];
  workExperience: WorkExperienceItem[];
  certificates: CertificateItem[];
  references: ReferenceItem[];
  skills: SkillItem[];
}

export const useResumeData = () => {
  const { toast } = useToast();
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    firstName: "",
    lastName: "",
    profilePicture: "",
    educationField: "",
    industry: "",
  });

  const [education, setEducation] = useState<EducationItem[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperienceItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasResumeData, setHasResumeData] = useState(false);

  const parseJsonArray = <T,>(data: any[] | null): T[] => {
    if (!data) return [];
    try {
      return data.map(item => {
        if (typeof item === 'string') {
          return JSON.parse(item) as T;
        }
        return item as T;
      });
    } catch (error) {
      console.error('Error parsing JSON array:', error);
      return [];
    }
  };

  const fetchResumeAndAssessmentData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Fetch profile data
      const profileData = await fetchUserProfile();
      
      if (profileData) {
        setPersonalDetails(prev => ({
          ...prev,
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
        }));
      }

      // Fetch resume data
      const resumeData = await fetchResumeData();

      if (resumeData) {
        setEducation(parseJsonArray<EducationItem>(resumeData.education));
        setWorkExperience(parseJsonArray<WorkExperienceItem>(resumeData.work_experience));
        setCertificates(parseJsonArray<CertificateItem>(resumeData.certificates));
        setReferences(parseJsonArray<ReferenceItem>(resumeData.reference_list));
        
        if (resumeData.skills && resumeData.skills.length > 0) {
          setSkills(parseJsonArray<SkillItem>(resumeData.skills));
        } else {
          await fetchUserSkills(user.id);
        }
        setHasResumeData(true);
      } else {
        // No resume data found, check for assessment data
        await initializeFromAssessment(user.id);
        setHasResumeData(false);
      }
    } catch (error: any) {
      console.error('Error fetching resume data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load resume data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserSkills = async (userId: string) => {
    try {
      const { data: userSkillsData, error: userSkillsError } = await supabase
        .from('user_skills')
        .select(`
          skill_id,
          skill_type,
          skills (
            name
          )
        `)
        .eq('user_id', userId);

      if (userSkillsError) throw userSkillsError;

      if (userSkillsData && userSkillsData.length > 0) {
        const formattedSkills: SkillItem[] = userSkillsData.map(skillData => ({
          id: skillData.skill_id,
          name: skillData.skills.name,
          type: skillData.skill_type as 'technical' | 'soft',
        }));
        setSkills(formattedSkills);
      }
    } catch (error) {
      console.error('Error fetching user skills:', error);
    }
  };

  const initializeFromAssessment = async (userId: string) => {
    try {
      // Fetch the latest assessment data
      const assessmentData = await fetchAssessmentData();

      if (assessmentData) {
        console.log("Initializing from assessment data:", assessmentData);
        
        // Set education from assessment
        if (assessmentData.education) {
          const initialEducation: EducationItem = {
            degree: assessmentData.education || "",
            school: "",
            startDate: "",
            endDate: "",
          };
          setEducation([initialEducation]);
        }

        // Set work experience from assessment
        if (assessmentData.experience) {
          const initialWorkExperience: WorkExperienceItem = {
            company: "",
            title: "",
            startDate: "",
            endDate: "",
            description: assessmentData.experience || "",
          };
          setWorkExperience([initialWorkExperience]);
        }

        // Fetch skills from user_skills table
        await fetchUserSkills(userId);
      }
    } catch (error) {
      console.error('Error initializing from assessment:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Prepare data for saving
      const resumeData = {
        personalDetails,
        education,
        workExperience,
        certificates,
        references,
        skills
      };

      // Save to the database using the service function
      await saveResumeData(resumeData);

      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: personalDetails.firstName,
          last_name: personalDetails.lastName,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setHasResumeData(true);

      try {
        // Trigger re-analysis of the application
        await supabase.functions.invoke('analyze-application', {
          body: { userId: user.id }
        });
        
        // Create notification for the assessment update
        await createAssessmentNotification(user.id);
        
      } catch (analyzeError) {
        console.error("Error triggering assessment re-evaluation:", analyzeError);
      }

      toast({
        title: "Success",
        description: "Resume data saved successfully",
      });
    } catch (error: any) {
      console.error('Error saving resume data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save resume data",
      });
    } finally {
      setIsLoading(false);
    }
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

  useEffect(() => {
    fetchResumeAndAssessmentData();
  }, []);

  return {
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
  };
};
