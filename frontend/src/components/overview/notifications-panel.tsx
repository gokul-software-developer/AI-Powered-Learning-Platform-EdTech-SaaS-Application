import { ScrollArea } from "@/components/ui/scroll-area"

const notifications = [
  {
    source: "Notion",
    message: "Assignment deadline updated: Physics Project due in 2 days",
  },
  {
    source: "Google Calendar",
    message: "Upcoming test reminder: Math 101 on Jan 15, 2025",
  },
  {
    source: "Notion",
    message: "New study resource shared in Physics community",
  },
  {
    source: "Google Calendar",
    message: "Study group meeting scheduled for tomorrow at 4 PM",
  },
]

export function NotificationsPanel() {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <div key={index} className="flex items-start space-x-4">
            <span className="text-sm font-medium">{notification.source}:</span>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

