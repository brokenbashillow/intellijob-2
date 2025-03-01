
import { useEffect, useState } from "react"
import { ExternalLink, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Call the recommend-jobs function
        const { data, error } = await supabase.functions.invoke('recommend-jobs', {
          body: { userId: user.id }
        });

        if (error) throw error;
        
        setJobs(data.jobs || []);
      } catch (error: any) {
        console.error("Error fetching recommended jobs:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load job recommendations. Please try again later.",
        });
        // Set fallback jobs
        setJobs([
          { 
            title: "Frontend Developer", 
            company: "Tech Solutions Inc",
            location: "San Francisco, CA", 
            description: "Join our team to build modern web applications using React, TypeScript, and other cutting-edge technologies. Remote options available.",
            postedAt: "2023-05-15", 
            platform: "jobstreet",
            url: "#"
          },
          { 
            title: "UX/UI Designer", 
            company: "Creative Studio",
            location: "New York, NY", 
            description: "Looking for a talented UX/UI designer to help create intuitive and engaging user experiences for our clients' digital products.",
            postedAt: "2023-05-16", 
            platform: "indeed",
            url: "#"
          },
          { 
            title: "Full Stack Engineer", 
            company: "InnovateApp",
            location: "Remote", 
            description: "Seeking a full stack developer with experience in React, Node.js, and database management to join our growing engineering team.",
            postedAt: "2023-05-17", 
            platform: "linkedin",
            url: "#"
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedJobs();
  }, [toast]);

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

  return (
    <section className="mt-6">
      <h2 className="text-2xl font-bold mb-4 md:mb-6">Recommended Jobs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {jobs.map((job, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg md:text-xl font-semibold">{job.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow py-3">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="text-xs font-normal">
                    {job.location}
                  </Badge>
                  {job.score && (
                    <Badge variant="secondary" className="ml-2">
                      Match: {job.score}%
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {job.description}
                </p>
                {job.reason && (
                  <p className="text-xs text-primary italic mt-2 line-clamp-2">
                    {job.reason}
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
        ))}
      </div>
    </section>
  );
};

export default RecommendedJobs;
