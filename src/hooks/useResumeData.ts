import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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

  const fetchResumeData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        setPersonalDetails(prev => ({
          ...prev,
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
        }));
      }

      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (resumeData) {
        if (resumeError) throw resumeError;
        
        setEducation(parseJsonArray<EducationItem>(resumeData.education));
        setWorkExperience(parseJsonArray<WorkExperienceItem>(resumeData.work_experience));
        setCertificates(parseJsonArray<CertificateItem>(resumeData.certificates));
        setReferences(parseJsonArray<ReferenceItem>(resumeData.reference_list));
        
        if (resumeData.skills) {
          setSkills(parseJsonArray<SkillItem>(resumeData.skills));
        } else {
          await fetchUserSkills(user.id);
        }
        setHasResumeData(true);
      } else {
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
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('seeker_assessments')
        .select('education, experience')
        .eq('user_id', userId)
        .maybeSingle();

      if (assessmentError) throw assessmentError;

      if (assessmentData) {
        const initialEducation: EducationItem = {
          degree: assessmentData.education || "",
          school: "",
          startDate: "",
          endDate: "",
        };
        setEducation([initialEducation]);

        const initialWorkExperience: WorkExperienceItem = {
          company: "",
          title: "",
          startDate: "",
          endDate: "",
          description: assessmentData.experience || "",
        };
        setWorkExperience([initialWorkExperience]);

        await fetchUserSkills(userId);
      }
    } catch (error) {
      console.error('Error initializing from assessment:', error);
    }
  };

  useEffect(() => {
    fetchResumeData();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const educationStrings = education.length > 0 ? education.map(item => JSON.stringify(item)) : null;
      const workExperienceStrings = workExperience.length > 0 ? workExperience.map(item => JSON.stringify(item)) : null;
      const certificatesStrings = certificates.length > 0 ? certificates.map(item => JSON.stringify(item)) : null;
      const referencesStrings = references.length > 0 ? references.map(item => JSON.stringify(item)) : null;
      const skillsStrings = skills.length > 0 ? skills.map(item => JSON.stringify(item)) : null;

      const { data: existingResume } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error;
      if (existingResume) {
        const { error: updateError } = await supabase
          .from('resumes')
          .update({
            first_name: personalDetails.firstName,
            last_name: personalDetails.lastName,
            education: educationStrings,
            work_experience: workExperienceStrings,
            certificates: certificatesStrings,
            reference_list: referencesStrings,
            skills: skillsStrings,
          })
          .eq('user_id', user.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('resumes')
          .insert({
            first_name: personalDetails.firstName,
            last_name: personalDetails.lastName,
            education: educationStrings,
            work_experience: workExperienceStrings,
            certificates: certificatesStrings,
            reference_list: referencesStrings,
            skills: skillsStrings,
            user_id: user.id,
          });
        error = insertError;
      }

      if (error) throw error;

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
        await supabase.functions.invoke('analyze-application', {
          body: { userId: user.id }
        });
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
