import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AnalysisResult {
  education: {
    score: number;
    comment: string;
  };
  experience: {
    score: number;
    comment: string;
  };
  competency: {
    score: number;
    comment: string;
  };
  personality: {
    score: number;
    comment: string;
  };
  overall: {
    score: number;
    comments: string[];
  };
}

interface AssessmentResultsProps {
  assessmentData: any;
}

const AssessmentResults = ({ assessmentData }: AssessmentResultsProps) => {
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (assessmentData) {
      // If there's already analysis results, use them
      if (assessmentData.analysis_results) {
        setAnalysisResult(assessmentData.analysis_results);
      } else {
        // Otherwise trigger a new analysis
        analyzeApplication();
      }
    }
  }, [assessmentData]);

  const analyzeApplication = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase.functions.invoke('analyze-application', {
        body: { userId: user.id },
      });

      if (error) throw error;

      if (data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (error: any) {
      console.error("Error analyzing application:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error.message || "Failed to analyze application data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate overall score based on analysis results
  const calculateOverallScore = () => {
    if (analysisResult) {
      return analysisResult.overall.score;
    }
    
    if (!assessmentData) return 0;
    
    // Fallback calculation if no analysis results
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
                  <span className="text-gray-600">
                    {analysisResult ? `${analysisResult.education.score}%` : "90%"}
                  </span>
                </div>
                <Progress 
                  value={analysisResult ? analysisResult.education.score : 90} 
                  className="h-3 bg-white border border-gray-200" 
                  indicatorClassName="bg-black bg-opacity-90" 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">Experience</span>
                  <span className="text-gray-600">
                    {analysisResult ? `${analysisResult.experience.score}%` : "85%"}
                  </span>
                </div>
                <Progress 
                  value={analysisResult ? analysisResult.experience.score : 85} 
                  className="h-3 bg-white border border-gray-200" 
                  indicatorClassName="bg-black bg-opacity-90" 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">Competency</span>
                  <span className="text-gray-600">
                    {analysisResult 
                      ? `${analysisResult.competency.score}%` 
                      : `${Math.min(assessmentData.user_skills?.length * 20, 100)}%`}
                  </span>
                </div>
                <Progress 
                  value={analysisResult 
                    ? analysisResult.competency.score 
                    : Math.min(assessmentData.user_skills?.length * 20, 100)} 
                  className="h-3 bg-white border border-gray-200" 
                  indicatorClassName="bg-black bg-opacity-90"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">Personality</span>
                  <span className="text-gray-600">
                    {analysisResult ? `${analysisResult.personality.score}%` : "78%"}
                  </span>
                </div>
                <Progress 
                  value={analysisResult ? analysisResult.personality.score : 78} 
                  className="h-3 bg-white border border-gray-200" 
                  indicatorClassName="bg-black bg-opacity-90" 
                />
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
                    {analysisResult ? (
                      analysisResult.overall.comments.map((comment, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-black block"></span>
                          <span>{comment}</span>
                        </li>
                      ))
                    ) : (
                      <>
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
                      </>
                    )}
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
