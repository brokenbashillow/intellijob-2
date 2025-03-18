
export interface FormData {
  education: string;
  experience: string;
  technicalSkills: string[];
  softSkills: string[];
  location: {
    country: string;
    province: string;
    city: string;
  };
}
