
import { useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useResumeData } from "@/hooks/useResumeData"
import JobList from "./JobList"
import JobTitleBadges from "./JobTitleBadges"
import JobFeedback from "./JobFeedback"

interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  postedAt: string
  platform: string
  url: string
  score?: number
  reason?: string
  field?: string
}

interface Skill {
  name: string
  level?: string
  category?: string
}

const RecommendedJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [userFields, setUserFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { personalDetails, skills, workExperience } = useResumeData();

  // Extract user skills and fields of interest from resume data
  useEffect(() => {
    if (skills && skills.length > 0) {
      const skillNames = skills.map((skill: Skill) => skill.name);
      const categories = skills
        .filter((skill: Skill) => skill.category)
        .map((skill: Skill) => skill.category as string);
      
      // Combine skills and categories into fields
      const fields = [...new Set([...skillNames, ...categories])];
      setUserFields(fields);
      
      // Set common job titles based on skills
      const technicalSkills = skills.filter((skill: Skill) => 
        ['programming', 'development', 'technical', 'data', 'engineering'].some(
          keyword => skill.category?.toLowerCase().includes(keyword) || 
                    skill.name.toLowerCase().includes(keyword)
        )
      );
      
      if (technicalSkills.length > 3) {
        setJobTitles(prev => [...new Set([...prev, 'Software Developer', 'Full Stack Developer', 'Data Analyst'])]);
      }
      
      if (skills.some((skill: Skill) => 
        skill.name.toLowerCase().includes('customer') || 
        skill.name.toLowerCase().includes('support') ||
        skill.name.toLowerCase().includes('service')
      )) {
        setJobTitles(prev => [...new Set([...prev, 'Customer Service Representative', 'Customer Support Specialist'])]);
      }
    }
    
    // Extract job titles from work experience
    if (workExperience && workExperience.length > 0) {
      const titles = workExperience.map(exp => exp.title || '').filter(Boolean);
      if (titles.length > 0) {
        setJobTitles(prev => [...new Set([...prev, ...titles])]);
      }
    }
  }, [skills, workExperience]);

  const fetchRecommendedJobs = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      // Fetch all jobs from our database
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Database error:", error);
        throw new Error(`Error fetching jobs: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        throw new Error("No jobs found in the database");
      }
      
      // Map the database jobs to our Job interface
      const mappedJobs: Job[] = data.map(job => ({
        id: job.id,
        title: job.title,
        company: "IntelliJob", // Standard company name for all internal jobs
        location: "Remote", // Default location
        description: job.description || "No description provided",
        postedAt: job.created_at || new Date().toISOString(),
        platform: "IntelliJob",
        url: `/job/${job.id}`,
        field: job.field,
        // If we have user fields, add a reason for recommendation if there's a match
        reason: userFields.some(field => 
          job.field?.toLowerCase().includes(field.toLowerCase()) ||
          (field && job.title.toLowerCase().includes(field.toLowerCase()))
        ) ? `Matched to your experience in ${userFields.find(field => 
            job.field?.toLowerCase().includes(field.toLowerCase()) ||
            (field && job.title.toLowerCase().includes(field.toLowerCase()))
          )}` : undefined
      }));
      
      // Score jobs based on match with user fields and skills
      const scoredJobs = mappedJobs.map(job => {
        let score = 0;
        
        // Score based on field match
        if (job.field && userFields.some(field => 
          job.field?.toLowerCase().includes(field.toLowerCase()) ||
          field.toLowerCase().includes(job.field?.toLowerCase() || '')
        )) {
          score += 5;
        }
        
        // Score based on title match with job titles extracted from experience
        if (jobTitles.some(title => 
          job.title.toLowerCase().includes(title.toLowerCase()) ||
          title.toLowerCase().includes(job.title.toLowerCase())
        )) {
          score += 3;
        }
        
        // Score based on skill matches in description or requirements
        if (skills && skills.length > 0) {
          const skillNames = skills.map((skill: Skill) => skill.name.toLowerCase());
          const jobText = `${job.title} ${job.description} ${job.field || ''}`.toLowerCase();
          
          skillNames.forEach(skill => {
            if (jobText.includes(skill)) {
              score += 1;
            }
          });
        }
        
        return { ...job, score };
      });
      
      // Sort by score (highest first)
      scoredJobs.sort((a, b) => (b.score || 0) - (a.score || 0));
      
      setJobs(scoredJobs);
      
      // If we don't have job titles yet, extract them from top scoring jobs
      if (jobTitles.length === 0 && scoredJobs.length > 0) {
        const topJobTitles = scoredJobs
          .slice(0, 3)
          .map(job => job.title)
          .filter(Boolean);
        
        setJobTitles(topJobTitles);
      }
    } catch (error: any) {
      console.error("Error fetching recommended jobs:", error);
      setErrorMessage("Failed to load job recommendations. Using default suggestions instead.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load job recommendations. Please try again later.",
      });
      
      // Set default jobs if we couldn't fetch from database
      setJobs([
        { 
          id: "fallback-1",
          title: "Frontend Developer", 
          company: "IntelliJob",
          location: "Remote", 
          description: "Join our team to build modern web applications using React, TypeScript, and other cutting-edge technologies.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#"
        },
        { 
          id: "fallback-2",
          title: "UX/UI Designer", 
          company: "IntelliJob",
          location: "Remote", 
          description: "Looking for a talented UX/UI designer to help create intuitive and engaging user experiences for digital products.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#"
        },
        { 
          id: "fallback-3",
          title: "Full Stack Engineer", 
          company: "IntelliJob",
          location: "Remote", 
          description: "Seeking a full stack developer with experience in React, Node.js, and database management to join our growing team.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#"
        },
      ]);
      
      if (jobTitles.length === 0) {
        setJobTitles(["Software Developer", "Web Developer", "Frontend Developer"]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRecommendedJobs();
  };

  useEffect(() => {
    fetchRecommendedJobs();
  }, [userFields]);

  if (isLoading) {
    return (
      <section className="mt-6">
        <h2 className="text-2xl font-bold mb-4 md:mb-6">Recommended Jobs</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  // Separate jobs into recommended (high scoring) and other jobs
  const recommendedJobs = jobs.filter(job => (job.score || 0) > 2);
  const otherJobs = jobs.filter(job => (job.score || 0) <= 2);

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-2xl font-bold">Recommended Jobs</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      
      <JobTitleBadges jobTitles={jobTitles} />
      
      {recommendedJobs.length > 0 && (
        <JobList 
          jobs={recommendedJobs} 
          title="Recommended Job Matches" 
          userFields={userFields} 
        />
      )}
      
      {otherJobs.length > 0 && (
        <JobList 
          jobs={otherJobs.slice(0, 6)} 
          title="Other Available Positions" 
          titleClassName="text-muted-foreground" 
        />
      )}
      
      {jobs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No job recommendations found. Try refreshing or update your profile with more details.
        </div>
      )}
      
      <JobFeedback jobTitles={jobTitles} />
    </section>
  );
};

export default RecommendedJobs;
