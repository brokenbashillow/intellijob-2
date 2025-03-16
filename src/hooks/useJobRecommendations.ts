
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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
}

export const useJobRecommendations = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { skills, workExperience } = useResumeData();
  const [userFields, setUserFields] = useState<string[]>([]);

  useEffect(() => {
    if (skills && skills.length > 0) {
      const skillNames = skills.map((skill) => skill.name);
      // Update this section to match the SkillItem type which doesn't have a 'category' property
      // Instead, use the 'type' property which is defined in the SkillItem interface
      const categories = skills
        .filter((skill) => skill.type)
        .map((skill) => skill.type);
      
      const fields = [...new Set([...skillNames, ...categories])];
      setUserFields(fields);
    }
  }, [skills]);

  const fetchJobPostings = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      console.log("Fetching job postings...");
      
      // Fetch all job postings from the database
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Database error:", error);
        throw new Error(`Error fetching jobs: ${error.message}`);
      }
      
      console.log("Job postings fetched:", data ? data.length : 0);
      
      if (!data || data.length === 0) {
        console.log("No jobs found, creating fallback jobs");
        // Instead of throwing an error, use fallback data directly
        setFallbackJobs();
        return;
      }
      
      // Map the database job postings to our Job interface
      const mappedJobs: Job[] = data.map(job => ({
        id: job.id,
        title: job.title || "Untitled Position",
        company: job.employer_id || "IntelliJob", // Use employer_id as fallback
        location: "Remote", // Default location since it doesn't exist in the table
        description: job.description || "No description provided",
        postedAt: job.created_at || new Date().toISOString(),
        platform: "IntelliJob",
        url: `/job/${job.id}`,
        field: job.field
      }));
      
      console.log("Mapped jobs:", mappedJobs.length);
      
      // Score the jobs based on user skills and experience
      const scoredJobs = mappedJobs.map(job => {
        let score = 0;
        let matchReason = "";
        
        // Check if job field matches user fields
        if (job.field && userFields.some(field => 
          job.field?.toLowerCase().includes(field.toLowerCase()) ||
          field.toLowerCase().includes(job.field?.toLowerCase() || '')
        )) {
          score += 5;
          const matchedField = userFields.find(field => 
            job.field?.toLowerCase().includes(field.toLowerCase()) ||
            field.toLowerCase().includes(job.field?.toLowerCase() || '')
          );
          matchReason = `Matched to your experience in ${matchedField}`;
        }
        
        // Check if job title matches user work experience
        if (workExperience && workExperience.length > 0) {
          const jobTitles = workExperience.map(exp => exp.title || '').filter(Boolean);
          
          if (jobTitles.some(title => 
            job.title.toLowerCase().includes(title.toLowerCase()) ||
            title.toLowerCase().includes(job.title.toLowerCase())
          )) {
            score += 3;
            if (!matchReason) {
              const matchedTitle = jobTitles.find(title => 
                job.title.toLowerCase().includes(title.toLowerCase()) ||
                title.toLowerCase().includes(job.title.toLowerCase())
              );
              matchReason = `Relevant to your experience as ${matchedTitle}`;
            }
          }
        }
        
        // Check if job mentions user skills
        if (skills && skills.length > 0) {
          const skillNames = skills.map((skill) => skill.name.toLowerCase());
          const jobText = `${job.title} ${job.description} ${job.field || ''}`.toLowerCase();
          
          const matchedSkills: string[] = [];
          skillNames.forEach(skill => {
            if (jobText.includes(skill)) {
              score += 1;
              matchedSkills.push(skill);
            }
          });
          
          if (matchedSkills.length > 0 && !matchReason) {
            matchReason = `Uses your skills: ${matchedSkills.slice(0, 2).join(', ')}${matchedSkills.length > 2 ? '...' : ''}`;
          }
        }
        
        return { 
          ...job, 
          score,
          reason: matchReason || "Potential match based on your profile"
        };
      });
      
      // Sort jobs by score in descending order
      scoredJobs.sort((a, b) => (b.score || 0) - (a.score || 0));
      console.log("Scored and sorted jobs:", scoredJobs.length);
      
      setJobs(scoredJobs);
    } catch (error: any) {
      console.error("Error fetching recommended jobs:", error);
      setErrorMessage("Failed to load job recommendations. Using default suggestions instead.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load job recommendations. Please try again later.",
      });
      
      // Set fallback jobs if we can't fetch from the database
      setFallbackJobs();
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const setFallbackJobs = () => {
    // Always set fallback jobs when there are no real ones
    setJobs([
      { 
        id: "fallback-1",
        title: "Frontend Developer", 
        company: "IntelliJob",
        location: "Remote", 
        description: "Join our team to build modern web applications using React, TypeScript, and other cutting-edge technologies.",
        postedAt: new Date().toISOString(), 
        platform: "fallback",
        url: "#",
        reason: "Example job recommendation"
      },
      { 
        id: "fallback-2",
        title: "UX/UI Designer", 
        company: "IntelliJob",
        location: "Remote", 
        description: "Looking for a talented UX/UI designer to help create intuitive and engaging user experiences for digital products.",
        postedAt: new Date().toISOString(), 
        platform: "fallback",
        url: "#",
        reason: "Example job recommendation"
      },
      { 
        id: "fallback-3",
        title: "Full Stack Engineer", 
        company: "IntelliJob",
        location: "Remote", 
        description: "Seeking a full stack developer with experience in React, Node.js, and database management to join our growing team.",
        postedAt: new Date().toISOString(), 
        platform: "fallback",
        url: "#",
        reason: "Example job recommendation"
      },
    ]);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchJobPostings();
  };

  useEffect(() => {
    fetchJobPostings();
  }, [userFields]);

  return {
    jobs,
    isLoading,
    isRefreshing,
    errorMessage,
    userFields,
    handleRefresh
  };
};
