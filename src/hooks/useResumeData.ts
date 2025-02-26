
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

export interface ResumeData {
  personalDetails: PersonalDetails;
  education: EducationItem[];
  workExperience: WorkExperienceItem[];
  certificates: CertificateItem[];
  references: ReferenceItem[];
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
  const [isLoading, setIsLoading] = useState(false);

  const parseJsonArray = <T,>(data: string[] | null): T[] => {
    if (!data) return [];
    try {
      return data.map(item => typeof item === 'string' ? JSON.parse(item) : item);
    } catch (error) {
      console.error('Error parsing JSON array:', error);
      return [];
    }
  };

  const fetchResumeData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Fetch user profile for names
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

      // Fetch existing resume data
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // If resume doesn't exist, fetch assessment data as initial values
      if (!resumeData) {
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('seeker_assessments')
          .select('education, experience')
          .eq('user_id', user.id)
          .maybeSingle();

        if (assessmentError) throw assessmentError;

        if (assessmentData) {
          // Use assessment data as initial values
          const initialEducation: EducationItem = {
            degree: assessmentData.education,
            school: "",
            startDate: "",
            endDate: "",
          };

          const initialWorkExperience: WorkExperienceItem = {
            company: "",
            title: "",
            startDate: "",
            endDate: "",
            description: assessmentData.experience,
          };

          setEducation([initialEducation]);
          setWorkExperience([initialWorkExperience]);
        }
      } else {
        // Use existing resume data
        if (resumeError) throw resumeError;
        
        setEducation(parseJsonArray<EducationItem>(resumeData.education));
        setWorkExperience(parseJsonArray<WorkExperienceItem>(resumeData.work_experience));
        setCertificates(parseJsonArray<CertificateItem>(resumeData.certificates));
        setReferences(parseJsonArray<ReferenceItem>(resumeData.reference_list));
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

  useEffect(() => {
    fetchResumeData();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Convert arrays to strings for storage
      const educationStrings = education.map(item => JSON.stringify(item));
      const workExperienceStrings = workExperience.map(item => JSON.stringify(item));
      const certificatesStrings = certificates.map(item => JSON.stringify(item));
      const referencesStrings = references.map(item => JSON.stringify(item));

      const { error } = await supabase
        .from('resumes')
        .upsert({
          first_name: personalDetails.firstName,
          last_name: personalDetails.lastName,
          education: educationStrings,
          work_experience: workExperienceStrings,
          certificates: certificatesStrings,
          reference_list: referencesStrings,
          user_id: user.id,
        });

      if (error) throw error;

      // Also update the profile names
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: personalDetails.firstName,
          last_name: personalDetails.lastName,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Resume data saved successfully",
      });
    } catch (error: any) {
      console.error('Error saving resume data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save resume data",
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
    isLoading,
    handleSave,
    handleImageUpload,
  };
};
