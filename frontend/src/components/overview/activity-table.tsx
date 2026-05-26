import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  
  const activities = [
    {
      name: "Test Completed",
      timestamp: "Jan 3, 2025, 4:00 PM",
      details: "Test: Algebra Basics",
      source: "Manual",
      status: "Success",
    },
    {
      name: "Bot Created",
      timestamp: "Jan 2, 2025, 2:30 PM",
      details: "Bot: Math Tutor",
      source: "Manual",
      status: "Success",
    },
    {
      name: "Assignment Updated",
      timestamp: "Jan 1, 2025, 10:00 AM",
      details: "Physics Project",
      source: "Notion",
      status: "Pending",
    },
  ]
  
  export function ActivityTable() {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Activity</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.name}>
              <TableCell>{activity.name}</TableCell>
              <TableCell>{activity.timestamp}</TableCell>
              <TableCell>{activity.details}</TableCell>
              <TableCell>{activity.source}</TableCell>
              <TableCell>{activity.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
  
  