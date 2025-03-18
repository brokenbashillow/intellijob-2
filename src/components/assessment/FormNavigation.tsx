
import { Button } from "@/components/ui/button";

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
    <div className="flex justify-end space-x-4 mt-8">
      {currentStep > 1 && (
        <Button variant="outline" onClick={onPrevious} disabled={isSubmitting}>
          Previous
        </Button>
      )}
      <Button onClick={onNext} disabled={isSubmitting} className="bg-blue-900 hover:bg-blue-800">
        {currentStep === 5 ? "Submit" : "Next"}
      </Button>
    </div>
  );
};

export default FormNavigation;
