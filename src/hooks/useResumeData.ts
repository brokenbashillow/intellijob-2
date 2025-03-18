
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
        // User has a resume, use that data
        if (resumeError) throw resumeError;
        
        setEducation(parseJsonArray<EducationItem>(resumeData.education));
        setWorkExperience(parseJsonArray<WorkExperienceItem>(resumeData.work_experience));
        setCertificates(parseJsonArray<CertificateItem>(resumeData.certificates));
        setReferences(parseJsonArray<ReferenceItem>(resumeData.reference_list));
        
        // Parse skills from the skills column with our updated parseJsonArray function
        if (resumeData.skills) {
          setSkills(parseJsonArray<SkillItem>(resumeData.skills));
        } else {
          // If no skills in resume data, try to fetch from user_skills
          await fetchUserSkills(user.id);
        }
        setHasResumeData(true);
      } else {
        // User doesn't have a resume yet, initialize with assessment data
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
        .select('education, experience, technical_skills, soft_skills')
        .eq('user_id', userId)
        .maybeSingle();

      if (assessmentError) throw assessmentError;

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

        // Fetch skills from user_skills table
        await fetchUserSkills(userId);

        // If no skills were fetched, try to initialize from assessment technical_skills and soft_skills
        if (skills.length === 0) {
          const skillPromises = [];
          
          // Process technical skills
          if (assessmentData.technical_skills && assessmentData.technical_skills.length > 0) {
            const techSkillPromise = supabase
              .from('skills')
              .select('id, name')
              .in('id', assessmentData.technical_skills);
            skillPromises.push(techSkillPromise);
          }
          
          // Process soft skills
          if (assessmentData.soft_skills && assessmentData.soft_skills.length > 0) {
            const softSkillPromise = supabase
              .from('skills')
              .select('id, name')
              .in('id', assessmentData.soft_skills);
            skillPromises.push(softSkillPromise);
          }
          
          if (skillPromises.length > 0) {
            const results = await Promise.all(skillPromises);
            
            const allSkills: SkillItem[] = [];
            
            // Add technical skills
            if (results[0] && !results[0].error && results[0].data) {
              const techSkills = results[0].data.map(skill => ({
                id: skill.id,
                name: skill.name,
                type: 'technical' as const
              }));
              allSkills.push(...techSkills);
            }
            
            // Add soft skills
            if (results[1] && !results[1].error && results[1].data) {
              const softSkills = results[1].data.map(skill => ({
                id: skill.id,
                name: skill.name,
                type: 'soft' as const
              }));
              allSkills.push(...softSkills);
            }
            
            if (allSkills.length > 0) {
              setSkills(allSkills);
            }
          }
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Only convert to JSON strings if we're not using null values
      const educationStrings = education.length > 0 ? education.map(item => JSON.stringify(item)) : null;
      const workExperienceStrings = workExperience.length > 0 ? workExperience.map(item => JSON.stringify(item)) : null;
      const certificatesStrings = certificates.length > 0 ? certificates.map(item => JSON.stringify(item)) : null;
      const referencesStrings = references.length > 0 ? references.map(item => JSON.stringify(item)) : null;
      const skillsStrings = skills.length > 0 ? skills.map(item => JSON.stringify(item)) : null;

      // Extract technical and soft skill IDs for seeker_assessments update
      const technicalSkillIds = skills
        .filter(skill => skill.type === 'technical')
        .map(skill => skill.id);
      
      const softSkillIds = skills
        .filter(skill => skill.type === 'soft')
        .map(skill => skill.id);

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

      // Update the profile with first and last name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: personalDetails.firstName,
          last_name: personalDetails.lastName,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update or create seeker_assessment with the extracted skills
      const { data: assessmentData, error: getAssessmentError } = await supabase
        .from('seeker_assessments')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (getAssessmentError) throw getAssessmentError;

      // Update the assessment with technical_skills and soft_skills
      if (assessmentData) {
        const { error: updateAssessmentError } = await supabase
          .from('seeker_assessments')
          .update({
            technical_skills: technicalSkillIds.length > 0 ? technicalSkillIds : null,
            soft_skills: softSkillIds.length > 0 ? softSkillIds : null,
            experience: workExperience.length > 0 ? workExperience[0].description : "",
          })
          .eq('id', assessmentData.id);

        if (updateAssessmentError) throw updateAssessmentError;
      }

      // Sync user_skills table with the current skills
      if (skills.length > 0) {
        // First, delete existing user skills
        const { error: deleteError } = await supabase
          .from('user_skills')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // Then, insert the current skills
        const skillsToInsert = skills.map(skill => ({
          user_id: user.id,
          skill_id: skill.id,
          skill_type: skill.type,
          assessment_id: assessmentData?.id
        }));

        const { error: insertSkillsError } = await supabase
          .from('user_skills')
          .insert(skillsToInsert);

        if (insertSkillsError) throw insertSkillsError;
      }

      setHasResumeData(true);

      // Trigger a re-evaluation of the assessment results
      try {
        await supabase.functions.invoke('analyze-application', {
          body: { userId: user.id }
        });
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
