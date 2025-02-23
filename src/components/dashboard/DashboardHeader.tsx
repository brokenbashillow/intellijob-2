
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DashboardHeaderProps {
  userData: any;
}

const DashboardHeader = ({ userData }: DashboardHeaderProps) => {
  return (
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
        <span className="font-medium">{userData?.full_name}</span>
        <Avatar>
          <AvatarImage src={userData?.avatar_url} />
          <AvatarFallback>{userData?.full_name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}

export default DashboardHeader
