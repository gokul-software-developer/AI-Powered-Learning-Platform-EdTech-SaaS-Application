import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
  Share2,
  UserPlus,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QRCodeCanvas } from "qrcode.react";

import { io } from "socket.io-client";

interface MinimalUser {
  id: number;
  name: string;
  is_following?: boolean;
  requested_at?: string;
  status?: "pending" | "accepted" | "rejected";
}

interface UserProfile {
  id: number;
  name: string;
  bio?: string;
  is_public: boolean;
  is_following?: boolean;
  has_pending_request?: boolean;
  follower_count: number;
  following_count: number;
  joined_on: string;
}

interface Props {
  user: UserProfile;
  isOwnProfile: boolean;
  onUpdate?: () => void;
}

const BASE_URL = "http://localhost:3000";
const socket = io("http://localhost:3000", { withCredentials: true });

export default function UserProfileCard({ user, isOwnProfile, onUpdate }: Props) {
  const [showShareDialog, setShowShareDialog] = useState(false);
const [state, setState] = useState({
  isFollowing: user.is_following ?? false,
  hasPendingRequest: user.has_pending_request ?? false,
  loading: false,
  showDialog: false,
  dialogType: null as "followers" | "following" | "requests" | null,
  list: [] as MinimalUser[],
  isRequestsLoading: false,
  isRequestsError: false,
  isPublic: user.is_public,
  follower_count: user.follower_count,
  following_count: user.following_count,
});


  const userId = user.id;
  // const mounted = useRef(false);

useEffect(() => {
  if (!userId) return;

  socket.emit("joinProfile", userId);

  socket.on("profileChanged", (data) => {
    setState(prev => {
      let followerCount = prev.follower_count ?? user.follower_count;
      let followingCount = prev.following_count ?? user.following_count;
      let list = prev.list;

      switch (data.type) {
        case "follow":
          followerCount += 1;
          return {
            ...prev,
            follower_count: followerCount,
            isFollowing: true,
          };
        case "unfollow":
          followerCount = Math.max(0, followerCount - 1);
          return {
            ...prev,
            follower_count: followerCount,
            isFollowing: false,
          };
        case "request":
          // New pending request, increment count or add to list if on own profile
          if (isOwnProfile) {
            list = [...list, data.fromUser]; // optionally add the user who requested
          }
          return {
            ...prev,
            hasPendingRequest: true,
            list,
          };
        case "request_rejected":
          // Pending request was rejected, remove from list and update flag
          if (isOwnProfile) {
            list = list.filter(u => u.id !== data.fromUser.id);
          }
          return {
            ...prev,
            hasPendingRequest: false,
            list,
          };
        case "request_accepted":
          // Accepted request becomes a new follower
          followerCount += 1;
          if (isOwnProfile) {
            list = list.filter(u => u.id !== data.fromUser.id);
          }
          return {
            ...prev,
            follower_count: followerCount,
            hasPendingRequest: false,
            isFollowing: true,
            list,
          };
        default:
          return prev;
      }
    });
    if (onUpdate) onUpdate();
  });

  return () => {
    socket.off("profileChanged");
  };
}, [userId, onUpdate, isOwnProfile, user.follower_count, user.following_count]);

  const formatDate = (dateStr: string) =>
    format(new Date(dateStr), "MMMM dd, yyyy");

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  async function loadRequests() {
    setState(prev => ({
      ...prev,
      isRequestsLoading: true,
      isRequestsError: false,
    }));
    try {
      const res = await axios.get(`${BASE_URL}/api/profile/requests/pending`, {
        withCredentials: true,
      });
      setState(prev => ({
        ...prev,
        list: res.data || [],
        isRequestsLoading: false,
        isRequestsError: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRequestsLoading: false,
        isRequestsError: true,
      }));
      toast.error("Failed to load pending follow requests.");
    }
  }

  useEffect(() => {
    if (isOwnProfile) {
      loadRequests();
    }
  }, [isOwnProfile]);

  // Open dialog & optionally reload requests if needed
  const handleViewList = async (type: "followers" | "following" | "requests") => {
    if (type === "requests" && isOwnProfile && state.list.length === 0) {
      await loadRequests();
    } else if ((type === "followers" || type === "following") && user.id) {
      try {
        const res = await axios.get(`${BASE_URL}/api/profile/${user.id}/${type}`, {
          withCredentials: true,
        });

        setState(prev => ({
          ...prev,
          list: res.data || [],
        }));
      } catch (err) {
        toast.error(`Failed to load ${type}`);
        return;
      }
    }

    setState(prev => ({
      ...prev,
      dialogType: type,
      showDialog: true,
    }));
  };

  const handleRequestAction = async (requestId: number, action: "accept" | "reject") => {
    try {
      await axios.post(
        `${BASE_URL}/api/profile/requests/${action}/${requestId}`,
        {},
        { withCredentials: true }
      );
      toast.success(`Request ${action}ed`);
      setState(prev => ({
        ...prev,
        list: prev.list.filter(u => u.id !== requestId),
      }));
      onUpdate?.();
    } catch {
      toast.error("Failed to update request");
    }
  };

  // Unfollow handler
  const handleUnfollow = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      await axios.delete(`${BASE_URL}/api/profile/unfollow/${user.id}`, {
        withCredentials: true,
      });
      toast.success("Unfollowed successfully");
      setState(prev => ({ ...prev, isFollowing: false, loading: false }));
      onUpdate?.();
    } catch {
      toast.error("Failed to unfollow");
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Follow / request handler
 const handleFollowAction = async () => {
  setState(prev => ({ ...prev, loading: true }));
  try {
    if (state.hasPendingRequest) {
      await axios.delete(`${BASE_URL}/api/profile/requests/${user.id}`, {
        withCredentials: true,
      });

      toast.success("Follow request canceled");

      // Update the requests list: remove the canceled request user
      setState(prev => ({
        ...prev,
        hasPendingRequest: false,
        loading: false,
        list: prev.list.filter(u => u.id !== user.id), // Remove from pending requests list
      }));
    } else {
      await axios.post(
        `${BASE_URL}/api/profile/follow/${user.id}`,
        {},
        { withCredentials: true }
      );
      if (state.isPublic) {
        toast.success("Followed successfully");
        setState(prev => ({ ...prev, isFollowing: true, loading: false }));
      } else {
        toast.success("Follow request sent");
        setState(prev => ({ ...prev, hasPendingRequest: true, loading: false }));
      }
    }
    onUpdate?.();
  } catch (err: any) {
    toast.error(err?.response?.data?.error || "Follow action failed");
    setState(prev => ({ ...prev, loading: false }));
  }
};


  // Shareable profile link
  const profileLink = `${window.location.origin}/profile/${user.id}`;
const followButtonState = state.loading
  ? { text: "Processing...", variant: "outline" as const }
  : state.hasPendingRequest
  ? { text: "Requested", variant: "outline" as const }
  : state.isFollowing
  ? { text: "Following", variant: "default" as const }
  : { text: "Follow", variant: "default" as const };


  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                alt={`${user.name}'s avatar`}
              />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-semibold">{user.name}</CardTitle>
                {!state.isPublic && <Badge variant="outline">Private</Badge>}
              </div>
              
              <p className="text-sm text-muted-foreground mt-1">{user.bio || "Trying to turn WiFi signals into degrees"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Joined {formatDate(user.joined_on)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button
                className="flex flex-col items-center hover:text-foreground transition-colors"
                onClick={() => handleViewList("followers")}
              >
                <span className="text-lg font-bold text-foreground">{state.follower_count}</span>
                <span>Followers</span>
              </button>
              <button
                className="flex flex-col items-center hover:text-foreground transition-colors"
                onClick={() => handleViewList("following")}
              >
                <span className="text-lg font-bold text-foreground">{user.following_count}</span>
                <span>Following</span>
              </button>
              {isOwnProfile && !state.isPublic && (
                <button
                  className="flex flex-col items-center hover:text-foreground transition-colors"
                  onClick={() => handleViewList("requests")}
                >
                  <span className="text-lg font-bold text-foreground">{state.list.length}</span>
                  <span>Requests</span>
                </button>
              )}
            </div>

           <div className="flex gap-2">
  {!isOwnProfile ? (
    <>
      {state.isFollowing ? (
        <Button
          size="sm"
          onClick={handleUnfollow}
          disabled={state.loading}
          variant="outline"
          aria-label="Unfollow user"
        >
          <UserX className="w-4 h-4 mr-2" />
          Unfollow
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={handleFollowAction}
          disabled={state.loading}
          variant={followButtonState.variant}
          aria-label="Follow user"
        >
          {state.hasPendingRequest ? (
            <UserCheck className="w-4 h-4 mr-2" />
          ) : (
            <UserPlus className="w-4 h-4 mr-2" />
          )}
          {followButtonState.text}
        </Button>
      )}

      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowShareDialog(true)}
        aria-label="Share profile"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
    </>
  ) : (
    // ✅ On own profile, only show Share button
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setShowShareDialog(true)}
      aria-label="Share your profile"
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  )}
</div>

          </div>
        </CardHeader>
      </Card>

      {/* Share Profile Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Share Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
             <input
  type="text"
  readOnly
  value={profileLink}
  className="w-full border px-2 py-1 rounded text-sm select-all text-foreground bg-background cursor-text"
  aria-label="Profile share link"
  onFocus={(e) => e.target.select()}
/>

              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(profileLink);
                  toast.success("Link copied!");
                }}
                aria-label="Copy profile link"
              >
                Copy
              </Button>
            </div>
            <div className="flex flex-col items-center gap-2">
<QRCodeCanvas
  value={profileLink}
  size={168}
  includeMargin
  style={{ borderRadius: "0.5rem", cursor: "pointer" }}
  onClick={() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "profile-qr.png";
    a.click();
  }}
  title="Click to download QR as PNG"
/>
<Button
  size="sm"
  variant="secondary"
  onClick={async () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast.success("QR code copied to clipboard!");
      } catch {
        toast.error("Failed to copy QR image.");
      }
    });
  }}
>
  Copy QR Image
</Button>

            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Followers/Following/Requests Dialog */}
      <Dialog
        open={state.showDialog}
        onOpenChange={(open) => setState(prev => ({ ...prev, showDialog: open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {state.dialogType === "followers"
                ? "Followers"
                : state.dialogType === "following"
                ? "Following"
                : "Follow Requests"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {state.list.length > 0 ? (
              state.list.map((u) => (
                <div
                  key={u.id}
                  className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div>
                    <p>{u.name}</p>
                    {/* <p className="text-xs text-muted-foreground">{u.email}</p> */}
                    {u.requested_at && (
                      <p className="text-xs">Requested {formatDate(u.requested_at)}</p>
                    )}
                  </div>
                  {state.dialogType === "requests" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequestAction(u.id, "reject")}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRequestAction(u.id, "accept")}
                      >
                        Accept
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {state.dialogType === "requests" ? "No pending requests" : `No ${state.dialogType} found`}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
