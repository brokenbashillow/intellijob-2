
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAvatarColors } from "@/lib/avatarUtils"
import { NotificationsMenu } from "@/components/notifications/NotificationsMenu"

interface DashboardHeaderProps {
  userData: any;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const DashboardHeader = ({ userData, onMenuClick, showMenuButton = false }: DashboardHeaderProps) => {
  // Determine industry for avatar color
  const industry = userData?.company_type || userData?.education || "other";
  const avatarColorClass = getAvatarColors(industry);

  return (
    <div className="flex justify-between items-center p-4 border-b">
      {/* Mobile menu button */}
      {showMenuButton && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
      
      {/* Right side elements */}
      <div className="flex items-center gap-2 ml-auto">
        <NotificationsMenu />
        <span className="font-medium hidden sm:inline">{userData?.full_name}</span>
        <Avatar>
          <AvatarImage src={userData?.avatar_url} />
          <AvatarFallback className={avatarColorClass}>
            {userData?.full_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}

export default DashboardHeader
