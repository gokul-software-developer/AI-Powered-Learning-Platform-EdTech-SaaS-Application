// import { useEffect, useState } from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import axios from "axios";

// type UserHeaderProps = {
//   user: any;
//   isOwnProfile: boolean;
//   isFollowing: boolean;
//   loading: boolean;
//   handleToggleFollow: () => void;
// };

// export default function UserHeader({
//   user,
//   isOwnProfile,
//   isFollowing,
//   loading,
//   handleToggleFollow,
// }: UserHeaderProps) {
//   const canSeeCounts = isOwnProfile || user.is_public;
//   const [showDialog, setShowDialog] = useState(false);
//   const [dialogType, setDialogType] = useState<"followers" | "following" | "requests">("followers");
//   const [list, setList] = useState<any[]>([]);
//   const [requestCount, setRequestCount] = useState(0);
//   const [requestLoading, setRequestLoading] = useState(false);

//   // Fetch the relevant user list (followers, following, or pending requests)
//   const handleViewList = async (type: "followers" | "following" | "requests") => {
//     setDialogType(type);
//     setShowDialog(true);

//     try {
//       let url = "";
//       if (type === "followers") {
//         url = `/api/profile/${user.id}/followers`;
//       } else if (type === "following") {
//         url = `/api/profile/${user.id}/following`;
//       } else {
//         url = `/api/profile/requests/pending`;
//       }
//       const res = await axios.get(url);
//       setList(res.data || []);
//     } catch (err) {
//       console.error("Failed to fetch list", err);
//       setList([]);
//     }
//   };

//   // Accept a follow request from a user (in dialog)
//   const handleAccept = async (followerId: number) => {
//     setRequestLoading(true);
//     try {
//       await axios.post(`/api/profile/requests/accept/${followerId}`);
//       setList((prev) => prev.filter((u) => u.id !== followerId));
//       setRequestCount((c) => c - 1);
//     } catch (err) {
//       console.error("Accept error", err);
//     } finally {
//       setRequestLoading(false);
//     }
//   };

//   // Reject a follow request from a user (in dialog)
//   const handleReject = async (followerId: number) => {
//     setRequestLoading(true);
//     try {
//       await axios.post(`/api/profile/requests/reject/${followerId}`);
//       setList((prev) => prev.filter((u) => u.id !== followerId));
//       setRequestCount((c) => c - 1);
//     } catch (err) {
//       console.error("Reject error", err);
//     } finally {
//       setRequestLoading(false);
//     }
//   };

//   // Cancel your own sent request (button on other user's private profile)
//   const handleCancelRequest = async () => {
//     setRequestLoading(true);
//     try {
//       await axios.delete(`/api/profile/requests/${user.id}`);
//       // Optionally, update parent/global state here!
//     } catch (err) {
//       console.error("Cancel request error", err);
//     } finally {
//       setRequestLoading(false);
//     }
//   };

//   // On mount and when viewing own private profile, fetch pending requests count
//   useEffect(() => {
//     const fetchPending = async () => {
//       if (isOwnProfile && !user.is_public) {
//         try {
//           const res = await axios.get("/api/profile/requests/pending");
//           setRequestCount(res.data?.length || 0);
//         } catch (err) {
//           console.error("Error fetching pending requests", err);
//         }
//       }
//     };
//     fetchPending();
//   }, [isOwnProfile, user.is_public]);

//   // Compose avatar fallback string (initials)
//   const initials = user.name
//     ? user.name.split(" ").map((n: string) => n[0]).join("")
//     : "";

//   return (
//     <>
//       <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-6">
//         <div className="flex items-center gap-4">
//           <Avatar className="w-20 h-20">
//             <AvatarImage
//               src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
//               alt={user.name}
//             />
//             <AvatarFallback>{initials}</AvatarFallback>
//           </Avatar>
//           <div>
//             <CardTitle className="text-2xl">{user.name}</CardTitle>
//             {isOwnProfile && (
//               <CardDescription>{user.email || "No email available"}</CardDescription>
//             )}
//             {user.bio && (
//               <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
//             )}
//             {user.joined_on && (
//               <p className="text-xs text-muted-foreground mt-1">
//                 Joined {new Date(user.joined_on).toLocaleDateString()}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Follow counts, requests, and actions */}
//         <div className="flex flex-col items-center sm:items-end gap-2">
//           {canSeeCounts && (
//             <div className="flex gap-6 text-sm text-muted-foreground">
//               <button
//                 className="flex flex-col items-center cursor-pointer"
//                 onClick={() => handleViewList("followers")}
//               >
//                 <span className="text-lg font-bold text-foreground">
//                   {user.follower_count}
//                 </span>
//                 <span>Follrs</span>
//               </button>
//               <button
//                 className="flex flex-col items-center cursor-pointer"
//                 onClick={() => handleViewList("following")}
//               >
//                 <span className="text-lg font-bold text-foreground">
//                   {user.following_count}
//                 </span>
//                 <span>Following</span>
//               </button>
//             </div>
//           )}

//           {/* Show pending requests button if owner of private profile and any requests */}
//           {isOwnProfile && !user.is_public && requestCount > 0 && (
//             <button
//               onClick={() => handleViewList("requests")}
//               className="text-sm text-blue-600 hover:underline mt-2"
//             >
//               {requestCount} Follow Request{requestCount > 1 ? "s" : ""}
//             </button>
//           )}

//           {/* --- FOLLOW BUTTON for NOT own profile --- */}
//           {!isOwnProfile && (
//             <>
//               {isFollowing ? (
//                 <Button
//                   size="sm"
//                   onClick={handleToggleFollow}
//                   disabled={loading || requestLoading}
//                   variant="outline"
//                 >
//                   {loading ? "..." : "Unfollow"}
//                 </Button>
//               ) : !user.is_public && user.hasRequestedFollow ? (
//                 // Show "Requested" and provide cancel button for your own pending request
//                 <div className="flex gap-2 items-center">
//                   <Button size="sm" disabled variant="secondary">
//                     Requested
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={handleCancelRequest}
//                     disabled={requestLoading}
//                   >
//                     Cancel
//                   </Button>
//                 </div>
//               ) : (
//                 <Button
//                   size="sm"
//                   onClick={handleToggleFollow}
//                   disabled={loading}
//                   variant="default"
//                 >
//                   {loading ? "..." : "Follow"}
//                 </Button>
//               )}
//             </>
//           )}
//         </div>
//       </CardHeader>

//       {/* Dialog popup for listing followers, following, or requests */}
//       <Dialog open={showDialog} onOpenChange={setShowDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle className="text-lg font-semibold">
//               {dialogType === "followers"
//                 ? "Followers"
//                 : dialogType === "following"
//                 ? "Following"
//                 : "Pending Follow Requests"}
//             </DialogTitle>
//           </DialogHeader>
//           <div className="mt-4 space-y-3 max-h-[300px] overflow-auto">
//             {list.length > 0 ? (
//               list.map((u) => (
//                 <div key={u.id} className="flex items-center justify-between text-sm">
//                   <div className="flex flex-col">
//                     <span>{u.first_name} {u.last_name}</span>
//                     <span className="text-muted-foreground text-xs">{u.email}</span>
//                   </div>

//                   {/* Request accept/reject buttons when viewing pending requests */}
//                   {dialogType === "requests" && (
//                     <div className="flex gap-2">
//                       <Button
//                         size="sm"
//                         onClick={() => handleAccept(u.id)}
//                         disabled={requestLoading}
//                       >Accept</Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleReject(u.id)}
//                         disabled={requestLoading}
//                       >Reject</Button>
//                     </div>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <p className="text-muted-foreground text-sm text-center">
//                 No users found.
//               </p>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
