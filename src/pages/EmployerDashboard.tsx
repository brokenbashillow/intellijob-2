import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building, MessageCircle, BriefcaseIcon, LogOut, Bell, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { supabase } from "@/integrations/supabase/client"
import EmployerChat from "@/components/employer/EmployerChat"
import JobPostings from "@/components/employer/JobPostings"
import Resume from "@/components/resume/Resume"

type View = "dashboard" | "chat" | "job-postings" | "resume-viewer"

const EmployerDashboard = () => {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [companyName, setCompanyName] = useState("Company Name")
  const [companyDescription, setCompanyDescription] = useState("")
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    fetchEmployerProfile()
    // Ensure we remove any fallback jobs associated with this employer on initial load
    cleanupFallbackJobs()
  }, [])

  // Function to clean up any fallback jobs that might have been incorrectly associated with this employer
  const cleanupFallbackJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return
      
      // Delete any fallback or example jobs associated with this employer
      // Now that we have the platform column, this will work correctly
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('employer_id', user.id)
        .or('platform.eq.fallback,platform.eq.Example')
      
      if (error) throw error
    } catch (error) {
      console.error("Error cleaning up fallback jobs:", error)
    }
  }

  const fetchEmployerProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        navigate('/')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_name')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      
      if (profileData?.company_name) {
        setCompanyName(profileData.company_name)
      }

      const { data: assessmentData, error: assessmentError } = await supabase
        .from('employer_assessments')
        .select('description')
        .eq('user_id', user.id)
        .single()

      if (assessmentError && assessmentError.code !== 'PGRST116') {
        throw assessmentError
      }
      
      if (assessmentData?.description) {
        setCompanyDescription(assessmentData.description)
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error)
    }
  }

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

  const navigateToChat = (prompt?: string) => {
    setCurrentView("chat")
    // We'll pass the prompt in future enhancements
  }

  const renderContent = () => {
    switch (currentView) {
      case "chat":
        return <EmployerChat />
      case "job-postings":
        return <JobPostings onCreateWithAssistant={() => navigateToChat()} />
      case "resume-viewer":
        return <Resume />
      default:
        return (
          <main className="flex-1 p-8">
            <div className="mb-12">
              <div className="flex gap-8 items-start">
                <Avatar className="w-32 h-32">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl">{companyName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{companyName}</h2>
                  <p className="text-muted-foreground">
                    {companyDescription || 
                      "Sample description of company. This is where you can add information about your organization, its mission, and what you're looking for in potential candidates."}
                  </p>
                  <div className="mt-4 flex gap-4">
                    <Button
                      onClick={() => setCurrentView("job-postings")}
                      className="flex items-center gap-2"
                    >
                      <BriefcaseIcon className="h-4 w-4" />
                      View Job Postings
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentView("chat")}
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Ask AI Assistant
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
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
            <Building className="h-4 w-4" />
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
            variant={currentView === "job-postings" ? "default" : "ghost"} 
            className="w-full justify-start gap-2"
            onClick={() => setCurrentView("job-postings")}
          >
            <BriefcaseIcon className="h-4 w-4" />
            Job Postings
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
              <TooltipProvider>
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
              </TooltipProvider>
            </div>
            <span className="font-medium">{companyName}</span>
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>{companyName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  )
}

export default EmployerDashboard
