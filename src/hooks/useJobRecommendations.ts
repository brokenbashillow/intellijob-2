import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createJobRecommendationNotification } from "@/services/notificationService";
import { useResumeData } from "@/hooks/useResumeData";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  postedAt: string;
  platform: string;
  url: string;
  score?: number;
  reason?: string;
  field?: string;
  salary?: string;
  requirements?: string;
  education?: string;
  aiAnalyzed?: boolean;
  aiRecommendation?: string;
  aiMatchScore?: number;
}

export const useJobRecommendations = (isEmployer = false) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { skills, workExperience, education, personalDetails, certificates, references } = useResumeData();
  const [userFields, setUserFields] = useState<string[]>([]);
  const [educationFields, setEducationFields] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<string>("");
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  useEffect(() => {
    if (skills && skills.length > 0) {
      const skillNames = skills.map((skill) => skill.name);
      const categories = skills
        .filter((skill) => skill.type)
        .map((skill) => skill.type);
      
      const fields = [...new Set([...skillNames, ...categories])];
      setUserFields(fields);
    }
    
    if (education && education.length > 0) {
      const degrees = education
        .filter(edu => edu.degree && edu.degree.trim() !== '')
        .map(edu => edu.degree.toLowerCase());
      
      setEducationFields(degrees);
    }

    const getUserLocation = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('country, province, city')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          const locationParts = [data.city, data.province, data.country].filter(Boolean);
          setUserLocation(locationParts.join(', ').toLowerCase());
        }
      } catch (error) {
        console.error("Error fetching user location:", error);
      }
    };

    getUserLocation();
  }, [skills, education]);

  const fetchJobs = useCallback(async (isRefresh = false) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      console.log("Fetching job postings...");
      
      const { data: jobPostingsData, error: jobPostingsError } = await supabase
        .from('job_postings')
        .select(`
          *,
          profiles:employer_id (
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (jobPostingsError) {
        console.error("Job postings database error:", jobPostingsError);
        throw new Error(`Error fetching jobs: ${jobPostingsError.message}`);
      }
      
      const { data: jobTemplatesData, error: jobTemplatesError } = await supabase
        .from('job_templates')
        .select('*');
        
      if (jobTemplatesError) {
        console.error("Job templates database error:", jobTemplatesError);
      }
      
      let allJobsData = [];
      
      if (jobPostingsData && jobPostingsData.length > 0) {
        console.log("Job postings fetched:", jobPostingsData.length);
        
        const mappedJobPostings: Job[] = jobPostingsData.map(job => ({
          id: job.id,
          title: job.title || "Untitled Position",
          company: job.profiles?.company_name || "IntelliJob",
          location: job.location || "Remote",
          description: job.description || "No description provided",
          postedAt: job.created_at || new Date().toISOString(),
          platform: "IntelliJob",
          url: `/job/${job.id}`,
          field: job.field,
          requirements: job.requirements,
          education: job.education,
          salary: job.salary
        }));
        
        allJobsData = mappedJobPostings;
      }
      
      if ((!jobPostingsData || jobPostingsData.length < 5) && jobTemplatesData && jobTemplatesData.length > 0 && !isEmployer) {
        console.log("Adding job templates:", jobTemplatesData.length);
        
        const mappedJobTemplates: Job[] = jobTemplatesData.map(template => ({
          id: `template-${template.id}`,
          title: template.title,
          company: template.company,
          location: template.location,
          description: template.requirements || "No description provided",
          postedAt: template.created_at || new Date().toISOString(),
          platform: "Template",
          url: "#",
          field: template.field,
          salary: template.salary,
          education: template.education
        }));
        
        allJobsData = [...allJobsData, ...mappedJobTemplates];
      }
      
      if (allJobsData.length === 0 && !isEmployer) {
        console.log("No jobs found, creating fallback jobs");
        setFallbackJobs();
        return;
      }
      
      console.log("Total jobs data combined:", allJobsData.length);
      
      const scoredJobs = allJobsData.map(job => {
        let score = 0;
        let matchReasons: string[] = [];

        const hasEducationMatch = checkEducationMatch(job);
        if (hasEducationMatch.match) {
          score += hasEducationMatch.score;
          matchReasons.push(hasEducationMatch.reason);
        }
        
        const hasFieldMatch = checkFieldMatch(job);
        if (hasFieldMatch.match) {
          score += hasFieldMatch.score;
          if (!matchReasons.includes(hasFieldMatch.reason)) {
            matchReasons.push(hasFieldMatch.reason);
          }
        }
        
        const hasSkillsMatch = checkSkillsMatch(job);
        if (hasSkillsMatch.match) {
          score += hasSkillsMatch.score;
          matchReasons.push(hasSkillsMatch.reason);
        }
        
        const hasExperienceMatch = checkExperienceMatch(job);
        if (hasExperienceMatch.match) {
          score += hasExperienceMatch.score;
          matchReasons.push(hasExperienceMatch.reason);
        }
        
        const hasLocationMatch = checkLocationMatch(job);
        if (hasLocationMatch.match) {
          score += hasLocationMatch.score;
          matchReasons.push(hasLocationMatch.reason);
        }
        
        if (certificates && certificates.length > 0) {
          score += Math.min(certificates.length * 2, 10);
          matchReasons.push(`You have ${certificates.length} relevant certification(s)`);
        }
        
        if (references && references.length > 0) {
          score += Math.min(references.length, 5);
        }
        
        const primaryReason = matchReasons.length > 0 
          ? matchReasons[0] 
          : "Potential match based on your profile";
          
        return { 
          ...job, 
          score,
          reason: primaryReason
        };
      });
      
      scoredJobs.sort((a, b) => (b.score || 0) - (a.score || 0));
      console.log("Scored and sorted jobs:", scoredJobs.length);
      
      setJobs(scoredJobs);
      
      if (educationFields.length > 0 || userFields.length > 0) {
        enhanceJobsWithAI(scoredJobs);
      }
      
      if (isRefresh && jobPostingsData && jobPostingsData.length > 0) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await createJobRecommendationNotification(userData.user.id);
        }
      }
      
    } catch (error: any) {
      console.error("Error fetching recommended jobs:", error);
      setErrorMessage("Failed to load job recommendations. Using default suggestions instead.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load job recommendations. Please try again later.",
      });
      
      if (!isEmployer) {
        setFallbackJobs();
      } else {
        setJobs([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [skills, education, userFields, educationFields, userLocation, isEmployer]);

  const enhanceJobsWithAI = async (scoredJobs: Job[]) => {
    try {
      setIsAiAnalyzing(true);
      
      const topJobsToAnalyze = scoredJobs.slice(0, Math.min(5, scoredJobs.length));
      
      const userProfile = {
        education: educationFields,
        skills: userFields,
        experience: workExperience?.map(exp => exp.title) || [],
        industry: personalDetails?.industry || "",
      };
      
      console.log("Analyzing jobs with AI:", topJobsToAnalyze.length);
      
      for (const job of topJobsToAnalyze) {
        const jobDetails = {
          title: job.title,
          description: job.description || "",
          requirements: job.requirements || "",
          field: job.field || "",
          education: job.education || "",
        };
        
        const promptContent = `
        You are an expert job compatibility analyst.
        
        USER PROFILE:
        - Education: ${userProfile.education.join(', ')}
        - Skills: ${userProfile.skills.join(', ')}
        - Experience: ${userProfile.experience.join(', ')}
        - Industry: ${userProfile.industry}
        
        JOB DETAILS:
        - Title: ${jobDetails.title}
        - Field: ${jobDetails.field}
        - Required Education: ${jobDetails.education}
        - Description: ${jobDetails.description}
        - Requirements: ${jobDetails.requirements}
        
        Task: Analyze if this job is a good match for the user's profile.
        1. Give a match score from 0-100
        2. Provide a specific reason for the score
        3. Is the job title aligned with user's education and skills? (Yes/No)
        4. Is the user qualified for this position? (Yes/No/Partially)
        
        Format your response exactly like this:
        Score: [number]
        Reason: [brief reason]
        Title Alignment: [Yes/No]
        Qualified: [Yes/No/Partially]
        `;
        
        try {
          const response = await supabase.functions.invoke('gemini', {
            body: { prompt: promptContent }
          });
          
          if (response.error) {
            console.error("AI analysis error:", response.error);
            continue;
          }
          
          const aiResponse = response.data.choices[0].message.content;
          console.log("AI Job Analysis:", aiResponse);
          
          const scoreMatch = aiResponse.match(/Score:\s*(\d+)/i);
          const reasonMatch = aiResponse.match(/Reason:\s*(.+?)(?=\n|$)/i);
          const alignmentMatch = aiResponse.match(/Title Alignment:\s*(Yes|No)/i);
          const qualifiedMatch = aiResponse.match(/Qualified:\s*(Yes|No|Partially)/i);
          
          const aiScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;
          const aiReason = reasonMatch ? reasonMatch[1].trim() : "";
          const titleAligned = alignmentMatch ? alignmentMatch[1].toLowerCase() === 'yes' : false;
          const isQualified = qualifiedMatch ? qualifiedMatch[1] : "No";
          
          setJobs(prevJobs => {
            return prevJobs.map(prevJob => {
              if (prevJob.id === job.id) {
                return {
                  ...prevJob,
                  aiAnalyzed: true,
                  aiMatchScore: aiScore,
                  aiRecommendation: aiReason,
                  score: titleAligned ? (prevJob.score || 0) + Math.floor(aiScore / 5) : prevJob.score,
                  reason: (aiScore > 80 || aiScore < 30) ? aiReason : prevJob.reason
                };
              }
              return prevJob;
            });
          });
        } catch (error) {
          console.error(`Error analyzing job ${job.title}:`, error);
          continue;
        }
      }
    } catch (error) {
      console.error("Error in AI job enhancement:", error);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const checkEducationMatch = (job: Job) => {
    const result = { match: false, score: 0, reason: "" };
    
    if (!job.education || !educationFields.length) return result;
    
    const jobEducation = job.education.toLowerCase();
    
    const matchedDegree = educationFields.find(degree => 
      jobEducation.includes(degree) || degree.includes(jobEducation)
    );
    
    if (matchedDegree) {
      result.match = true;
      result.score = 20;
      result.reason = `Your ${matchedDegree} degree matches the job requirements`;
    } else if (personalDetails?.educationField && 
               jobEducation.includes(personalDetails.educationField.toLowerCase())) {
      result.match = true;
      result.score = 15;
      result.reason = `Your education field (${personalDetails.educationField}) matches the job`;
    }
    
    return result;
  };
  
  const checkFieldMatch = (job: Job) => {
    const result = { match: false, score: 0, reason: "" };
    
    if (!job.field) return result;
    
    const hasHealthcareEducation = educationFields.some(degree => 
      /nursing|bs nursing|bachelor of science in nursing|bsn|rn|healthcare|medical|health|medicine|pharma|dental/i.test(degree)
    );
    
    const hasBusinessEducation = educationFields.some(degree => 
      /business|finance|accounting|marketing|management|mba|economics/i.test(degree)
    );
    
    const hasEngineeringEducation = educationFields.some(degree => 
      /engineering|computer science|information technology|software|it|programming|development/i.test(degree)
    );
    
    const hasEducationEducation = educationFields.some(degree => 
      /education|teaching|pedagogy|instructional/i.test(degree)
    );
    
    const hasArtsEducation = educationFields.some(degree => 
      /arts|design|creative|music|film|theater|media/i.test(degree)
    );
    
    if (hasHealthcareEducation && 
        /nurse|nursing|healthcare|medical|clinical|patient|health|hospital|doctor|pharma/i.test(`${job.title} ${job.field}`)) {
      result.match = true;
      result.score = 15;
      result.reason = "Matches your nursing/healthcare education";
    } else if (hasBusinessEducation && 
        /business|finance|accounting|marketing|management|analyst|consultant/i.test(`${job.title} ${job.field}`)) {
      result.match = true;
      result.score = 10;
      result.reason = "Matches your business education";
    } else if (hasEngineeringEducation && 
        /engineer|developer|software|IT|programming|technical|technology/i.test(`${job.title} ${job.field}`)) {
      result.match = true;
      result.score = 10;
      result.reason = "Matches your technical education";
    } else if (hasEducationEducation && 
        /teacher|professor|instructor|educator|tutor|school|education/i.test(`${job.title} ${job.field}`)) {
      result.match = true;
      result.score = 10;
      result.reason = "Matches your education background";
    } else if (hasArtsEducation && 
        /design|creative|artist|writer|content|media|art/i.test(`${job.title} ${job.field}`)) {
      result.match = true;
      result.score = 10;
      result.reason = "Matches your creative education";
    }
    
    if (!result.match && personalDetails?.industry) {
      const jobFieldLower = job.field.toLowerCase();
      const userIndustryLower = personalDetails.industry.toLowerCase();
      
      if (jobFieldLower.includes(userIndustryLower) || 
          userIndustryLower.includes(jobFieldLower)) {
        result.match = true;
        result.score = 10;
        result.reason = `Matches your industry: ${personalDetails.industry}`;
      }
    }
    
    return result;
  };
  
  const checkSkillsMatch = (job: Job) => {
    const result = { match: false, score: 0, reason: "" };
    
    if (!skills || skills.length === 0) return result;
    
    const jobText = `${job.title} ${job.description || ''} ${job.requirements || ''} ${job.field || ''}`.toLowerCase();
    const skillNames = skills.map(skill => skill.name.toLowerCase());
    
    const matchedSkills = skillNames.filter(skill => jobText.includes(skill));
    
    if (matchedSkills.length > 0) {
      result.match = true;
      result.score = Math.min(matchedSkills.length * 2, 15);
      
      const topSkills = matchedSkills.slice(0, 2).join(', ');
      result.reason = `Uses your skills: ${topSkills}${matchedSkills.length > 2 ? '...' : ''}`;
    }
    
    return result;
  };
  
  const checkExperienceMatch = (job: Job) => {
    const result = { match: false, score: 0, reason: "" };
    
    if (!workExperience || workExperience.length === 0) return result;
    
    const jobTitle = job.title.toLowerCase();
    const jobExp = workExperience.find(exp => {
      const expTitle = (exp.title || '').toLowerCase();
      return jobTitle.includes(expTitle) || expTitle.includes(jobTitle);
    });
    
    if (jobExp) {
      result.match = true;
      result.score = 10;
      result.reason = `Relevant to your experience as ${jobExp.title}`;
    }
    
    return result;
  };
  
  const checkLocationMatch = (job: Job) => {
    const result = { match: false, score: 0, reason: "" };
    
    if (!userLocation || !job.location) return result;
    
    if (job.location === "Remote") {
      result.match = true;
      result.score = 5;
      result.reason = "Remote work opportunity";
      return result;
    }
    
    const jobLocation = job.location.toLowerCase();
    
    const userLocationParts = userLocation.split(',').map(part => part.trim());
    const jobLocationParts = jobLocation.split(',').map(part => part.trim());
    
    const locationOverlap = userLocationParts.some(userPart => 
      jobLocationParts.some(jobPart => 
        userPart === jobPart || userPart.includes(jobPart) || jobPart.includes(userPart)
      )
    );
    
    if (locationOverlap) {
      result.match = true;
      result.score = 10;
      result.reason = "Located near you";
    }
    
    return result;
  };

  const setFallbackJobs = () => {
    if (isEmployer) {
      setJobs([]);
      return;
    }
    
    const hasMedicalEducation = educationFields.some(degree => 
      /nursing|bs nursing|bachelor of science in nursing|bsn|rn|healthcare|medical|health|medicine|pharma|dental/i.test(degree)
    );
    
    if (hasMedicalEducation) {
      setJobs([
        { 
          id: "fallback-1",
          title: "Registered Nurse", 
          company: "St. Luke's Medical Center",
          location: "Quezon City, Philippines", 
          description: "Join our nursing team to provide high-quality patient care. We're seeking licensed RNs with excellent communication skills and a compassionate approach to healthcare.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Healthcare",
          reason: "Matches your nursing education",
          salary: "PHP 35,000–45,000/month"
        },
        { 
          id: "fallback-2",
          title: "Medical Laboratory Technician", 
          company: "Philippine General Hospital",
          location: "Manila, Philippines", 
          description: "Perform laboratory tests and procedures to assist in the diagnosis, treatment, and prevention of disease. Work with sophisticated lab equipment to analyze samples.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Healthcare",
          reason: "Related to your healthcare background",
          salary: "PHP 28,000–35,000/month"
        },
        { 
          id: "fallback-3",
          title: "Physical Therapist", 
          company: "MediRehab Center",
          location: "Cebu City, Philippines", 
          description: "Help patients improve their mobility and manage pain through therapeutic exercises and techniques. Develop personalized rehabilitation programs.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Healthcare",
          reason: "Builds on your healthcare expertise",
          salary: "PHP 30,000–40,000/month"
        },
        { 
          id: "fallback-4",
          title: "Medical Coder", 
          company: "Health First Solutions",
          location: "Makati, Philippines", 
          description: "Translate medical diagnoses and procedures into standardized codes for billing and record-keeping purposes. Ensure accurate documentation for healthcare services.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Healthcare Administration",
          reason: "Leverages your medical knowledge in an administrative role",
          salary: "PHP 32,000–38,000/month"
        },
        { 
          id: "fallback-5",
          title: "Emergency Medical Technician (EMT)", 
          company: "LifeCare Ambulance Services",
          location: "Quezon City, Philippines", 
          description: "Provide emergency medical assistance to patients in critical situations. Respond to emergency calls and transport patients to medical facilities.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Emergency Medicine",
          reason: "Aligns with your healthcare training",
          salary: "PHP 28,000–33,000/month"
        },
        { 
          id: "fallback-6",
          title: "Nursing Educator", 
          company: "Medical Training Institute",
          location: "Remote", 
          description: "Train the next generation of nurses as an instructor in clinical and classroom settings. Advanced degree and clinical experience required.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Education",
          reason: "Opportunity to share your nursing knowledge",
          salary: "PHP 40,000–50,000/month"
        },
        { 
          id: "fallback-7",
          title: "Healthcare Consultant", 
          company: "Medical Advisory Group",
          location: "Remote", 
          description: "Apply your nursing expertise to help healthcare organizations improve processes, patient outcomes, and regulatory compliance.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Consulting",
          reason: "Strategic role leveraging your healthcare background",
          salary: "PHP 50,000–65,000/month"
        },
        { 
          id: "fallback-8",
          title: "Nurse Practitioner", 
          company: "Family Health Clinic",
          location: "Remote", 
          description: "Advanced practice position for a certified Nurse Practitioner. Responsibilities include patient assessment, diagnosis, treatment planning, and preventive care education.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Healthcare",
          reason: "Advanced nursing role for career growth",
          salary: "PHP 45,000–60,000/month"
        }
      ]);
    } else {
      setJobs([
        { 
          id: "fallback-1",
          title: "Marketing Specialist", 
          company: "Global Brands Inc.",
          location: "Remote", 
          description: "Join our marketing team to develop and implement digital marketing strategies that drive customer engagement and brand awareness. Experience with social media management and content creation required.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Marketing",
          reason: "Suggested based on your profile"
        },
        { 
          id: "fallback-2",
          title: "Data Scientist", 
          company: "Analytics Solutions",
          location: "Remote", 
          description: "Looking for a skilled data scientist to analyze large datasets and build predictive models. Experience with Python, R, and machine learning frameworks required.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Data Science",
          reason: "Matches your technical skills"
        },
        { 
          id: "fallback-3",
          title: "UX/UI Designer", 
          company: "Creative Digital Agency",
          location: "Remote", 
          description: "Design intuitive and engaging user experiences for web and mobile applications. Proficiency in Figma, Adobe XD, and user research methodologies is essential.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Design",
          reason: "Aligns with your design experience"
        },
        { 
          id: "fallback-4",
          title: "Project Manager", 
          company: "Innovative Solutions",
          location: "Remote", 
          description: "Lead cross-functional teams to deliver successful projects on time and within budget. Strong communication, organization, and stakeholder management skills required.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Project Management",
          reason: "Relevant to your leadership experience"
        },
        { 
          id: "fallback-5",
          title: "Financial Analyst", 
          company: "Global Investment Partners",
          location: "Remote", 
          description: "Analyze financial data, prepare reports, and provide recommendations to support business decision-making. Strong Excel skills and financial modeling experience required.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Finance",
          reason: "Suggested based on market demand"
        },
        { 
          id: "fallback-6",
          title: "Content Writer", 
          company: "Media Publishing Group",
          location: "Remote", 
          description: "Create compelling content across various platforms including blogs, articles, and social media. Strong writing skills and SEO knowledge required.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Content Creation",
          reason: "Matches your communication skills"
        },
        { 
          id: "fallback-7",
          title: "Human Resources Specialist", 
          company: "People First HR",
          location: "Remote", 
          description: "Support talent acquisition, employee relations, and HR policy implementation. Experience with HRIS systems and knowledge of employment laws required.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Human Resources",
          reason: "Growing field with opportunities"
        },
        { 
          id: "fallback-8",
          title: "Product Manager", 
          company: "Tech Innovations Ltd",
          location: "Remote", 
          description: "Lead product development from conception to launch, working closely with engineering, design, and marketing teams. Experience with agile methodologies required.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#",
          field: "Product Management",
          reason: "Aligns with your strategic thinking skills"
        }
      ]);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchJobs(true);
  }, [fetchJobs]);

  useEffect(() => {
    fetchJobs();
  }, [userFields, educationFields, userLocation, isEmployer]);

  return {
    jobs,
    isLoading,
    isRefreshing,
    isAiAnalyzing,
    errorMessage,
    userFields,
    handleRefresh
  };
};
