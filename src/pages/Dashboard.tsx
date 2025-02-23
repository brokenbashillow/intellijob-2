
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import Chat from "./Chat"
import Resume from "@/components/resume/Resume"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import AssessmentResults from "@/components/dashboard/AssessmentResults"
import RecommendedJobs from "@/components/dashboard/RecommendedJobs"

type View = "dashboard" | "chat" | "resume"

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [userData, setUserData] = useState<any>(null)
  const [assessmentData, setAssessmentData] = useState<any>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    fetchUserData();
    fetchAssessmentData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setUserData(profileData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchAssessmentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: assessment, error } = await supabase
        .from('seeker_assessments')
        .select(`
          *,
          user_skills(*)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setAssessmentData(assessment);
    } catch (error) {
      console.error('Error fetching assessment data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: "Success",
        description: "You have been logged out successfully.",
      })
      navigate("/")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while logging out.",
      })
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user')
      if (error) throw error

      await supabase.auth.signOut()
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      })
      navigate("/")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while deleting your account.",
      })
    }
  }

  const renderContent = () => {
    switch (currentView) {
      case "chat":
        return <Chat />
      case "resume":
        return <Resume />
      case "dashboard":
        return (
          <main className="flex-1 p-8">
            <AssessmentResults assessmentData={assessmentData} />
            <RecommendedJobs />
          </main>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />
      <div className="flex-1">
        <DashboardHeader userData={userData} />
        {renderContent()}
      </div>
    </div>
  )
}

export default Dashboard
