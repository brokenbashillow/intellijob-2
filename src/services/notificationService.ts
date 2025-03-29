
import { supabase } from "@/integrations/supabase/client";
import { NotificationType } from "@/hooks/useNotifications";

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType
) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        read: false
      });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const createAssessmentNotification = async (userId: string) => {
  return createNotification(
    userId,
    'New Assessment Results',
    'Your skills assessment has been updated with new insights.',
    'assessment'
  );
};

export const createJobRecommendationNotification = async (userId: string) => {
  return createNotification(
    userId,
    'New Job Recommendations',
    'We found new job opportunities that match your profile.',
    'job'
  );
};

export const createApplicantNotification = async (
  employerId: string, 
  jobTitle: string
) => {
  return createNotification(
    employerId,
    'New Job Applicant',
    `Someone has applied to your "${jobTitle}" position.`,
    'applicant'
  );
};
