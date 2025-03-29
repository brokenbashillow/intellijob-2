import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createAssessmentNotification } from "@/services/notificationService";
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
  const [error, setError] = useState<string | null>(null);
  const [previousAssessmentId, setPreviousAssessmentId] = useState<string | null>(null);

  useEffect(() => {
    if (assessmentData) {
      if (assessmentData.analysis_results) {
        setAnalysisResult(assessmentData.analysis_results);
      } else {
        analyzeApplication();
      }
    }
  }, [assessmentData]);

  useEffect(() => {
    if (assessmentData?.id && assessmentData.id !== previousAssessmentId) {
      if (previousAssessmentId !== null) {
        const notifyUser = async () => {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            await createAssessmentNotification(userData.user.id);
          }
        };
        
        notifyUser();
      }
      
      setPreviousAssessmentId(assessmentData.id);
    }
  }, [assessmentData, previousAssessmentId]);

  const analyzeApplication = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log("Calling analyze-application function with userId:", user.id);
      
      const { data, error } = await supabase.functions.invoke('analyze-application', {
        body: { userId: user.id },
      });

      console.log("Response from analyze-application:", { data, error });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysisResult(data.analysis);
        toast({
          title: "Analysis complete",
          description: "Your application has been analyzed successfully.",
        });
      } else {
        throw new Error("Invalid response from analysis function");
      }
    } catch (error: any) {
      console.error("Error analyzing application:", error);
      const errorMessage = error.message || "Failed to analyze application data";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateOverallScore = () => {
    if (analysisResult) {
      return analysisResult.overall.score;
    }
    
    if (!assessmentData) return 0;
    
    const educationScore = assessmentData.education ? 90 : 0;
    const experienceScore = assessmentData.experience ? 85 : 0;
    const skillsScore = Math.min(assessmentData.user_skills?.length * 20 || 0, 100);
    
    return Math.round((educationScore + experienceScore + skillsScore) / 3);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Assessment Results</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : assessmentData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                      : `${Math.min(assessmentData.user_skills?.length * 20 || 0, 100)}%`}
                  </span>
                </div>
                <Progress 
                  value={analysisResult 
                    ? analysisResult.competency.score 
                    : Math.min(assessmentData.user_skills?.length * 20 || 0, 100)} 
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
              
              {error && (
                <button 
                  onClick={analyzeApplication}
                  className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Analyzing..." : "Retry Analysis"}
                </button>
              )}
            </div>
            
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
  );
};

export default AssessmentResults;
