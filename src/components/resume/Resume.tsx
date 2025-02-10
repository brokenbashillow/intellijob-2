
import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { User, Book, Briefcase, Award, Star, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EducationItem {
  degree: string;
  school: string;
  startDate: string;
  endDate: string;
}

interface WorkExperienceItem {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface CertificateItem {
  name: string;
  organization: string;
  dateObtained: string;
}

interface ReferenceItem {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
}

const Resume = () => {
  const { toast } = useToast();
  const [personalDetails, setPersonalDetails] = useState({
    firstName: "",
    lastName: "",
    profilePicture: "",
  });
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperienceItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResumeData();
    fetchAssessmentData();
  }, []);

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
        
        // Parse the arrays into their respective object types
        setEducation(resumeData.education?.map((edu: any) => {
          if (typeof edu === 'string') {
            return {
              degree: edu,
              school: "",
              startDate: "",
              endDate: "",
            };
          }
          return edu;
        }) || []);

        setWorkExperience(resumeData.work_experience?.map((exp: any) => {
          if (typeof exp === 'string') {
            return {
              company: "",
              title: exp,
              startDate: "",
              endDate: "",
              description: "",
            };
          }
          return exp;
        }) || []);

        setCertificates(resumeData.certificates?.map((cert: any) => {
          if (typeof cert === 'string') {
            return {
              name: cert,
              organization: "",
              dateObtained: "",
            };
          }
          return cert;
        }) || []);

        setReferences(resumeData.reference_list?.map((ref: any) => {
          if (typeof ref === 'string') {
            return {
              name: ref,
              title: "",
              company: "",
              email: "",
              phone: "",
            };
          }
          return ref;
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
        // Convert assessment education to resume format
        const educationItem: EducationItem = {
          degree: assessmentData.education,
          school: "",
          startDate: "",
          endDate: "",
        };

        // Convert assessment experience to resume format
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

      // Upload image to Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-6">Resume Builder</h2>
      
      <Accordion type="single" collapsible defaultValue="personal-details">
        {/* Personal Details Section */}
        <AccordionItem value="personal-details">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Details
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={personalDetails.profilePicture} />
                    <AvatarFallback>
                      {personalDetails.firstName?.[0]}{personalDetails.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <Input
                    placeholder="First Name"
                    value={personalDetails.firstName}
                    onChange={(e) =>
                      setPersonalDetails((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Last Name"
                    value={personalDetails.lastName}
                    onChange={(e) =>
                      setPersonalDetails((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Education Section */}
        <AccordionItem value="education">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Education
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              {education.map((edu, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <Input
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => {
                      const newEducation = [...education];
                      newEducation[index].degree = e.target.value;
                      setEducation(newEducation);
                    }}
                  />
                  <Input
                    placeholder="School Name"
                    value={edu.school}
                    onChange={(e) => {
                      const newEducation = [...education];
                      newEducation[index].school = e.target.value;
                      setEducation(newEducation);
                    }}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="date"
                      value={edu.startDate}
                      onChange={(e) => {
                        const newEducation = [...education];
                        newEducation[index].startDate = e.target.value;
                        setEducation(newEducation);
                      }}
                    />
                    <Input
                      type="date"
                      value={edu.endDate}
                      onChange={(e) => {
                        const newEducation = [...education];
                        newEducation[index].endDate = e.target.value;
                        setEducation(newEducation);
                      }}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const newEducation = education.filter((_, i) => i !== index);
                      setEducation(newEducation);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEducation([
                    ...education,
                    { degree: "", school: "", startDate: "", endDate: "" },
                  ]);
                }}
              >
                Add Education
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Work Experience Section */}
        <AccordionItem value="work-experience">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Work Experience
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              {workExperience.map((exp, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <Input
                    placeholder="Company Name"
                    value={exp.company}
                    onChange={(e) => {
                      const newExperience = [...workExperience];
                      newExperience[index].company = e.target.value;
                      setWorkExperience(newExperience);
                    }}
                  />
                  <Input
                    placeholder="Job Title"
                    value={exp.title}
                    onChange={(e) => {
                      const newExperience = [...workExperience];
                      newExperience[index].title = e.target.value;
                      setWorkExperience(newExperience);
                    }}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) => {
                        const newExperience = [...workExperience];
                        newExperience[index].startDate = e.target.value;
                        setWorkExperience(newExperience);
                      }}
                    />
                    <Input
                      type="date"
                      value={exp.endDate}
                      onChange={(e) => {
                        const newExperience = [...workExperience];
                        newExperience[index].endDate = e.target.value;
                        setWorkExperience(newExperience);
                      }}
                    />
                  </div>
                  <Textarea
                    placeholder="Job Description"
                    value={exp.description}
                    onChange={(e) => {
                      const newExperience = [...workExperience];
                      newExperience[index].description = e.target.value;
                      setWorkExperience(newExperience);
                    }}
                  />
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const newExperience = workExperience.filter((_, i) => i !== index);
                      setWorkExperience(newExperience);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setWorkExperience([
                    ...workExperience,
                    { company: "", title: "", startDate: "", endDate: "", description: "" },
                  ]);
                }}
              >
                Add Work Experience
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Certificates Section */}
        <AccordionItem value="certificates">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificates
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              {certificates.map((cert, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <Input
                    placeholder="Certificate Name"
                    value={cert.name}
                    onChange={(e) => {
                      const newCertificates = [...certificates];
                      newCertificates[index].name = e.target.value;
                      setCertificates(newCertificates);
                    }}
                  />
                  <Input
                    placeholder="Issuing Organization"
                    value={cert.organization}
                    onChange={(e) => {
                      const newCertificates = [...certificates];
                      newCertificates[index].organization = e.target.value;
                      setCertificates(newCertificates);
                    }}
                  />
                  <Input
                    type="date"
                    value={cert.dateObtained}
                    onChange={(e) => {
                      const newCertificates = [...certificates];
                      newCertificates[index].dateObtained = e.target.value;
                      setCertificates(newCertificates);
                    }}
                  />
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const newCertificates = certificates.filter((_, i) => i !== index);
                      setCertificates(newCertificates);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCertificates([
                    ...certificates,
                    { name: "", organization: "", dateObtained: "" },
                  ]);
                }}
              >
                Add Certificate
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* References Section */}
        <AccordionItem value="references">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              References
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              {references.map((ref, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <Input
                    placeholder="Reference Name"
                    value={ref.name}
                    onChange={(e) => {
                      const newReferences = [...references];
                      newReferences[index].name = e.target.value;
                      setReferences(newReferences);
                    }}
                  />
                  <Input
                    placeholder="Job Title"
                    value={ref.title}
                    onChange={(e) => {
                      const newReferences = [...references];
                      newReferences[index].title = e.target.value;
                      setReferences(newReferences);
                    }}
                  />
                  <Input
                    placeholder="Company"
                    value={ref.company}
                    onChange={(e) => {
                      const newReferences = [...references];
                      newReferences[index].company = e.target.value;
                      setReferences(newReferences);
                    }}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={ref.email}
                    onChange={(e) => {
                      const newReferences = [...references];
                      newReferences[index].email = e.target.value;
                      setReferences(newReferences);
                    }}
                  />
                  <Input
                    placeholder="Phone Number"
                    type="tel"
                    value={ref.phone}
                    onChange={(e) => {
                      const newReferences = [...references];
                      newReferences[index].phone = e.target.value;
                      setReferences(newReferences);
                    }}
                  />
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const newReferences = references.filter((_, i) => i !== index);
                      setReferences(newReferences);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setReferences([
                    ...references,
                    { name: "", title: "", company: "", email: "", phone: "" },
                  ]);
                }}
              >
                Add Reference
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSave}>Save Resume</Button>
      </div>
    </div>
  );
};

export default Resume;
