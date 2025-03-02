import { useEffect, useState } from "react"
import { ExternalLink, Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useResumeData } from "@/hooks/useResumeData"
import { Textarea } from "@/components/ui/textarea"

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

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

const RecommendedJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiErrorDetails, setApiErrorDetails] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
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

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;
    
    setIsSendingFeedback(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      await supabase.functions.invoke('job-feedback', {
        body: { 
          userId: user.id,
          feedback,
          jobTitles
        }
      });
      
      toast({
        title: "Feedback Sent",
        description: "Thank you for your feedback! We'll use it to improve your recommendations.",
      });
      
      setFeedback("");
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send feedback. Please try again later.",
      });
    } finally {
      setIsSendingFeedback(false);
    }
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
      
      {jobTitles.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">AI suggested job titles for your profile:</p>
          <div className="flex flex-wrap gap-2">
            {jobTitles.map((title, index) => (
              <Badge key={index} variant="secondary">
                {title}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {liveJobs.length > 0 && (
        <>
          <h3 className="text-lg font-medium mb-3 text-primary">Live Job Listings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {liveJobs.map((job, index) => (
              <JobCard key={`live-${index}`} job={job} />
            ))}
          </div>
        </>
      )}
      
      {fallbackJobs.length > 0 && (
        <>
          <h3 className="text-lg font-medium mb-3 text-muted-foreground">Example Job Listings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {fallbackJobs.map((job, index) => (
              <JobCard key={`fallback-${index}`} job={job} />
            ))}
          </div>
        </>
      )}
      
      {jobs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No job recommendations found. Try refreshing or update your profile with more details.
        </div>
      )}
      
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-3">How can we improve your recommendations?</h3>
        <div className="space-y-4">
          <Textarea 
            placeholder="Let us know if these job recommendations were helpful or what you'd like to see instead..."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleSubmitFeedback} 
            disabled={!feedback.trim() || isSendingFeedback}
            className="w-full sm:w-auto"
          >
            {isSendingFeedback ? "Sending..." : "Send Feedback"}
          </Button>
        </div>
      </div>
    </section>
  );
};

const JobCard = ({ job }: { job: Job }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg md:text-xl font-semibold">{job.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow py-3">
        <div className="space-y-3">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <Badge variant="outline" className="text-xs font-normal">
              {job.location}
            </Badge>
            <Badge className="bg-primary text-white">
              {job.company}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {job.description}
          </p>
          {job.reason && (
            <p className="text-xs text-primary italic mt-2 line-clamp-2">
              {job.reason}
            </p>
          )}
          {(job.platform === "Example" || job.platform === "fallback") && (
            <p className="text-xs text-amber-500 mt-2">
              Example job - not from live data
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-3 border-t flex justify-between items-center text-xs text-muted-foreground">
        <span>Posted {formatDate(job.postedAt)}</span>
        <a 
          href={job.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center hover:text-primary transition-colors"
        >
          {job.platform} <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </CardFooter>
    </Card>
  );
};

export default RecommendedJobs;
