import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import JoinGroupModal from "@/components/group/JoinGroupModal";
import CreateGroupModal from "@/components/group/CreateGroupModal";
import { useNavigate } from "react-router-dom";
import { getMyGroups, leaveGroup, deleteGroup } from "@/api/grp";
import { Copy } from "lucide-react";
import { io, Socket } from "socket.io-client";

type GroupStatus = {
  id: number;
  group_name: string;
  join_code: string;
  created_by: number;
  createdAt: string;
  isAdmin: boolean;
  studyPlan?: any | null;
};

const SOCKET_URL = "http://localhost:3000";

const GroupLanding = () => {
  const [createdGroups, setCreatedGroups] = useState<GroupStatus[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<GroupStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null);
  const navigate = useNavigate();

  const socketRef = useRef<Socket | null>(null);
  const [userId, setUserId] = useState<number | null>(null); // Assuming you get this from your auth context or API

  // Fetch groups API call
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await getMyGroups();
      const allGroups: GroupStatus[] = res.groups || [];
      setUserId(res.userId);
      const myId = res.userId;
      setCreatedGroups(allGroups.filter((g) => g.created_by === myId));
      setJoinedGroups(allGroups.filter((g) => g.created_by !== myId));
    } catch (err) {
      toast({ title: "Error fetching groups", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (groupId: number) => {
    try {
      await leaveGroup(groupId);
      toast({ title: "Left group successfully" });
      fetchGroups();
    } catch {
      toast({ title: "Failed to leave group", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteGroupId) return;
    try {
      await deleteGroup(deleteGroupId);
      toast({ title: "Group deleted" });
      setDeleteGroupId(null);
      fetchGroups();
    } catch (e) {
      toast({ title: "Failed to delete group", variant: "destructive" });
    }
  };

  // Initialize and listen to socket events for real-time group updates
  useEffect(() => {
    fetchGroups();

    if (!userId) return; // Wait until userId is available

    const socket = io(SOCKET_URL, { withCredentials: true });

    // Register personal user room so the server can send direct messages
    socket.emit("register", { userId });

    // Listen for group membership updates
    socket.on("groupsUpdated", () => {
      toast({
        title: "Group membership updated",
        description: "Your group memberships have changed.",
      });
      fetchGroups(); // Re-fetch the groups list to update UI
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <motion.div
      className="max-w-5xl mx-auto p-4 space-y-9"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-center md:text-left text-[#e4e4e7] tracking-tight">
          My Study Groups
        </h1>
        <div className="flex gap-2 justify-center md:justify-end">
          <Button
            size="lg"
            className="bg-green-600/90 hover:bg-green-500 text-white font-semibold rounded-full shadow-none"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Group
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => setShowJoinModal(true)}
            className="border border-green-600/30 text-green-400 hover:bg-green-700/10 hover:text-white rounded-full"
          >
            Join Group
          </Button>
        </div>
      </header>

      {loading ? (
        <p className="text-center text-gray-400 py-12">Loading groups...</p>
      ) : createdGroups.length === 0 && joinedGroups.length === 0 ? (
        <div className="flex flex-col gap-5 items-center mt-12">
          <span className="text-gray-400 text-xl mb-1">You are not in any groups yet.</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Created Groups */}
          {createdGroups.length > 0 && (
            <section>
              <h2 className="text-base font-bold mb-4 text-green-400">Created Groups</h2>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {createdGroups.map((group) => (
                  <Card
                    key={group.id}
                    className="bg-[#181d20] border border-[#242f26] shadow-none rounded-xl hover:border-green-700/30 transition-all"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-lg font-semibold text-[#e4e4e7]">{group.group_name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Created: {new Date(group.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="flex items-center text-[11px] bg-green-900/10 border border-green-700/20 text-white-500 py-1 px-3 rounded-full font-medium select-none">
                              Code: {group.join_code}
                              <button
                                aria-label="Copy join code"
                                onClick={() => {
                                  navigator.clipboard.writeText(group.join_code).then(() => {
                                    toast({ title: "Code copied", description: `Join code copied to clipboard.` });
                                  });
                                }}
                                className="ml-2 p-1 rounded hover:bg-green-700/30 transition"
                                type="button"
                              >
                                <Copy className="w-4 h-4 text-green-500" />
                              </button>
                            </span>
                            <span className="text-[11px] bg-green-900/10 text-green-400 px-3 rounded-full font-medium select-none ml-2">
                              Admin
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-300 border border-gray-700/30 hover:border-green-600/40 hover:text-green-300 rounded-full"
                            onClick={() => navigate(`/group/${group.id}`)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="text-red-400 border border-red-800/30 bg-transparent hover:bg-red-900/20 hover:text-red-300 rounded-full"
                            variant="ghost"
                            onClick={() => setDeleteGroupId(group.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Joined Groups */}
          {joinedGroups.length > 0 && (
            <section>
              <h2 className="text-base font-bold mb-4 text-green-400">Joined Groups</h2>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {joinedGroups.map((group) => (
                  <Card
                    key={group.id}
                    className="bg-[#181d20] border border-[#242f26] shadow-none rounded-xl hover:border-green-700/20"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-lg font-medium text-[#e7ecea]">{group.group_name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Joined: {new Date(group.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="flex items-center text-[11px] bg-green-900/10 border border-green-700/20 text-white-500 py-1 px-3 rounded-full font-medium select-none">
                              Code: {group.join_code}
                              <button
                                aria-label="Copy join code"
                                onClick={() => {
                                  navigator.clipboard.writeText(group.join_code).then(() => {
                                    toast({ title: "Code copied", description: `Join code copied to clipboard.` });
                                  });
                                }}
                                className="ml-2 p-1 rounded hover:bg-green-700/30 transition"
                                type="button"
                              >
                                <Copy className="w-4 h-4 text-green-500" />
                              </button>
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-300 border border-gray-700/30 hover:border-green-600/40 hover:text-green-300 rounded-full"
                            onClick={() => navigate(`/group/${group.id}`)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="text-red-400 border border-red-800/30 bg-transparent hover:bg-red-900/10 hover:text-red-300 rounded-full"
                            variant="ghost"
                            onClick={() => handleLeave(group.id)}
                          >
                            Leave
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={deleteGroupId !== null} onOpenChange={(v) => !v && setDeleteGroupId(null)}>
        <DialogContent className="max-w-sm rounded-xl p-6 text-center bg-[#161919] border border-gray-700">
          <h2 className="text-lg font-semibold mb-3 text-gray-200">Delete Group?</h2>
          <p className="text-gray-400 mb-6 text-[15px]">
            Are you sure you want to delete this group? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              className="bg-transparent border border-gray-700 text-gray-300 rounded-full px-6"
              onClick={() => setDeleteGroupId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="text-red-300 bg-red-950/40 hover:text-red-200 rounded-full px-6"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <JoinGroupModal open={showJoinModal} setOpen={setShowJoinModal} onSuccess={fetchGroups} />
      <CreateGroupModal open={showCreateModal} setOpen={setShowCreateModal} onSuccess={fetchGroups} />
    </motion.div>
  );
};

export default GroupLanding;
