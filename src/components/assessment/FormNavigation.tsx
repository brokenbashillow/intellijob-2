
import { Button } from "@/components/ui/button";

interface FormNavigationProps {
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
}

const FormNavigation = ({ currentStep, onNext, onPrevious }: FormNavigationProps) => {
  return (
    <div className="flex justify-end space-x-4">
      {currentStep > 1 && (
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
      )}
      <Button onClick={onNext}>
        {currentStep === 6 ? "Submit" : "Next"}
      </Button>
    </div>
  );
};

export default FormNavigation;
