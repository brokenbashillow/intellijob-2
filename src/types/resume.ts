
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

export interface ResumeData {
  personalDetails: PersonalDetails;
  education: EducationItem[];
  workExperience: WorkExperienceItem[];
  certificates: CertificateItem[];
  references: ReferenceItem[];
}
