
import { AssessmentForm } from "@/components/assessment/AssessmentForm";
import { Progress } from "@/components/ui/progress";

const Assessment = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Skills Assessment</h1>
          <Progress value={(1 / 6) * 100} className="h-2" />
        </div>
        <AssessmentForm />
      </div>
    </div>
  );
};

export default Assessment;
