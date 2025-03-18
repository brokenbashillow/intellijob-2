
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  profilePicture?: string;
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
  });

  const [education, setEducation] = useState<EducationItem[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperienceItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasResumeData, setHasResumeData] = useState(false);

  // Modified to handle both string arrays and JSON arrays
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

      // First, check if the user has a resume already
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (resumeData) {
        console.log("Found existing resume data:", resumeData);
        // User has a resume, use that data
        if (resumeError) throw resumeError;
        
        setEducation(parseJsonArray<EducationItem>(resumeData.education));
        setWorkExperience(parseJsonArray<WorkExperienceItem>(resumeData.work_experience));
        setCertificates(parseJsonArray<CertificateItem>(resumeData.certificates));
        setReferences(parseJsonArray<ReferenceItem>(resumeData.reference_list));
        
        // Parse skills from the skills column with our updated parseJsonArray function
        if (resumeData.skills && resumeData.skills.length > 0) {
          console.log("Found skills in resume:", resumeData.skills);
          const parsedSkills = parseJsonArray<SkillItem>(resumeData.skills);
          setSkills(parsedSkills);
          console.log("Parsed skills:", parsedSkills);
        } else {
          console.log("No skills found in resume, fetching from user_skills");
          // If no skills in resume data, try to fetch from user_skills
          await fetchUserSkills(user.id);
        }
        setHasResumeData(true);
      } else {
        console.log("No resume found, initializing from assessment");
        // User doesn't have a resume yet, initialize with assessment data
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
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('seeker_assessments')
        .select('education, experience, technical_skills, soft_skills')
        .eq('user_id', userId)
        .maybeSingle();

      if (assessmentError) {
        console.error("Error fetching assessment:", assessmentError);
        throw assessmentError;
      }

      console.log("Assessment data:", assessmentData);

      if (assessmentData) {
        // Initialize education from assessment
        const initialEducation: EducationItem = {
          degree: assessmentData.education || "",
          school: "",
          startDate: "",
          endDate: "",
        };
        setEducation([initialEducation]);

        // Initialize work experience from assessment
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

        // Initialize skills from assessment
        if (
          (assessmentData.technical_skills && assessmentData.technical_skills.length > 0) ||
          (assessmentData.soft_skills && assessmentData.soft_skills.length > 0)
        ) {
          const skillsList: SkillItem[] = [];
          
          // Process technical skills
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
          
          // Process soft skills
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
      console.log("Saving resume data with skills:", skills);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Only convert to JSON strings if we're not using null values
      const educationStrings = education.length > 0 ? education.map(item => JSON.stringify(item)) : null;
      const workExperienceStrings = workExperience.length > 0 ? workExperience.map(item => JSON.stringify(item)) : null;
      const certificatesStrings = certificates.length > 0 ? certificates.map(item => JSON.stringify(item)) : null;
      const referencesStrings = references.length > 0 ? references.map(item => JSON.stringify(item)) : null;
      
      // Make sure to stringify each skill object properly
      const skillsStrings = skills.length > 0 ? skills.map(item => JSON.stringify(item)) : null;
      console.log("Skills strings to save:", skillsStrings);

      // Extract technical and soft skill IDs for seeker_assessments update
      const technicalSkillIds = skills
        .filter(skill => skill.type === 'technical')
        .map(skill => skill.id);
      
      const softSkillIds = skills
        .filter(skill => skill.type === 'soft')
        .map(skill => skill.id);
      
      console.log("Technical skill IDs:", technicalSkillIds);
      console.log("Soft skill IDs:", softSkillIds);

      const { data: existingResume } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error;
      const resumeDataToSave = {
        first_name: personalDetails.firstName,
        last_name: personalDetails.lastName,
        education: educationStrings,
        work_experience: workExperienceStrings,
        certificates: certificatesStrings,
        reference_list: referencesStrings,
        skills: skillsStrings,
      };
      
      console.log("Resume data to save:", resumeDataToSave);

      if (existingResume) {
        const { error: updateError } = await supabase
          .from('resumes')
          .update(resumeDataToSave)
          .eq('user_id', user.id);
        error = updateError;
        
        if (updateError) {
          console.error("Error updating resume:", updateError);
        } else {
          console.log("Resume updated successfully");
        }
      } else {
        const { error: insertError } = await supabase
          .from('resumes')
          .insert({
            ...resumeDataToSave,
            user_id: user.id,
          });
        error = insertError;
        
        if (insertError) {
          console.error("Error inserting resume:", insertError);
        } else {
          console.log("Resume inserted successfully");
        }
      }

      if (error) throw error;

      // Update the profile with first and last name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: personalDetails.firstName,
          last_name: personalDetails.lastName,
        })
        .eq('id', user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      } else {
        console.log("Profile updated successfully");
      }

      // Update or create seeker_assessment with the extracted skills
      const { data: assessmentData, error: getAssessmentError } = await supabase
        .from('seeker_assessments')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (getAssessmentError) {
        console.error("Error getting assessment:", getAssessmentError);
        throw getAssessmentError;
      }

      // Update the assessment with technical_skills and soft_skills
      if (assessmentData) {
        const assessmentUpdateData = {
          technical_skills: technicalSkillIds.length > 0 ? technicalSkillIds : null,
          soft_skills: softSkillIds.length > 0 ? softSkillIds : null,
          experience: workExperience.length > 0 ? workExperience[0].description : "",
        };
        
        console.log("Assessment data to update:", assessmentUpdateData);
        
        const { error: updateAssessmentError } = await supabase
          .from('seeker_assessments')
          .update(assessmentUpdateData)
          .eq('id', assessmentData.id);

        if (updateAssessmentError) {
          console.error("Error updating assessment:", updateAssessmentError);
          throw updateAssessmentError;
        } else {
          console.log("Assessment updated successfully");
        }
      } else {
        console.log("No assessment to update");
      }

      // Sync user_skills table with the current skills
      if (skills.length > 0) {
        console.log("Syncing user_skills table");
        // First, delete existing user skills
        const { error: deleteError } = await supabase
          .from('user_skills')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error("Error deleting existing user skills:", deleteError);
          throw deleteError;
        } else {
          console.log("Existing user skills deleted successfully");
        }

        // Then, insert the current skills
        const skillsToInsert = skills.map(skill => ({
          user_id: user.id,
          skill_id: skill.id,
          skill_type: skill.type,
          assessment_id: assessmentData?.id
        }));
        
        console.log("Skills to insert:", skillsToInsert);

        if (skillsToInsert.length > 0) {
          const { error: insertSkillsError } = await supabase
            .from('user_skills')
            .insert(skillsToInsert);

          if (insertSkillsError) {
            console.error("Error inserting user skills:", insertSkillsError);
            throw insertSkillsError;
          } else {
            console.log("User skills inserted successfully");
          }
        }
      } else {
        console.log("No skills to sync");
      }

      setHasResumeData(true);

      // Trigger a re-evaluation of the assessment results
      try {
        console.log("Triggering assessment re-evaluation for user:", user.id);
        const analyzeResponse = await supabase.functions.invoke('analyze-application', {
          body: { userId: user.id }
        });
        
        console.log("Analyze application response:", analyzeResponse);
        
        if (analyzeResponse.error) {
          console.error("Error from analyze-application function:", analyzeResponse.error);
          throw new Error(analyzeResponse.error.message || "Failed to analyze application");
        }
      } catch (analyzeError) {
        console.error("Error triggering assessment re-evaluation:", analyzeError);
        // We don't want to fail the whole save operation if the analysis fails
      }
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
