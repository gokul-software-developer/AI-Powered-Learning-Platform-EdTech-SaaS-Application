import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";

interface Props {
  userId: number;
  open: boolean;
  setOpen: (val: boolean) => void;
  onPublicChange?: (isPublic: boolean) => void;
}

export default function ProfileSettingsDialog({
  userId,
  open,
  setOpen,
  onPublicChange,      // ← add this
}: Props)  {
  const [isPublic, setIsPublic] = useState(false);
  const [viewAsPublic, setViewAsPublic] = useState(false);
  const [syncWithGoogle, setSyncWithGoogle] = useState(false);
  const [syncWithNotion, setSyncWithNotion] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch user settings when dialog opens
  useEffect(() => {
    if (!open) return;

    async function fetchSettings() {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/api/profile/${userId}`, {
          withCredentials: true,
        });
        const data = res.data;

        setIsPublic(data.is_public ?? false);
        setViewAsPublic(false); // Adjust if API has different logic
        setSyncWithGoogle(data.sync_with_google ?? false);
        setSyncWithNotion(data.sync_with_notion ?? false);
      } catch (error) {
        toast.error("Failed to load profile settings");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [userId, open]);

  // Update public profile visibility
const togglePublicProfile = async (val: boolean) => {
    setIsPublic(val);
    try {
      await axios.patch(
        `http://localhost:3000/api/profile/${userId}`,
        { is_public: val },
        { withCredentials: true }
      );
      toast.success("Public profile visibility updated");
      onPublicChange?.(val);
    } catch {
      toast.error("Failed to update public profile visibility");
      setIsPublic(!val);
    }
  };
  // Update public view mode locally (no backend call here by default)
  // const toggleViewAsPublic = (val: boolean) => setViewAsPublic(val);

  // Update sync with Google
  const toggleSyncGoogle = async (val: boolean) => {
    setSyncWithGoogle(val);
    try {
      await axios.patch(
        `http://localhost:3000/api/profile/${userId}/sync/google`,
        { sync_with_google: val },
        { withCredentials: true }
      );
      toast.success("Google sync updated");
    } catch {
      toast.error("Failed to update Google sync");
      setSyncWithGoogle(!val);
    }
  };

  // Update sync with Notion
  const toggleSyncNotion = async (val: boolean) => {
    setSyncWithNotion(val);
    try {
      await axios.patch(
        `http://localhost:3000/api/profile/${userId}/sync/notion`,
        { sync_with_notion: val },
        { withCredentials: true }
      );
      toast.success("Notion sync updated");
    } catch {
      toast.error("Failed to update Notion sync");
      setSyncWithNotion(!val);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full p-3 shadow-md">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>

       <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-6 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid gap-4 py-4">
  <div className="flex items-center justify-between">
    <Label htmlFor="public-profile" className="min-w-[120px]">Public Profile</Label>
    <Switch
      id="public-profile"
      checked={isPublic}
      onCheckedChange={togglePublicProfile}
    />
  </div>

  {/* <div className="flex items-center justify-between">
    <Label htmlFor="public-view-mode" className="min-w-[120px]">Public View Mode</Label>
    <Switch
      id="public-view-mode"
      checked={viewAsPublic}
      onCheckedChange={toggleViewAsPublic}
    />
  </div> */}

  <div className="flex items-center justify-between">
    <Label htmlFor="sync-google" className="min-w-[120px]">Sync Google</Label>
    <Switch id="sync-google" checked={syncWithGoogle} onCheckedChange={toggleSyncGoogle} />
  </div>

  <div className="flex items-center justify-between">
    <Label htmlFor="sync-notion" className="min-w-[120px]">Sync Notion</Label>
    <Switch id="sync-notion" checked={syncWithNotion} onCheckedChange={toggleSyncNotion} />
  </div>

  <Button variant="outline" onClick={() => setOpen(false)} className="self-start">
    <Pencil className="w-4 h-4 mr-2" />
    Close
  </Button>
</div>

        )}
      </DialogContent>
    </Dialog>
  );
}
