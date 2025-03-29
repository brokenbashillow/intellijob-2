
import { supabase } from "@/integrations/supabase/client";
import { ResumeData, PersonalDetails } from "@/types/resume";
import { parseEducationData, parseWorkExperience, parseCertificate, parseReference } from "@/utils/resumeDataParser";

export const fetchUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated user");

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  return profileData;
};

export const fetchResumeData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated user");

  const { data: resumeData, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error && error.message !== "JSON object requested, multiple (or no) rows returned") {
    throw error;
  }

  return resumeData;
};

export const fetchAssessmentData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: assessmentData, error } = await supabase
    .from('seeker_assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return assessmentData;
};

export const saveResumeData = async (data: ResumeData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated user");

  // Convert skills to the format expected by the database
  const skillsData = data.skills && data.skills.length > 0 
    ? data.skills.map(skill => JSON.stringify({
        id: skill.id,
        name: skill.name,
        type: skill.type
      }))
    : [];

  const resumeData = {
    user_id: user.id,
    first_name: data.personalDetails.firstName,
    last_name: data.personalDetails.lastName,
    education: data.education.map(edu => JSON.stringify({
      degree: edu.degree,
      school: edu.school,
      startDate: edu.startDate,
      endDate: edu.endDate
    })),
    work_experience: data.workExperience.map(exp => JSON.stringify({
      company: exp.company,
      title: exp.title,
      startDate: exp.startDate,
      endDate: exp.endDate,
      description: exp.description
    })),
    certificates: data.certificates.map(cert => JSON.stringify({
      name: cert.name,
      organization: cert.organization,
      dateObtained: cert.dateObtained
    })),
    reference_list: data.references.map(ref => JSON.stringify({
      name: ref.name,
      title: ref.title,
      company: ref.company,
      email: ref.email,
      phone: ref.phone
    })),
    skills: skillsData
  };

  const { error } = await supabase
    .from('resumes')
    .upsert(resumeData)
    .eq('user_id', user.id);

  if (error) throw error;
};

export const uploadProfileImage = async (file: File) => {
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

  return publicUrl;
};
