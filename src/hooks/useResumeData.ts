import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { fetchResumeData, fetchUserProfile, fetchAssessmentData, saveResumeData, uploadProfileImage } from "@/services/resumeService";
import { 
  PersonalDetails, 
  EducationItem, 
  WorkExperienceItem, 
  CertificateItem, 
  ReferenceItem, 
  SkillItem, 
  ResumeData 
} from "@/types/resume";

export const useResumeData = () => {
  const { toast } = useToast();
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    firstName: "",
    lastName: "",
    profilePicture: "",
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
          try {
            return JSON.parse(item) as T;
          } catch (e) {
            console.error('Error parsing JSON item:', e, item);
            return null;
          }
        }
        return item as T;
      }).filter(Boolean) as T[];
    } catch (error) {
      console.error('Error parsing JSON array:', error);
      return [];
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const profileData = await fetchUserProfile();
      if (profileData) {
        setPersonalDetails(prev => ({
          ...prev,
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
        }));
      }

      const resumeData = await fetchResumeData();
      if (resumeData) {
        console.log("Found existing resume data:", resumeData);
        
        setEducation(parseJsonArray<EducationItem>(resumeData.education));
        setWorkExperience(parseJsonArray<WorkExperienceItem>(resumeData.work_experience));
        setCertificates(parseJsonArray<CertificateItem>(resumeData.certificates));
        setReferences(parseJsonArray<ReferenceItem>(resumeData.reference_list));
        
        if (resumeData.skills && resumeData.skills.length > 0) {
          console.log("Found skills in resume data:", resumeData.skills);
          try {
            const parsedSkills = parseJsonArray<SkillItem>(resumeData.skills);
            console.log("Parsed skills:", parsedSkills);
            setSkills(parsedSkills);
          } catch (e) {
            console.error("Error parsing skills from resume:", e);
            await fetchUserSkills(user.id);
          }
        } else {
          console.log("No skills found in resume, fetching from user_skills");
          await fetchUserSkills(user.id);
        }
        setHasResumeData(true);
      } else {
        console.log("No resume found, initializing from assessment");
        await initializeFromAssessment(user.id);
        setHasResumeData(false);
      }
    } catch (error: any) {
      console.error('Error fetching resume data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load resume data: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserSkills = async (userId: string) => {
    try {
      console.log("Fetching user skills for user:", userId);
      const { data: userSkillsData, error: userSkillsError } = await supabase
        .from('user_skills')
        .select(`
          skill_id,
          skill_type,
          skills (
            id,
            name
          )
        `)
        .eq('user_id', userId);

      if (userSkillsError) {
        console.error("Error fetching user skills:", userSkillsError);
        throw userSkillsError;
      }

      console.log("User skills data:", userSkillsData);

      if (userSkillsData && userSkillsData.length > 0) {
        const formattedSkills: SkillItem[] = userSkillsData.map(skillData => ({
          id: skillData.skill_id,
          name: skillData.skills?.name || "Unknown Skill",
          type: skillData.skill_type as 'technical' | 'soft',
        }));
        console.log("Formatted skills from user_skills:", formattedSkills);
        setSkills(formattedSkills);
      } else {
        console.log("No user skills found");
      }
    } catch (error) {
      console.error('Error fetching user skills:', error);
    }
  };

  const initializeFromAssessment = async (userId: string) => {
    try {
      console.log("Initializing from assessment for user:", userId);
      const assessmentData = await fetchAssessmentData();
      
      if (!assessmentData) {
        console.log("No assessment data found");
        return;
      }

      console.log("Assessment data:", assessmentData);

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

      console.log("Technical skills from assessment:", assessmentData.technical_skills);
      console.log("Soft skills from assessment:", assessmentData.soft_skills);

      if (
        (assessmentData.technical_skills && assessmentData.technical_skills.length > 0) ||
        (assessmentData.soft_skills && assessmentData.soft_skills.length > 0)
      ) {
        const skillsList: SkillItem[] = [];
        
        if (assessmentData.technical_skills && assessmentData.technical_skills.length > 0) {
          try {
            const { data: techSkillsData, error: techSkillsError } = await supabase
              .from('skills')
              .select('id, name')
              .in('id', assessmentData.technical_skills);
            
            if (techSkillsError) throw techSkillsError;
            
            if (techSkillsData && techSkillsData.length > 0) {
              const techSkills = techSkillsData.map(skill => ({
                id: skill.id,
                name: skill.name,
                type: 'technical' as const
              }));
              skillsList.push(...techSkills);
              console.log("Added technical skills:", techSkills);
            }
          } catch (error) {
            console.error("Error fetching technical skills:", error);
          }
        }
        
        if (assessmentData.soft_skills && assessmentData.soft_skills.length > 0) {
          try {
            const { data: softSkillsData, error: softSkillsError } = await supabase
              .from('skills')
              .select('id, name')
              .in('id', assessmentData.soft_skills);
            
            if (softSkillsError) throw softSkillsError;
            
            if (softSkillsData && softSkillsData.length > 0) {
              const softSkills = softSkillsData.map(skill => ({
                id: skill.id,
                name: skill.name,
                type: 'soft' as const
              }));
              skillsList.push(...softSkills);
              console.log("Added soft skills:", softSkills);
            }
          } catch (error) {
            console.error("Error fetching soft skills:", error);
          }
        }
        
        if (skillsList.length > 0) {
          console.log("Setting skills from assessment:", skillsList);
          setSkills(skillsList);
        }
      } else {
        console.log("No skills found in assessment");
      }
    } catch (error) {
      console.error('Error initializing from assessment:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log("Saving resume data with skills:", skills);
      
      const resumeData: ResumeData = {
        personalDetails,
        education,
        workExperience,
        certificates,
        references,
        skills
      };
      
      await saveResumeData(resumeData);
      
      setHasResumeData(true);
      
      console.log("Resume data saved successfully");
    } catch (error: any) {
      console.error('Error saving resume data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save resume data",
      });
      throw error; // Rethrow to allow handling in the UI
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsLoading(true);
        const imageUrl = await uploadProfileImage(file);
        
        setPersonalDetails(prev => ({
          ...prev,
          profilePicture: imageUrl
        }));
        
        toast({
          title: "Image Uploaded",
          description: "Profile picture updated successfully"
        });
      } catch (error: any) {
        console.error("Error uploading image:", error);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: error.message || "Failed to upload profile picture"
        });
      } finally {
        setIsLoading(false);
      }
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
