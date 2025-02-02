import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, MessageCircle, BriefcaseIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EmployerDashboard = () => {
  const navigate = useNavigate();

  const recentJobs = [
    { title: "Software Engineer", description: "Full-time position for an experienced software engineer..." },
    { title: "Junior Programmer", description: "Entry-level position for a passionate programmer..." },
    { title: "Project Manager", description: "Seeking an experienced project manager to lead our development teams..." },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card p-6 space-y-6">
        <div className="flex items-center gap-2 mb-8">
          <h2 className="text-2xl font-bold">IntelliJob</h2>
        </div>
        
        <nav className="space-y-2">
          <Button 
            variant="default"
            className="w-full justify-start gap-2"
          >
            <Building className="h-4 w-4" />
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2"
            onClick={() => navigate("/chat")}
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2"
            onClick={() => navigate("/job-postings")}
          >
            <BriefcaseIcon className="h-4 w-4" />
            Job Postings
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex justify-end items-center mb-8">
          <div className="flex items-center gap-4">
            <span className="font-medium">Company Name</span>
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Company Profile Section */}
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

        {/* Recent Job Postings */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Recent Job Postings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentJobs.map((job) => (
              <Card key={job.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                  </p>
                  <Button className="w-full mt-4" variant="outline">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default EmployerDashboard;