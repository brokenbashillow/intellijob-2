
import { BriefcaseIcon, MessageCircle, FileText, LogOut, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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

interface DashboardSidebarProps {
  currentView: "dashboard" | "chat" | "resume"
  onViewChange: (view: "dashboard" | "chat" | "resume") => void
  onLogout: () => void
  onDeleteAccount: () => void
}

const DashboardSidebar = ({ 
  currentView, 
  onViewChange, 
  onLogout, 
  onDeleteAccount 
}: DashboardSidebarProps) => {
  return (
    <aside className="w-64 border-r bg-card p-6 space-y-6">
      <div className="flex items-center gap-2 mb-8">
        <h2 className="text-2xl font-bold">IntelliJob</h2>
      </div>
      
      <nav className="space-y-2">
        <Button 
          variant={currentView === "dashboard" ? "default" : "ghost"} 
          className="w-full justify-start gap-2"
          onClick={() => onViewChange("dashboard")}
        >
          <BriefcaseIcon className="h-4 w-4" />
          Dashboard
        </Button>
        <Button 
          variant={currentView === "chat" ? "default" : "ghost"} 
          className="w-full justify-start gap-2"
          onClick={() => onViewChange("chat")}
        >
          <MessageCircle className="h-4 w-4" />
          Chat
        </Button>
        <Button 
          variant={currentView === "resume" ? "default" : "ghost"} 
          className="w-full justify-start gap-2"
          onClick={() => onViewChange("resume")}
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
              <AlertDialogAction onClick={onDeleteAccount} className="bg-red-500 hover:bg-red-600">
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </nav>
    </aside>
  )
}

export default DashboardSidebar
