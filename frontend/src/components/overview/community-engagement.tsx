import { ScrollArea } from "@/components/ui/scroll-area"

const communities = [
  {
    name: "Math Enthusiasts",
    activity: "New post: 'Understanding Complex Numbers'",
  },
  {
    name: "Physics Lab",
    activity: "Upcoming event: Virtual Physics Experiment",
  },
  {
    name: "Coding Club",
    activity: "Discussion: 'Best Practices in Python'",
  },
]

export function CommunityEngagement() {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {communities.map((community, index) => (
          <div key={index} className="space-y-2">
            <h4 className="text-sm font-medium">{community.name}</h4>
            <p className="text-sm text-muted-foreground">{community.activity}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

