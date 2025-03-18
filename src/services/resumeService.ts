
import { supabase } from "@/integrations/supabase/client";
import { ResumeData, PersonalDetails, SkillItem } from "@/types/resume";
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

  // Fix: Ensure each skill is properly stringified with correct fields only
  const skillsJson = data.skills.map(skill => {
    return JSON.stringify({
      id: skill.id,
      name: skill.name,
      type: skill.type
    });
  });
  
  console.log("Saving skills to resume:", skillsJson);

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
    skills: skillsJson
  };

  // Check if user already has a resume
  const { data: existingResume } = await supabase
    .from('resumes')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  let error;
  
  if (existingResume) {
    // Update existing resume
    console.log("Updating existing resume with skills data:", skillsJson);
    const { error: updateError } = await supabase
      .from('resumes')
      .update(resumeData)
      .eq('user_id', user.id);
    
    error = updateError;
    if (updateError) {
      console.error("Error updating resume:", updateError);
    }
  } else {
    // Insert new resume
    console.log("Creating new resume with skills data:", skillsJson);
    const { error: insertError } = await supabase
      .from('resumes')
      .insert(resumeData);
    
    error = insertError;
    if (insertError) {
      console.error("Error inserting resume:", insertError);
    }
  }

  if (error) throw error;

  // Now also update the seeker assessment with the skills
  const techSkillIds = data.skills
    .filter(skill => skill.type === 'technical')
    .map(skill => skill.id);
  
  const softSkillIds = data.skills
    .filter(skill => skill.type === 'soft')
    .map(skill => skill.id);

  console.log("Updating assessment with technical skills:", techSkillIds);
  console.log("Updating assessment with soft skills:", softSkillIds);

  // Get the assessment ID to update
  const { data: assessmentData, error: assessmentFetchError } = await supabase
    .from('seeker_assessments')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (assessmentFetchError) {
    console.error("Error fetching assessment:", assessmentFetchError);
    throw assessmentFetchError;
  }

  if (assessmentData) {
    console.log("Updating assessment with ID:", assessmentData.id);
    const { error: assessmentError } = await supabase
      .from('seeker_assessments')
      .update({
        technical_skills: techSkillIds.length > 0 ? techSkillIds : null,
        soft_skills: softSkillIds.length > 0 ? softSkillIds : null,
        // Also update the experience field from work experience
        experience: data.workExperience.length > 0 ? data.workExperience[0].description : null
      })
      .eq('id', assessmentData.id);

    if (assessmentError) {
      console.error("Error updating assessment:", assessmentError);
      throw assessmentError;
    } else {
      console.log("Assessment updated successfully");
    }
  } else {
    console.log("No assessment found to update");
  }

  // Also update the user_skills table
  if (data.skills.length > 0) {
    try {
      // First delete existing skills
      console.log("Deleting existing user skills");
      const { error: deleteError } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error("Error deleting user skills:", deleteError);
        throw deleteError;
      }

      // Then insert new skills
      const skillsToInsert = data.skills.map(skill => ({
        user_id: user.id,
        skill_id: skill.id,
        skill_type: skill.type,
        assessment_id: assessmentData?.id
      }));
      
      console.log("Inserting user skills:", skillsToInsert);

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
    } catch (e) {
      console.error("Exception in user skills update:", e);
      // Don't fail the entire operation if user_skills update fails
    }
  }
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
