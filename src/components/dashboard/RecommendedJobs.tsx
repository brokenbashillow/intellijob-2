
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
  title: string
  company: string
  location: string
  description: string
  postedAt: string
  platform: string
  url: string
  score?: number
  reason?: string
}

const RecommendedJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiErrorDetails, setApiErrorDetails] = useState<string | null>(null);
  const { toast } = useToast();
  const { personalDetails } = useResumeData();

  const fetchRecommendedJobs = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setApiErrorDetails(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log("Calling recommend-jobs function with userId:", user.id);
      
      const { data, error } = await supabase.functions.invoke('recommend-jobs', {
        body: { userId: user.id }
      });

      if (error) {
        console.error("Function error:", error);
        throw new Error(`Error calling recommend-jobs function: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("No data returned from the recommend-jobs function");
      }
      
      console.log("Jobs API response:", data);
      
      if (data.jobs && data.jobs.length > 0) {
        const allFallbacks = data.jobs.every((job: Job) => job.platform === "Example" || job.platform === "fallback");
        
        if (allFallbacks && data.error) {
          setApiErrorDetails(`API Error: ${data.error}`);
          console.warn("All jobs are fallbacks with error:", data.error);
        }
        
        setJobs(data.jobs);
        if (data.jobTitles && Array.isArray(data.jobTitles)) {
          setJobTitles(data.jobTitles);
        }
      } else {
        setJobs(data.jobs || []);
        setErrorMessage("No job recommendations found that match your profile. We're showing some default suggestions instead.");
      }
      
      if (data.error) {
        console.warn("API returned an error but also fallback data:", data.error);
        setErrorMessage(`Note: Using fallback job recommendations. (${data.error})`);
      }
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
          title: "Frontend Developer", 
          company: "Tech Solutions Inc",
          location: "San Francisco, CA", 
          description: "Join our team to build modern web applications using React, TypeScript, and other cutting-edge technologies. Remote options available.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#"
        },
        { 
          title: "UX/UI Designer", 
          company: "Creative Studio",
          location: "New York, NY", 
          description: "Looking for a talented UX/UI designer to help create intuitive and engaging user experiences for our clients' digital products.",
          postedAt: new Date().toISOString(), 
          platform: "fallback",
          url: "#"
        },
        { 
          title: "Full Stack Engineer", 
          company: "InnovateApp",
          location: "Remote", 
          description: "Seeking a full stack developer with experience in React, Node.js, and database management to join our growing engineering team.",
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
  }, [toast, personalDetails]);

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

  const liveJobs = jobs.filter(job => job.platform !== "Example" && job.platform !== "fallback");
  const fallbackJobs = jobs.filter(job => job.platform === "Example" || job.platform === "fallback");

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
      
      {apiErrorDetails && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {apiErrorDetails}
          <p className="mt-2 text-xs">Using fallback job recommendations due to API error.</p>
        </div>
      )}
      
      <JobTitleBadges jobTitles={jobTitles} />
      
      {liveJobs.length > 0 && <JobList jobs={liveJobs} title="Live Job Listings" />}
      
      {fallbackJobs.length > 0 && (
        <JobList 
          jobs={fallbackJobs} 
          title="Example Job Listings" 
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
