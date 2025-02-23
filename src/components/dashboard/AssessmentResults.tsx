
import { Progress } from "@/components/ui/progress"

interface AssessmentResultsProps {
  assessmentData: any;
}

const AssessmentResults = ({ assessmentData }: AssessmentResultsProps) => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Assessment Results</h2>
      {assessmentData ? (
        <div className="grid gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Education</span>
              <span>90%</span>
            </div>
            <Progress value={90} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Experience</span>
              <span>85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Technical Skills</span>
              <span>{Math.min(assessmentData.user_skills?.length * 20, 100)}%</span>
            </div>
            <Progress value={Math.min(assessmentData.user_skills?.length * 20, 100)} className="h-2" />
          </div>
        </div>
      ) : (
        <p>No assessment data available. Complete your assessment to see results.</p>
      )}
    </section>
  )
}

export default AssessmentResults
