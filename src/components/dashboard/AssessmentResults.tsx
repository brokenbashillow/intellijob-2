
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

interface AssessmentResultsProps {
  assessmentData: any;
}

const AssessmentResults = ({ assessmentData }: AssessmentResultsProps) => {
  // Calculate overall score based on education, experience and skills
  const calculateOverallScore = () => {
    if (!assessmentData) return 0;
    
    const educationScore = 90;
    const experienceScore = 85;
    const skillsScore = Math.min(assessmentData.user_skills?.length * 20, 100) || 0;
    
    return Math.round((educationScore + experienceScore + skillsScore) / 3);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Assessment Results</CardTitle>
      </CardHeader>
      <CardContent>
        {assessmentData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column - Progress bars */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">Education</span>
                  <span className="text-gray-600">90%</span>
                </div>
                <Progress value={90} className="h-3 bg-white border border-gray-200" indicatorClassName="bg-black bg-opacity-90" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">Experience</span>
                  <span className="text-gray-600">85%</span>
                </div>
                <Progress value={85} className="h-3 bg-white border border-gray-200" indicatorClassName="bg-black bg-opacity-90" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">Competency</span>
                  <span className="text-gray-600">{Math.min(assessmentData.user_skills?.length * 20, 100)}%</span>
                </div>
                <Progress 
                  value={Math.min(assessmentData.user_skills?.length * 20, 100)} 
                  className="h-3 bg-white border border-gray-200" 
                  indicatorClassName="bg-black bg-opacity-90"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">Personality</span>
                  <span className="text-gray-600">78%</span>
                </div>
                <Progress value={78} className="h-3 bg-white border border-gray-200" indicatorClassName="bg-black bg-opacity-90" />
              </div>
            </div>
            
            {/* Right column - Score and Analysis */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-36 h-36 rounded-full border-8 border-black border-opacity-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">Score:</div>
                    <div className="text-5xl font-bold">{calculateOverallScore()}%</div>
                  </div>
                </div>
              </div>
              
              <Card className="w-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Smart Analysis:</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-black block"></span>
                      <span>Strong educational background</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-black block"></span>
                      <span>Good industry experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-black block"></span>
                      <span>Consider adding more technical skills</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No assessment data available. Complete your assessment to see results.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AssessmentResults
