"use client"

import { useEffect, useState } from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "../ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"
import { User, Calendar, FileText, Pencil } from "lucide-react"
import { formatDate } from "@/utils/format-date"

const DEFAULT_AVATAR = "/cta (1).png"

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string | null
  mobile: string | null
  createdAt: string
  useGoogleCalendar: boolean
  useNotion: boolean
  // Optionally, add: isPublic: boolean
}

const ProfileDialog = () => {
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [accountVisibility, setAccountVisibility] = useState<"public" | "private">("public")
  const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState(false)
  const [notionEnabled, setNotionEnabled] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/user/profile", {
          credentials: "include",
        });
        const data = await response.json();
        if (data?.user) {
          setUserData(data.user)
          setGoogleCalendarEnabled(Boolean(data.user.useGoogleCalendar))
          setNotionEnabled(Boolean(data.user.useNotion))
          // If your API returns visibility: set accordingly
          // setAccountVisibility(data.user.isPublic ? "public" : "private")
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
      }
    };
    fetchUserData();
  }, []);

  // Dynamic Avatar
  const fetchAvatarImage = () => {
    const name = `${userData?.first_name ?? ""} ${userData?.last_name ?? ""}`
    if (!name.trim()) return DEFAULT_AVATAR
    const initials = name
      .split(" ")
      .map((word: string) => word.charAt(0))
      .join("")
      .toUpperCase()
    return `https://ui-avatars.com/api/?name=${initials}&background=random`
  }

  // Helpers: Smart handle for name editing
  const handleEditName = () => {
    if (!userData) return
    const newFirst = prompt("Update first name:", userData.first_name) ?? userData.first_name;
    const newLast = prompt("Update last name:", userData.last_name) ?? userData.last_name;
    setUserData(prev => prev ? ({ ...prev, first_name: newFirst, last_name: newLast }) : prev)
  }

  // Email edit
  const handleEditEmail = () => {
    if (!userData) return
    const newEmail = prompt("Enter new email:", userData.email || "") ?? userData.email
    setUserData(prev => prev ? ({ ...prev, email: newEmail }) : prev)
  }

  // Reactivity: update userData when switches or visibility are changed
  useEffect(() => {
    if (userData) {
      setUserData(prev => prev
        ? { ...prev, useGoogleCalendar: googleCalendarEnabled, useNotion: notionEnabled }
        : prev
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleCalendarEnabled, notionEnabled])

  // If you want to save visibility to backend, include as part of userData and update below!
  useEffect(() => {
    // add in save: { ...userData, isPublic: accountVisibility === "public" }
  }, [accountVisibility])

  // Save all changes (could separate per API schema)
  const handleSaveChanges = async () => {
    try {
      if (!userData) return
      const response = await fetch("http://localhost:3000/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          useGoogleCalendar: googleCalendarEnabled,
          useNotion: notionEnabled,
          // Optionally: isPublic: accountVisibility === "public"
        }),
        credentials: "include",
      });
      const data = await response.json();
      console.log("Profile update response:", data)
      // Optionally add toast feedback here
    } catch (error) {
      console.error("Failed to update profile:", error)
    }
  };

  if (!userData) return null

  return (
    <Dialog>
      <DialogTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              <User className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Profile</TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            Manage your profile information and integrations.
          </DialogDescription>
        </DialogHeader>
        <main className="my-4 space-y-6">
          {/* Avatar + Name */}
          <section className="flex justify-start gap-6 items-center">
            <img
              src={fetchAvatarImage()}
              alt={`${userData.first_name} ${userData.last_name}`}
              className="w-24 h-24 rounded-full object-contain"
            />
            <div className="flex flex-col gap-2 justify-start">
              <h1 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                {userData.first_name} {userData.last_name}
                <Button onClick={handleEditName} variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </h1>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  Email:
                  <span className="text-foreground">
                    {userData.email || "Not Provided"}
                  </span>
                  <Button onClick={handleEditEmail} variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  Mobile: <span className="text-foreground">{userData.mobile || "Not Provided"}</span>
                </span>
              </div>
            </div>
          </section>

          <Separator />

          {/* Privacy */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Privacy Settings</h3>
            <div className="space-y-2">
              <Label htmlFor="account-visibility" className="text-sm font-medium">
                Account Visibility
              </Label>
              <Select value={accountVisibility} onValueChange={val => setAccountVisibility(val as "public" | "private")}>
                <SelectTrigger id="account-visibility">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <Separator />

          {/* Integrations */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Integrations</h3>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="google-calendar" className="text-sm font-medium">
                    Google Calendar
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Sync your events and schedule
                  </p>
                </div>
              </div>
              <Switch
                id="google-calendar"
                checked={googleCalendarEnabled}
                onCheckedChange={setGoogleCalendarEnabled}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="notion" className="text-sm font-medium">
                    Notion
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Connect your workspace and notes
                  </p>
                </div>
              </div>
              <Switch
                id="notion"
                checked={notionEnabled}
                onCheckedChange={setNotionEnabled}
              />
            </div>
          </section>
        </main>
        <DialogFooter className="flex justify-start items-center flex-row w-full gap-6">
          <Button onClick={handleSaveChanges}>Save Changes</Button>
          <p className="text-sm font-light text-muted-foreground tracking-tight">
            Account created: {userData.createdAt ? formatDate(userData.createdAt) : "N/A"}
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileDialog
