import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BriefcaseIcon, MessageCircle, FileText, LogOut, Bell, ExternalLink, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/integrations/supabase/client"
import Chat from "./Chat"
import Resume from "@/components/resume/Resume"

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

  const jobPlatforms = [
    { name: "IntelliJob", url: "#", color: "bg-blue-500" },
    { name: "Indeed", url: "#", color: "bg-blue-600" },
    { name: "Upwork", url: "#", color: "bg-blue-700" },
  ]

  const renderContent = () => {
    switch (currentView) {
      case "chat":
        return <Chat />
      case "resume":
        return <Resume />
      case "dashboard":
        return (
          <main className="flex-1 p-8">
            <div className="flex justify-end items-center mb-8 gap-4">
              <div className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative hover:bg-accent"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        3
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications coming soon</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="font-medium">{userData?.full_name}</span>
              <Avatar>
                <AvatarImage src={userData?.avatar_url} />
                <AvatarFallback>{userData?.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>

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

            <section>
              <h2 className="text-2xl font-bold mb-6">Recommended Jobs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {jobPlatforms.map((platform) => (
                  <Card key={platform.name} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{platform.name}</span>
                        <ExternalLink className="h-4 w-4" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={platform.url} target="_blank" rel="noopener noreferrer">
                          View Jobs
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </main>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r bg-card p-6 space-y-6">
        <div className="flex items-center gap-2 mb-8">
          <h2 className="text-2xl font-bold">IntelliJob</h2>
        </div>
        
        <nav className="space-y-2">
          <Button 
            variant={currentView === "dashboard" ? "default" : "ghost"} 
            className="w-full justify-start gap-2"
            onClick={() => setCurrentView("dashboard")}
          >
            <BriefcaseIcon className="h-4 w-4" />
            Dashboard
          </Button>
          <Button 
            variant={currentView === "chat" ? "default" : "ghost"} 
            className="w-full justify-start gap-2"
            onClick={() => setCurrentView("chat")}
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </Button>
          <Button 
            variant={currentView === "resume" ? "default" : "ghost"} 
            className="w-full justify-start gap-2"
            onClick={() => setCurrentView("resume")}
          >
            <FileText className="h-4 w-4" />
            Resume
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </nav>
      </aside>

      <div className="flex-1">
        <div className="flex justify-end items-center p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-accent"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      3
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications coming soon</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="font-medium">{userData?.full_name}</span>
            <Avatar>
              <AvatarImage src={userData?.avatar_url} />
              <AvatarFallback>{userData?.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  )
}

export default Dashboard
