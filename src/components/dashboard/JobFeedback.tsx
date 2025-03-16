
import { Button } from "@/components/ui/button";
import { useResumeData } from "@/hooks/useResumeData";
import { useToast } from "@/components/ui/use-toast";

const JobFeedback = () => {
  const { hasResumeData } = useResumeData();
  const { toast } = useToast();

  const handleFeedback = (isRelevant: boolean) => {
    toast({
      title: isRelevant ? "Great!" : "Thanks for your feedback",
      description: isRelevant 
        ? "We're glad the job recommendations are relevant to you." 
        : "We'll use your feedback to improve future recommendations.",
      duration: 3000,
    });
  };

  if (!hasResumeData) return null;

  return (
    <div className="mt-6 border-t pt-4">
      <p className="text-sm text-muted-foreground mb-3">
        Are these job recommendations relevant to your skills and interests?
      </p>
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleFeedback(true)}
        >
          Yes, they're helpful
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleFeedback(false)}
        >
          No, improve recommendations
        </Button>
      </div>
    </div>
  );
};

export default JobFeedback;
