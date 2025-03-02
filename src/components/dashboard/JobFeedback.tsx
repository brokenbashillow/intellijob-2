
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface JobFeedbackProps {
  jobTitles: string[]
}

const JobFeedback = ({ jobTitles }: JobFeedbackProps) => {
  const [feedback, setFeedback] = useState<string>("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const { toast } = useToast();

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

  return (
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
  );
};

export default JobFeedback;
