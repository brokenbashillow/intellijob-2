
import { Loader2, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useJobRecommendations } from "@/hooks/useJobRecommendations"
import JobErrorMessage from "./JobErrorMessage"
import EmptyJobState from "./EmptyJobState"
import TopRecommendedJobs from "./TopRecommendedJobs"
import JobFeedback from "./JobFeedback"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const RecommendedJobs = () => {
  const {
    jobs,
    isLoading,
    isRefreshing,
    isAiAnalyzing,
    errorMessage,
    userFields,
    handleRefresh
  } = useJobRecommendations();

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
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Recommended Jobs</h2>
          {isAiAnalyzing && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI is analyzing job matches</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
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
      
      <JobErrorMessage 
        message={errorMessage || ""} 
        onRefresh={handleRefresh} 
      />
      
      {jobs.length > 0 ? (
        <TopRecommendedJobs 
          jobs={jobs} 
          userFields={userFields} 
        />
      ) : (
        <EmptyJobState onRefresh={handleRefresh} />
      )}
      
      <JobFeedback />
    </section>
  );
};

export default RecommendedJobs;
