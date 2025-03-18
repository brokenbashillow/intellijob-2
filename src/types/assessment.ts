
export interface FormData {
  education: string;
  experience: string;
  location: {
    country: string;
    province: string;
    city: string;
  };
  technicalSkills: string[];
  softSkills: string[];
}
