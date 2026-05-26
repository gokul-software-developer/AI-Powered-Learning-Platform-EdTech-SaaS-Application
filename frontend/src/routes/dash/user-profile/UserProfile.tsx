"use client";

import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettingsDialog from "@/components/user-profile/ProfileSettingsDialog";
import UserProfileCard from "@/components/user-profile/UserProfileCard";
import StudyPlansTab from "@/components/user-profile/StudyPlansTab";
import GroupsTab from "@/components/user-profile/GroupsTab";
import AccomplishmentsTab from "@/components/user-profile/AccomplishmentsTab";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface UserProfile {
  id: number;
  name: string;
  bio?: string;
  joined_on: string;
  follower_count: number;
  following_count: number;
  is_public: boolean;
  sync_with_google?: boolean;
  sync_with_notion?: boolean;
}

export interface StudyPlan {
  id: number;
  plan_name: string;
  user_id: number;
  start_date: string;
  end_date: string;
  study_time: number;
  weekdays: string[];
  courses?: any[];
}

export default function UserProfilePage() {
  const { userId: profileUserId } = useParams<{ userId: string }>();
  const [state, setState] = useState({
    user: null as UserProfile | null,
    studyPlans: [] as StudyPlan[],
    isPublic: true,
    loading: true,
    isOwnProfile: false,
    isFollowing: false,
    settingsOpen: false,
    error: null as string | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Get current user's session
        const session = await axios.get(`${BASE_URL}/session/check-session`, {
          withCredentials: true,
        });
        const currentUserId = session.data?.user?.userId?.toString();

        if (!profileUserId) throw new Error("Profile ID not found");

        const isOwn = currentUserId === profileUserId;

        // Fetch profile and study plans concurrently
        const [profile, plans] = await Promise.all([
          axios.get(`${BASE_URL}/profile/${profileUserId}`, {
            withCredentials: true,
          }),
          axios.get(`${BASE_URL}/studyplan/study-plans?userId=${profileUserId}`, {
            withCredentials: true,
          }),
        ]);

        let isFollowing = false;

        // If not own profile, fetch isFollowing status
        if (!isOwn) {
          try {
            const followRes = await axios.get(
              `${BASE_URL}/profile/${profileUserId}/is-following`,
              { withCredentials: true }
            );
            isFollowing = followRes.data?.isFollowing ?? false;
          } catch (followErr) {
            console.warn("Failed to fetch following status:", followErr);
            isFollowing = false;
          }
        }

        setState((prev) => ({
          ...prev,
          user: profile.data,
          studyPlans: plans.data.studyPlans || [],
          isPublic: profile.data.is_public,
          isOwnProfile: isOwn,
          isFollowing,
          loading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to load profile",
          loading: false,
        }));
      }
    };

    fetchData();
  }, [profileUserId]);

  const handleToggle = async (val: boolean) => {
    try {
      const session = await axios.get(`${BASE_URL}/session/check-session`, {
        withCredentials: true,
      });
      const currentUserId = session.data.user?.userId?.toString();
      if (currentUserId !== profileUserId) return;

      setState((s) => ({ ...s, isPublic: val }));
      await axios.patch(
        `${BASE_URL}/profile/${currentUserId}`,
        { is_public: val },
        { withCredentials: true }
      );
      toast.success("Profile visibility updated");
    } catch {
      toast.error("Failed to update visibility");
      setState((s) => ({ ...s, isPublic: !val }));
    }
  };

  if (state.error) {
    return (
      <div className="p-6 text-center text-destructive">
        <h2 className="text-xl font-semibold">Error</h2>
        <p>{state.error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (state.loading || !state.user) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 relative">
      {state.isOwnProfile && (
        <ProfileSettingsDialog
          userId={state.user.id}
          open={state.settingsOpen}
          setOpen={(val) => setState((s) => ({ ...s, settingsOpen: val }))}
          onPublicChange={(val) => setState((s) => ({ ...s, isPublic: val }))}
        />
      )}

      {/* Profile visibility toggle for owner only, uncomment if needed */}
      {/* {state.isOwnProfile && (
        <div className="flex items-center gap-2">
          <Label htmlFor="page-public-toggle">Public Profile</Label>
          <Switch
            id="page-public-toggle"
            checked={state.isPublic}
            onCheckedChange={handleToggle}
          />
        </div>
      )} */}

      <UserProfileCard user={state.user} isOwnProfile={state.isOwnProfile} />

      <Tabs defaultValue="studyplans">
        <TabsList className="w-full justify-start">
          <TabsTrigger
            value="studyplans"
            disabled={!(state.isOwnProfile || state.isPublic || state.isFollowing)}
          >
            Study Plans
          </TabsTrigger>
          <TabsTrigger
            value="groups"
            disabled={!(state.isOwnProfile || state.isPublic || state.isFollowing)}
          >
            Groups
          </TabsTrigger>
          <TabsTrigger
            value="accomplishments"
            disabled={!(state.isOwnProfile || state.isPublic || state.isFollowing)}
          >
            Accomplishments
          </TabsTrigger>
        </TabsList>

        {(state.isOwnProfile || state.isPublic || state.isFollowing) ? (
          <TabsContent value="studyplans">
            <StudyPlansTab
              studyPlans={state.studyPlans}
              isOwnProfile={state.isOwnProfile}
              userName={state.user.name}
            />
          </TabsContent>
        ) : (
          <TabsContent value="studyplans">
            <div className="p-6 text-center text-muted-foreground">
              <p>This profile is private. Please <strong>follow the user</strong> to see their study plans.</p>
            </div>
          </TabsContent>
        )}

        {(state.isOwnProfile || state.isPublic || state.isFollowing) ? (
          <TabsContent value="groups">
            <GroupsTab isOwnProfile={state.isOwnProfile} userName={state.user.name} />
          </TabsContent>
        ) : (
          <TabsContent value="groups">
            <div className="p-6 text-center text-muted-foreground">
              <p>This profile is private. Please <strong>follow the user</strong> to see their groups.</p>
            </div>
          </TabsContent>
        )}

        {(state.isOwnProfile || state.isPublic || state.isFollowing) ? (
          <TabsContent value="accomplishments">
            <AccomplishmentsTab
              isOwnProfile={state.isOwnProfile}
              userId={state.user.id}
              userName={state.user.name}
            />
          </TabsContent>
        ) : (
          <TabsContent value="accomplishments">
            <div className="p-6 text-center text-muted-foreground">
              <p>This profile is private. Please <strong>follow the user</strong> to see their accomplishments.</p>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
//durtion validation in gc
