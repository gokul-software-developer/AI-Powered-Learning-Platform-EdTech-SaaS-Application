import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface Props {
  isOwnProfile: boolean;
  userName: string;
}

interface Group {
  id: number;
  group_name: string;
  join_code: string;
  created_by: number;
  createdAt: string;
  isAdmin: boolean;
}

export default function GroupsTab({ isOwnProfile, userName }: Props) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedGroupId, setCopiedGroupId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOwnProfile) return;
    setLoading(true);
    setError(null);

    axios
      .get("http://localhost:3000/api/group/mygroups", { withCredentials: true })
      .then(res => setGroups(res.data.groups || []))
      .catch(() => {
        setGroups([]);
        setError("Failed to load your groups.");
      })
      .finally(() => setLoading(false));
  }, [isOwnProfile]);

  const shareGroup = (id: number) => {
    const url = `http://localhost:5173/group/${id}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url)
        .then(() => {
          toast.success("Group link copied to clipboard!");
          setCopiedGroupId(id);
          setTimeout(() => setCopiedGroupId(null), 2000);
        })
        .catch(() => toast.error("Failed to copy link."));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          toast.success("Group link copied to clipboard!");
          setCopiedGroupId(id);
          setTimeout(() => setCopiedGroupId(null), 2000);
        } else {
          toast.error("Failed to copy link.");
        }
      } catch {
        toast.error("Failed to copy link.");
      }

      document.body.removeChild(textArea);
    }
  };


  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="font-semibold text-lg text-foreground">
          {isOwnProfile ? "Your" : `${userName}'s`} Study Groups
        </CardTitle>
        {isOwnProfile && (
          <CardDescription className="text-muted-foreground">
            Manage and track your study progress
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {isOwnProfile ? (
          loading ? (
            <p className="text-muted-foreground">Loading groups...</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : groups.length ? (
            <div className="space-y-4">
              {groups.map(group => (
                <div
                  key={group.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center"
                  onClick={() => window.location.href = `http://localhost:5173/group/${group.id}`}
                  role="button"
                  tabIndex={0}
                  onKeyPress={e => { if(e.key === "Enter") window.location.href = `http://localhost:5173/group/${group.id}`; }}
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{group.group_name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 text-sm text-muted-foreground">
                      <p><strong>Join code:</strong> {group.join_code}</p>
                      <p>{group.isAdmin && <em>Admin</em>}</p>
                      <p>Created on {new Date(group.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="ml-6 flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`Share group ${group.group_name}`}
                      title={`Copy link for ${group.group_name}`}
                      onClick={e => { e.stopPropagation(); shareGroup(group.id); }}
                      className="flex items-center"
                    >
                      <Share2 className="w-5 h-5 text-current" />
                    </Button>
                    {copiedGroupId === group.id && (
                      <span className="text-success text-sm select-none">Copied!</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">You haven't joined any study groups yet.</p>
              <Button>Browse Study Groups</Button>
            </div>
          )
        ) : (
          <p className="text-muted-foreground">{userName} hasn't shared their study groups.</p>
        )}
      </CardContent>
    </Card>
  );
}
