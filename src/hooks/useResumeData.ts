
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  profilePicture: string;
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

export function useResumeData() {
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
  const [isLoading, setIsLoading] = useState(true);

  const fetchResumeData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: resumeData, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (resumeData) {
        setPersonalDetails({
          firstName: resumeData.first_name || "",
          lastName: resumeData.last_name || "",
          profilePicture: "",
        });
        
        setEducation(resumeData.education?.map((edu: string) => {
          const parsed = JSON.parse(edu);
          return {
            degree: parsed.degree || "",
            school: parsed.school || "",
            startDate: parsed.startDate || "",
            endDate: parsed.endDate || "",
          };
        }) || []);

        setWorkExperience(resumeData.work_experience?.map((exp: string) => {
          const parsed = JSON.parse(exp);
          return {
            company: parsed.company || "",
            title: parsed.title || "",
            startDate: parsed.startDate || "",
            endDate: parsed.endDate || "",
            description: parsed.description || "",
          };
        }) || []);

        setCertificates(resumeData.certificates?.map((cert: string) => {
          const parsed = JSON.parse(cert);
          return {
            name: parsed.name || "",
            organization: parsed.organization || "",
            dateObtained: parsed.dateObtained || "",
          };
        }) || []);

        setReferences(resumeData.reference_list?.map((ref: string) => {
          const parsed = JSON.parse(ref);
          return {
            name: parsed.name || "",
            title: parsed.title || "",
            company: parsed.company || "",
            email: parsed.email || "",
            phone: parsed.phone || "",
          };
        }) || []);
      }

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        const [firstName, ...lastNameParts] = (profileData.full_name || "").split(" ");
        setPersonalDetails(prev => ({
          ...prev,
          firstName: firstName || "",
          lastName: lastNameParts.join(" ") || "",
          profilePicture: profileData.avatar_url || "",
        }));
      }
    } catch (error: any) {
      console.error('Error fetching resume data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load resume data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssessmentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: assessmentData, error } = await supabase
        .from('seeker_assessments')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (assessmentData) {
        const educationItem: EducationItem = {
          degree: assessmentData.education,
          school: "",
          startDate: "",
          endDate: "",
        };

        const experienceItem: WorkExperienceItem = {
          company: "",
          title: assessmentData.job_title || "",
          startDate: "",
          endDate: "",
          description: assessmentData.experience,
        };

        setEducation(prev => [...prev, educationItem]);
        setWorkExperience(prev => [...prev, experienceItem]);
      }
    } catch (error) {
      console.error('Error fetching assessment data:', error);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const resumeData = {
        user_id: user.id,
        first_name: personalDetails.firstName,
        last_name: personalDetails.lastName,
        education: education.map(edu => JSON.stringify({
          degree: edu.degree,
          school: edu.school,
          startDate: edu.startDate,
          endDate: edu.endDate
        })),
        work_experience: workExperience.map(exp => JSON.stringify({
          company: exp.company,
          title: exp.title,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description
        })),
        certificates: certificates.map(cert => JSON.stringify({
          name: cert.name,
          organization: cert.organization,
          dateObtained: cert.dateObtained
        })),
        reference_list: references.map(ref => JSON.stringify({
          name: ref.name,
          title: ref.title,
          company: ref.company,
          email: ref.email,
          phone: ref.phone
        }))
      };

      const { error } = await supabase
        .from('resumes')
        .upsert(resumeData)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your resume has been saved successfully.",
      });
    } catch (error: any) {
      console.error('Error saving resume:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save resume.",
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setPersonalDetails(prev => ({
        ...prev,
        profilePicture: publicUrl,
      }));

      toast({
        title: "Success",
        description: "Profile picture updated successfully.",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image.",
      });
    }
  };

  useEffect(() => {
    fetchResumeData();
    fetchAssessmentData();
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
    isLoading,
    handleSave,
    handleImageUpload,
  };
}
