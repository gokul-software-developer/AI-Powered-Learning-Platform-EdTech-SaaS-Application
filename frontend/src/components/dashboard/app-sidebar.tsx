import {Book, ChartArea, CircleDollarSignIcon, Hourglass, Notebook, NotebookPen, Users } from "lucide-react"
const Logo = '/dark1-logo.svg'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"
import { ModeToggle } from "./mode-toggle";
import ProfileDialog from "./profile-dialog";
import LogoutDialog from "./logout-dialog";
import { GoogleCalendarIcon } from "./google-calendar-icon";
import { NotionIcon } from "./notion-icon";
import { useState, useEffect } from "react";
import axios from "axios";
import { User } from "lucide-react"; // Add User icon
const BASE_URL = import.meta.env.VITE_BACKEND_URL; // Use the correct environment variable
// Menu items.
const overview = [
  {
    title: "Overview",
    url: "/overview",
    icon: ChartArea,
  },
  // {
  //   title: "Feature Selection",
  //   url: "/feature-selection",
  //   icon: ChartArea,
  // },
    //   {
    //   title : "Learn",
    //   url : "/learn",
    //   icon : Book
    // },
    // {
    //   title : "Schedule",
    //   url : "/schedule",
    //   icon : Hourglass
    // },
    // {
    //     title : "Tests",
    //     url : "/rooms",
    //     icon : NotebookPen
    // }

];




const integrations = [
    {
      title : "Google Calendar",
      url : "/connect-gcalendar",
      icon : GoogleCalendarIcon
  },
   {
    title: "Groups",
    url: "/groups",
    icon: Users,
  }
]

// const billing = [
//     {
//         title : "Billing",
//         url : "/billing",
//         icon : CircleDollarSignIcon
//     }
// ]

const community = [
  {
    title : "My Learnings",
    url : "/mylearnings",
    icon : Notebook
  }
]
const user = [{
  title: "Profile",
  url: "/profile/", // Note the trailing slash
  icon: User // Changed from Notebook to User
}];


export function AppSidebar() {
  const [userId, setUserId] = useState<number | null>(null);
  useEffect(() => {
  const fetchUserId = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/session/check-session`, {
        withCredentials: true,
      });
      const id = res.data?.user?.userId; // ✅ Fix: use userId, not id
      setUserId(id ?? null);
    } catch (error) {
      console.error("Failed to fetch user session:", error);
    }
  };
  fetchUserId();
}, []);

  return (
    <Sidebar>
      <SidebarHeader>
        <Link to={"/"} className="flex flex-row gap-1 items-center">
          <img src={Logo} alt="logo" className="w-10 h-10 object-contain" />
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Study App
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* Overview group */}
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {overview.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Courses group */}
        <SidebarGroup>
          <SidebarGroupLabel>COURSES</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {community.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Integrations group */}
        <SidebarGroup>
          <SidebarGroupLabel>Integrations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {integrations.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

       {/* User Profile group */}
{userId && (
  <SidebarGroup>
    <SidebarGroupLabel>ACCOUNT</SidebarGroupLabel> {/* Changed from "User" to "ACCOUNT" */}
    <SidebarGroupContent>
      <SidebarMenu>
        {user.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link to={`${item.url}${userId}`}> {/* Append user ID */}
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
)}
      </SidebarContent>

      <SidebarFooter className="flex flex-row items-center gap-2">
        <ModeToggle />
        <ProfileDialog />
        <LogoutDialog />
      </SidebarFooter>
    </Sidebar>
  );
}

