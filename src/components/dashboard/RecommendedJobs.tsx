
import { useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useResumeData } from "@/hooks/useResumeData"
import JobList from "./JobList"
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
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { personalDetails, skills, workExperience } = useResumeData();
  const [userFields, setUserFields] = useState<string[]>([]);

  useEffect(() => {
    if (skills && skills.length > 0) {
      const skillNames = skills.map((skill: Skill) => skill.name);
      const categories = skills
        .filter((skill: Skill) => skill.category)
        .map((skill: Skill) => skill.category as string);
      
      const fields = [...new Set([...skillNames, ...categories])];
      setUserFields(fields);
    }
  }, [skills]);

  const fetchJobPostings = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
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
      
      const mappedJobs: Job[] = data.map(job => ({
        id: job.id,
        title: job.title,
        company: "IntelliJob",
        location: "Remote",
        description: job.description || "No description provided",
        postedAt: job.created_at || new Date().toISOString(),
        platform: "IntelliJob",
        url: `/job/${job.id}`,
        field: job.field,
        reason: userFields.some(field => 
          job.field?.toLowerCase().includes(field.toLowerCase()) ||
          (field && job.title.toLowerCase().includes(field.toLowerCase()))
        ) ? `Matched to your experience in ${userFields.find(field => 
            job.field?.toLowerCase().includes(field.toLowerCase()) ||
            (field && job.title.toLowerCase().includes(field.toLowerCase()))
          )}` : undefined
      }));
      
      const scoredJobs = mappedJobs.map(job => {
        let score = 0;
        
        if (job.field && userFields.some(field => 
          job.field?.toLowerCase().includes(field.toLowerCase()) ||
          field.toLowerCase().includes(job.field?.toLowerCase() || '')
        )) {
          score += 5;
        }
        
        if (workExperience && workExperience.length > 0) {
          const jobTitles = workExperience.map(exp => exp.title || '').filter(Boolean);
          
          if (jobTitles.some(title => 
            job.title.toLowerCase().includes(title.toLowerCase()) ||
            title.toLowerCase().includes(job.title.toLowerCase())
          )) {
            score += 3;
          }
        }
        
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
      
      scoredJobs.sort((a, b) => (b.score || 0) - (a.score || 0));
      
      setJobs(scoredJobs);
    } catch (error: any) {
      console.error("Error fetching recommended jobs:", error);
      setErrorMessage("Failed to load job recommendations. Using default suggestions instead.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load job recommendations. Please try again later.",
      });
      
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
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchJobPostings();
  };

  useEffect(() => {
    fetchJobPostings();
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

  // Only show the top 3 job recommendations
  const recommendedJobs = jobs.slice(0, 3);

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
      
      {recommendedJobs.length > 0 ? (
        <JobList 
          jobs={recommendedJobs} 
          title="Top Matches For You" 
          userFields={userFields} 
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No job recommendations found. Try refreshing or update your profile with more details.
        </div>
      )}
      
      <JobFeedback />
    </section>
  );
};

export default RecommendedJobs;
