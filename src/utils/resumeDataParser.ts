
import { EducationItem, WorkExperienceItem, CertificateItem, ReferenceItem } from "@/types/resume";

export const parseEducationData = (eduString: string): EducationItem => {
  try {
    const parsed = JSON.parse(eduString);
    return {
      degree: parsed.degree || "",
      school: parsed.school || "",
      startDate: parsed.startDate || "",
      endDate: parsed.endDate || "",
    };
  } catch {
    return {
      degree: "",
      school: "",
      startDate: "",
      endDate: "",
    };
  }
};

export const parseWorkExperience = (expString: string): WorkExperienceItem => {
  try {
    const parsed = JSON.parse(expString);
    return {
      company: parsed.company || "",
      title: parsed.title || "",
      startDate: parsed.startDate || "",
      endDate: parsed.endDate || "",
      description: parsed.description || "",
    };
  } catch {
    return {
      company: "",
      title: "",
      startDate: "",
      endDate: "",
      description: "",
    };
  }
};

export const parseCertificate = (certString: string): CertificateItem => {
  try {
    const parsed = JSON.parse(certString);
    return {
      name: parsed.name || "",
      organization: parsed.organization || "",
      dateObtained: parsed.dateObtained || "",
    };
  } catch {
    return {
      name: "",
      organization: "",
      dateObtained: "",
    };
  }
};

export const parseReference = (refString: string): ReferenceItem => {
  try {
    const parsed = JSON.parse(refString);
    return {
      name: parsed.name || "",
      title: parsed.title || "",
      company: parsed.company || "",
      email: parsed.email || "",
      phone: parsed.phone || "",
    };
  } catch {
    return {
      name: "",
      title: "",
      company: "",
      email: "",
      phone: "",
    };
  }
};
