import { useState } from "react"
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

type View = "dashboard" | "chat" | "job-postings"

const EmployerDashboard = () => {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const navigate = useNavigate()
  const { toast } = useToast()

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
        return <EmployerChat />
      case "job-postings":
        return <JobPostings />
      default:
        return (
          <main className="flex-1 p-8">
            <div className="mb-12">
              <div className="flex gap-8 items-start">
                <Avatar className="w-32 h-32">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl">CN</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Company Name</h2>
                  <p className="text-muted-foreground">
                    Sample description of company. This is where you can add information about your organization,
                    its mission, and what you're looking for in potential candidates.
                  </p>
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
            <span className="font-medium">Company Name</span>
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  )
}

export default EmployerDashboard
