
import { AssessmentForm } from "@/components/assessment/AssessmentForm";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

const Assessment = () => {
  const [progress, setProgress] = useState(1);
  const totalSteps = 4; // Updated from 3 to 4 to include Technical Skills

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Skills Assessment</h1>
          <Progress value={(progress / totalSteps) * 100} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Step {progress} of {totalSteps}
          </p>
        </div>
        <AssessmentForm onProgressChange={setProgress} />
      </div>
    </div>
  );
};

export default Assessment;
