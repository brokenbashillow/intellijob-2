import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BriefcaseIcon, MessageCircle, FileText, LogOut, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Chat from "./Chat"
import Resume from "@/components/resume/Resume"

type View = "dashboard" | "chat" | "resume"

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<View>("dashboard")

  const assessmentData = {
    knowledge: 85,
    experience: 70,
    hardSkills: 90,
    softSkills: 75,
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
              <span className="font-medium">John Doe</span>
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Assessment Results</h2>
              <div className="grid gap-6">
                {Object.entries(assessmentData).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span>{value}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </div>
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
          <Button variant="ghost" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </nav>
      </aside>

      {renderContent()}
    </div>
  )
}

export default Dashboard