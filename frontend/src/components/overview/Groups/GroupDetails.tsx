import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, isToday, isYesterday } from "date-fns";
import {
  getGroupMembers,
  getGroupStatus,
  getGroupMessages,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  uploadPDFToGroup,
  removeMember,
  deleteGroupMessage,
  deleteGroupMessages,
} from "@/api/grp";
import { io, Socket } from "socket.io-client";

type Member = { id: number; first_name: string; last_name: string };
type Message = {
  id: number;
  message_text: string;
  sender: { id: number; first_name: string; last_name: string };
  createdAt: string;
  senderMe?: boolean;
  isPdfLink?: boolean;
};
type PendingRequest = {
  id: number;
  User: { 
    id: number; first_name: string; last_name: string };
};

const SOCKET_URL = "http://localhost:3000";


function isValidPdfLink(message: string): boolean {
  if (!message || typeof message !== "string") return false;
  try {
    const url = new URL(message);
    return url.pathname.toLowerCase().endsWith(".pdf");
  } catch {
    const trimmed = message.trim();
    return trimmed.includes("/") && trimmed.toLowerCase().endsWith(".pdf");
  }
}

// Linkifies URLs in messages
const linkify = (text: string) => {
  const urlRegex =
    /((?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_+.~#?&//=]*))/gi;
  const parts = text.split(urlRegex).filter(Boolean);
  return parts.map((part, idx) => {
    if (urlRegex.test(part)) {
      let href = part;
      if (!part.match(/^https?:\/\//)) href = "http://" + part;
      try {
        const urlObj = new URL(href);
        if (urlObj.pathname === "/") href = href.replace(/\/$/, "");
      } catch {}
      return (
        <a
          key={idx}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-400 hover:text-blue-500 break-all whitespace-normal"
        >
          {part}
        </a>
      );
    }
    return <span key={idx}>{part}</span>;
  });
};

const formatDayLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM dd");
};

const formatTimeLabel = (dateStr: string) => format(new Date(dateStr), "p");

const cleanFilename = (filename: string) => {
  if (!filename) return "";
  const parts = filename.split("-");
  if (parts.length > 1 && /^\d+$/.test(parts[0])) return parts.slice(1).join("-");
  return filename;
};

export default function GroupDetails() {
  const { id } = useParams();
  const groupId = Number(id);
  const navigate = useNavigate();

  // ----- Mobile sidebar state -----
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // ----- Other states -----
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
  const [confirmDeleteMessageId, setConfirmDeleteMessageId] = useState<number | null>(null);
  const [confirmBatchDeleteOpen, setConfirmBatchDeleteOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [groupName, setGroupName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [confirmRemoveMemberId, setConfirmRemoveMemberId] = useState<number | null>(null);
  const [highlightMemberId, setHighlightMemberId] = useState<number | null>(null);

  // Open confirmation dialog to remove member
  const handleRemoveMember = (memberId: number) => {
    setConfirmRemoveMemberId(memberId);
  };

  // Confirm removal
  const confirmRemove = async () => {
    if (confirmRemoveMemberId === null) return;

    try {
      await removeMember(groupId, confirmRemoveMemberId);
      toast({
        title: "User Removed",
        description: "Member has been removed successfully.",
      });
      setMembers((prev) => prev.filter((m) => m.id !== confirmRemoveMemberId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Unable to remove member.",
        variant: "destructive",
      });
    } finally {
      setConfirmRemoveMemberId(null);
    }
  };

  // Cancel removal
  const cancelRemove = () => {
    setConfirmRemoveMemberId(null);
  };

const fetchData = async () => {
  try {
    const [memberRes, statusRes, messageRes, pendingRes] = await Promise.all([
      getGroupMembers(groupId),
      getGroupStatus(),
      getGroupMessages(groupId),
      getJoinRequests(groupId),
    ]);
    setUserId(statusRes.userId);

    const groups = statusRes.groups || [];
    const matched = groups.find(
      (g: any) =>
        g.id === groupId ||
        (g.group && (g.group.id === groupId || g.group.group_id === groupId))
    );

    if (!matched) {
        toast({
          title: "Access Denied",
          description: "You are no longer a member of this group.",
          variant: "destructive",
        });
        // Hard redirect replaces history entry and reloads page
        window.location.replace("/groups");
        return; // stop further execution
      }
      
    setGroupName(
      matched.group_name || matched.group?.group_name || matched.name || "Group"
    );

    const adminUserId = matched.created_by || matched.group?.created_by;
    setAdminId(adminUserId);
    setIsAdmin(statusRes.userId === adminUserId);

    const rawMembers = memberRes.members || [];
    const normalizedMembers = rawMembers.map((m: any) => {
      if (m.first_name && m.last_name) return m;
      if (m.User)
        return {
          id: m.User.id,
          first_name: m.User.first_name,
          last_name: m.User.last_name,
        };
      return m;
    });
    setMembers(normalizedMembers);

    setMessages(
      (messageRes.messages || []).map((m: Message) => ({
        ...m,
        senderMe: m.sender.id === statusRes.userId,
        isPdfLink: m.isPdfLink ?? isValidPdfLink(m.message_text),
      }))
    );

    setPending(pendingRes.requests || []);
  } catch (err: any) {
    toast({
      title: "Access Denied",
      description: err?.message || "Unable to fetch group details.",
      variant: "destructive",
    });
  }
};
useEffect(() => {
  function handleResize() {
    // Match Tailwind's md breakpoint (768px and up)
    if (window.innerWidth >= 768 && sidebarOpen) {
      setSidebarOpen(false);
    }
  }

  window.addEventListener("resize", handleResize);
  // Also check on mount in case resize while sidebar is open
  handleResize();

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, [sidebarOpen]);
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      setSidebarOpen(false);
    }
  };
 const handleDeleteMessage = (messageId: number) => setConfirmDeleteMessageId(messageId);

  const confirmDeleteMessage = async (messageId: number) => {
    setConfirmDeleteMessageId(null);
    try {
      await deleteGroupMessage(groupId, messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      setSelectedMessageIds((prev) => prev.filter((id) => id !== messageId));
      toast({ title: "Deleted", description: "Message deleted successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to delete message.", variant: "destructive" });
    }
  };

  const openBatchDeleteConfirm = () => {
    if (!selectedMessageIds.length) return;
    setConfirmBatchDeleteOpen(true);
  };

  const confirmBatchDeleteMessages = async () => {
    setConfirmBatchDeleteOpen(false);
    try {
      await deleteGroupMessages(groupId, selectedMessageIds);
      setMessages((prev) => prev.filter((m) => !selectedMessageIds.includes(m.id)));
      setSelectedMessageIds([]);
      toast({ title: "Deleted", description: "Selected messages deleted successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to delete selected messages.", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchData();
    if (!groupId) return;

    const socket = io(SOCKET_URL, { withCredentials: true });

    socket.emit("joinGroup", groupId);

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          ...msg,
          senderMe: msg.sender?.id === userId,
          isPdf: msg.isPdfLink ?? isValidPdfLink(msg.message_text),
        },
      ]);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });

    socket.on("joinRequestUpdate", (payload) => {
      setPending((prev) => {
        if (payload.type === "add" && payload.request) {
          if (prev.some((r) => r.id === payload.request.id)) return prev;
          return [...prev, payload.request];
        } else if (payload.type === "remove" && payload.requestId) {
          return prev.filter((r) => r.id !== payload.requestId);
        }
        return prev;
      });
    });

    socket.on("memberRemoved", ({ userId: removedUserId, groupId: removedGroupId }) => {
      if (removedGroupId === groupId) {
        setMembers((prev) => prev.filter((member) => member.id !== removedUserId));
        if (removedUserId === userId) {
          toast({
            title: "Removed from group",
            description: "You have been removed from this group.",
            variant: "destructive",
          });
          // Optionally redirect or close chat here
          setTimeout(() => {
            window.location.replace("/groups");
          }, 1500);
        }
      }
    });
     socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      setSelectedMessageIds((prev) => prev.filter((id) => id !== messageId));
    });

    socket.on("messagesDeleted", ({ messageIds }) => {
      setMessages((prev) => prev.filter((m) => !messageIds.includes(m.id)));
      setSelectedMessageIds((prev) => prev.filter((id) => !messageIds.includes(id)));
    });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [groupId, userId]);

  const handleSend = () => {
    if (!newMessage.trim() || !userId) return;
    if (!socketRef.current) {
      toast({
        title: "No connection",
        description: "Unable to send message, socket not connected.",
        variant: "destructive",
      });
      return;
    }
    socketRef.current.emit("groupMessage", {
      groupId,
      userId,
      message: newMessage.trim(),
    });
    setNewMessage("");
  };

  const handleApprove = async (reqId: number) => {
    try {
      await approveJoinRequest(groupId, reqId);
      toast({ title: "Approved", description: "User approved successfully." });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to approve user.", variant: "destructive" });
    }
  };

  const handleReject = async (reqId: number) => {
    try {
      await rejectJoinRequest(reqId);
      toast({ title: "Rejected", description: "User request rejected." });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to reject request.", variant: "destructive" });
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      });
      return;
    }
    try {
      const uploadRes = await uploadPDFToGroup(groupId, file);
      if (socketRef.current && userId) {
        socketRef.current.emit("groupMessage", {
          groupId,
          userId,
          message: uploadRes.filePath,
          isPdfLink: true,
        });
      }
      toast({
        title: "Upload Success",
        description: "PDF uploaded and shared in group chat.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      console.error("PDF upload error:", error);
      toast({
        title: "Upload Failed",
        description: error?.message || "Failed to upload PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      className="flex flex-col h-screen bg-[#101513] text-[#cbd5ca] font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Confirmation Modal for Remove Member */}
      <AnimatePresence>
        {confirmRemoveMemberId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#161c1a] border border-gray-700 rounded-lg p-6 max-w-sm w-full text-gray-200 shadow-lg"
            >
              <p className="mb-4 text-center text-lg">
                Are you sure you want to remove{" "}
                <span className="font-semibold">
                  {members.find((m) => m.id === confirmRemoveMemberId)?.first_name ?? "this user"}
                </span>{" "}
                from this group?
              </p>
              <div className="flex justify-center gap-8">
                <Button variant="secondary" onClick={cancelRemove}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmRemove}>
                  Remove
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with mobile menu */}
      <header className="bg-[#1f2c27] px-4 py-4 border-b border-gray-800 flex justify-between items-center md:px-6">
        <button
          className="md:hidden p-2 rounded hover:bg-green-700 focus:outline-none"
          aria-label="Show group sidebar"
          title="Show members"
          onClick={() => setSidebarOpen(true)}
        >
          <svg className="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold truncate text-gray-100 text-center flex-1">{groupName}</h1>
        <span className="md:hidden w-6"></span>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-[380px] min-w-[240px] border-r border-gray-800 bg-[#161c1a]">
          <div className="p-5 pb-2 font-semibold text-base border-b border-gray-800 text-gray-300 select-none">
            Members
          </div>
          <ul className="flex-1 overflow-y-auto divide-y divide-gray-800">
            {members.map((m) => {
              const isMe = m.id === userId;
              const isMemberAdmin = m.id === adminId;
              let extra = "";
              if (isMe && isMemberAdmin) extra = " (me, admin)";
              else if (isMe) extra = " (me)";
              else if (isMemberAdmin) extra = " (admin)";
              return (
                <li
                  key={m.id}
                  className={`px-5 py-3 cursor-pointer rounded-md hover:bg-green-900/30 ${
                    highlightMemberId === m.id ? "bg-green-900/60" : ""
                  }`}
                  onClick={() => {
                    if (highlightMemberId !== m.id) setHighlightMemberId(m.id);
                  }}
                  title={`${m.first_name} ${m.last_name}${extra}`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <span>
                    <span className="font-medium text-[#d1dbcc]">
                      {m.first_name} {m.last_name}
                    </span>
                    <span className="ml-1 text-xs font-semibold text-yellow-400">{extra}</span>
                  </span>
                  {isAdmin && !isMe && (
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="text-red-500 hover:text-red-600 font-semibold ml-3"
                      aria-label={`Remove ${m.first_name} ${m.last_name}`}
                      title={`Remove ${m.first_name} ${m.last_name}`}
                      type="button"
                    >
                      &times;
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          <div>
            <div className="pt-5 pb-2 px-5 font-semibold text-base border-t border-gray-800 bg-[#191e1a] text-gray-400 select-none">
              Join Requests
            </div>
            {pending.length > 0 ? (
                               <ul className="divide-y divide-gray-800 bg-[#191e1a] overflow-y-auto max-h-[180px]">
  {pending.map((p) => (
    <li
      key={p.id}
      className="px-5 py-3 flex items-center justify-between text-gray-300"
    >
      
      <span
  className="text-sm cursor-pointer text-gray-300 hover:text-green-400 transition-colors duration-200"
  onClick={() => navigate(`/profile/${p.User.id}`)}
  title="View profile"
>
  {p.User.first_name} {p.User.last_name}
</span>

      {isAdmin && (
        <div className="flex gap-1">
          <Button size="sm" variant="default" onClick={() => handleApprove(p.id)}>
            ✔
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleReject(p.id)}>
            ✘
          </Button>
        </div>
      )}
    </li>
  ))}
</ul>
            ) : (
              <div className="text-gray-500 px-5 py-3 bg-[#191e1a] select-none">No join requests.</div>
            )}
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWER */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                ref={overlayRef}
                onClick={handleOverlayClick}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 bottom-0 w-80 bg-[#161c1a] border-r border-gray-800 z-50 flex flex-col"
              >
                <div className="p-4 border-b border-gray-800 flex justify-between items-center text-gray-300 font-semibold">
                  <span>Members</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                    className="hover:text-white text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <ul className="flex-1 overflow-y-auto divide-y divide-gray-800">
                  {members.map((m) => {
                    const isMe = m.id === userId;
                    const isMemberAdmin = m.id === adminId;
                    let extra = "";
                    if (isMe && isMemberAdmin) extra = " (me, admin)";
                    else if (isMe) extra = " (me)";
                    else if (isMemberAdmin) extra = " (admin)";
                    return (
                      <li
                        key={m.id}
                        className={`px-5 py-3 cursor-pointer rounded-md hover:bg-green-900/30 ${
                          highlightMemberId === m.id ? "bg-green-900/60" : ""
                        }`}
                        onClick={() => {
                          setSidebarOpen(false);
                          if (highlightMemberId !== m.id) setHighlightMemberId(m.id);
                        }}
                        title={`${m.first_name} ${m.last_name}${extra}`}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                      >
                        <span>
                          <span className="font-medium text-[#d1dbcc]">
                            {m.first_name} {m.last_name}
                          </span>
                          <span className="ml-1 text-xs font-semibold text-yellow-400">{extra}</span>
                        </span>
                        {isAdmin && !isMe && (
                          <button
                            onClick={() => handleRemoveMember(m.id)}
                            className="text-red-500 hover:text-red-600 font-semibold ml-3"
                            aria-label={`Remove ${m.first_name} ${m.last_name}`}
                            title={`Remove ${m.first_name} ${m.last_name}`}
                            type="button"
                          >
                            &times;
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <div>
                  <div className="pt-5 pb-2 px-5 font-semibold text-base border-t border-gray-800 bg-[#191e1a] text-gray-400 select-none">
                    Join Requests
                  </div>
                  {pending.length > 0 ? (
            
                    <ul className="divide-y divide-gray-800 bg-[#191e1a] overflow-y-auto max-h-[180px]">
  {pending.map((p) => (
    <li
      key={p.id}
      className="px-5 py-3 flex items-center justify-between text-gray-300"
    >
      
      <span
  className="text-sm cursor-pointer text-gray-300 hover:text-green-400 transition-colors duration-200"
  onClick={() => navigate(`/profile/${p.User.id}`)}
  title="View profile"
>
  {p.User.first_name} {p.User.last_name}
</span>

      {isAdmin && (
        <div className="flex gap-1">
          <Button size="sm" variant="default" onClick={() => handleApprove(p.id)}>
            ✔
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleReject(p.id)}>
            ✘
          </Button>
        </div>
      )}
    </li>
  ))}
</ul>

                  ) : (
                    <div className="text-gray-500 px-5 py-3 bg-[#191e1a] select-none">No join requests.</div>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* CHAT MAIN */}
<AnimatePresence>
  {/* Single Message Delete Confirmation */}
  {confirmDeleteMessageId !== null && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
      onClick={() => setConfirmDeleteMessageId(null)}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-[#161c1a] p-6 rounded-lg max-w-sm w-full shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-lg mb-4 text-gray-200">
          Are you sure you want to delete this message?
        </p>
        <div className="flex justify-center gap-6">
          <Button variant="secondary" onClick={() => setConfirmDeleteMessageId(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => confirmDeleteMessage(confirmDeleteMessageId!)}>
            Delete
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )}

  {/* Batch Delete Confirmation */}
  {confirmBatchDeleteOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
      onClick={() => setConfirmBatchDeleteOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-[#161c1a] p-6 rounded-lg max-w-sm w-full shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-lg mb-4 text-gray-200">
          Are you sure you want to delete {selectedMessageIds.length} selected messages?
        </p>
        <div className="flex justify-center gap-6">
          <Button variant="secondary" onClick={() => setConfirmBatchDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmBatchDeleteMessages}>
            Delete
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

<main className="flex-1 flex flex-col bg-[#101513] min-h-0 overflow-hidden">
  <div className="flex-1 overflow-y-auto px-4 md:px-6 space-y-6 py-4">

    {/* Batch Delete Button */}
    {selectedMessageIds.length > 0 && (
      <Button variant="destructive" onClick={openBatchDeleteConfirm} className="mb-2">
        Delete Selected ({selectedMessageIds.length})
      </Button>
    )}

    {/* Messages grouped by day */}
    {Object.entries(
      messages.reduce<Record<string, Message[]>>((acc, msg) => {
        const day = formatDayLabel(msg.createdAt);
        (acc[day] = acc[day] || []).push(msg);
        return acc;
      }, {})
    ).map(([day, dayMessages]) => (
      <div key={day}>
        <div className="text-center mt-4 mb-2 select-none text-gray-500 text-xs font-semibold tracking-wide">{day}</div>
        <div className="space-y-4">
          {dayMessages.map((msg) => {
            const canDelete = isAdmin || msg.sender.id === userId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[60%] ${msg.senderMe ? "ml-auto items-end" : "mr-auto items-start"} relative`}
              >
                {!msg.senderMe && (
                  <div className="mb-1 text-sm font-semibold select-none text-gray-400">
                    {msg.sender.first_name} {msg.sender.last_name}
                  </div>
                )}
                <div
                  className={`relative rounded-xl px-4 py-2 whitespace-pre-wrap break-words ${
                    msg.senderMe
                      ? "bg-green-700 text-green-100 rounded-br-none"
                      : msg.isPdfLink
                      ? "bg-gradient-to-br from-gray-600 to-gray-700 text-gray-100 rounded-bl-none border border-gray-600 shadow-md"
                      : "bg-gray-700 text-gray-200 rounded-bl-none"
                  }`}
                  title={`${msg.sender.first_name} ${msg.sender.last_name}`}
                  style={{
                    paddingRight: canDelete ? "48px" : undefined,
                    paddingBottom: "20px",  // Space for timestamp to avoid overlap
                    minWidth: "64px",       // Optional: improves appearance on short texts
                  }}
                >
                  {msg.isPdfLink ? (
                    <div className="select-text max-w-xs">
                      <div className="flex items-center gap-2 text-gray-200 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span className="text-sm font-semibold select-text truncate" title={cleanFilename(msg.message_text.split("/").pop() || "")}>
                          {cleanFilename(msg.message_text.split("/").pop() || "")}
                        </span>
                      </div>
                      <a
                        href={`${SOCKET_URL}${msg.message_text}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full rounded bg-gray-600 hover:bg-gray-500 px-4 py-1.5 text-center font-semibold text-gray-100 transition select-none"
                        aria-label="View PDF"
                      >
                        View PDF
                      </a>
                    </div>
                  ) : (
                    <div>{linkify(msg.message_text)}</div>
                  )}

                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(msg.id);
                      }}
                      title="Delete message"
                      aria-label="Delete message"
                      className="absolute top-1 right-2 p-1 rounded-md hover:bg-red-700 transition-colors duration-200"
                      style={{ zIndex: 3 }}
                    >
                      {/* SVG Trash Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-red-400 hover:text-red-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  )}

                  <span
                    className={`absolute text-[10px] text-gray-300 select-none whitespace-nowrap pointer-events-none ${
                      msg.senderMe ? "right-2 bottom-1" : "left-2 bottom-1"
                    }`}
                  >
                    {formatTimeLabel(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ))}
    <div ref={scrollRef} />
  </div>

  {/* Message Input and Upload PDF */}
  <div className="border-t border-gray-800 px-4 md:px-6 py-4 bg-[#181b16] flex items-center gap-3 rounded-b-lg">
    <button
      type="button"
      onClick={handleUploadClick}
      className="text-gray-300 hover:text-gray-100 transition"
      title="Upload PDF"
      aria-label="Upload PDF"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
    <Input
      placeholder="Type a message..."
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      }}
      className="bg-[#2a392f] border border-gray-700 rounded-lg text-white focus:ring-0 focus:border-green-600"
    />
    <Button onClick={handleSend} className="bg-green-700 hover:bg-green-600 rounded-lg px-5 py-2">
      Send
    </Button>
    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf"
      className="hidden"
      onChange={handleFileChange}
    />
  </div>
</main>




      </div>
    </motion.div>
  );
}
