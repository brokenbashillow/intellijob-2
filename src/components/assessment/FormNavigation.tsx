
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";

interface FormNavigationProps {
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  isSubmitting?: boolean;
}

const FormNavigation = ({ 
  currentStep, 
  onNext, 
  onPrevious,
  isSubmitting = false
}: FormNavigationProps) => {
  return (
    <div className="flex justify-between mt-8">
      {currentStep > 1 ? (
        <Button 
          variant="outline" 
          onClick={onPrevious} 
          disabled={isSubmitting}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
      ) : (
        <div></div> // Empty div to maintain the space when no previous button
      )}
      
      <Button 
        onClick={onNext} 
        disabled={isSubmitting}
        className="flex items-center"
      >
        {currentStep === 3 ? ( // Changed from 5 to 3
          <>
            Submit
            <Send className="h-4 w-4 ml-2" />
          </>
        ) : (
          <>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};

export default FormNavigation;
