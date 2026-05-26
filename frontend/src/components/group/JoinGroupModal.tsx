// // import { useForm } from "react-hook-form";
// // import { z } from "zod";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import { toast } from "@/hooks/use-toast";
// // import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// // import { Input } from "@/components/ui/input";
// // import { Button } from "@/components/ui/button";
// // import axios from "axios";
// // import { useState } from "react";

// // const joinSchema = z.object({
// //   code: z.string().length(6, "Group code must be 6 characters"),
// // });
// // type Props = {
// //   open: boolean;
// //   setOpen: (open: boolean) => void;
// //   onSuccess?: () => void; // ✅ Add this
// // };

// // export default function JoinGroupModal({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
// //   const [loading, setLoading] = useState(false);
// //   const {
// //     register,
// //     handleSubmit,
// //     formState: { errors },
// //     reset,
// //   } = useForm<{ code: string }>({
// //     resolver: zodResolver(joinSchema),
// //   });

// //   const onSubmit = async (data: { code: string }) => {
// //     setLoading(true);
// //     try {
// //       const res = await axios.post("/group/join", data);
// //       toast({ title: "Joined!", description: res.data.message });
// //       reset();
// //       setOpen(false);
// //      onSuccess?.(); //
// //     } catch (err: any) {
// //       toast({
// //         variant: "destructive",
// //         title: "Error joining group",
// //         description: err.response?.data?.message || "Something went wrong.",
// //       });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <Dialog open={open} onOpenChange={setOpen}>
// //       <DialogContent className="max-w-sm rounded-2xl">
// //         <DialogHeader>
// //           <DialogTitle className="text-xl font-semibold text-center">Join a Group</DialogTitle>
// //         </DialogHeader>

// //         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
// //           <div>
// //             <Input placeholder="Enter 6-character group code" {...register("code")} />
// //             {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
// //           </div>

// //           <Button type="submit" className="w-full" disabled={loading}>
// //             {loading ? "Joining..." : "Join Group"}
// //           </Button>
// //         </form>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // }
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "@/hooks/use-toast";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// //import axios from "axios";
// import { useState } from "react";
// import { joinGroup } from "@/api/grp";



// // const joinSchema = z.object({
// //   code: z.string().length(6, "Group code must be 6 characters"),
// // });
// const joinSchema = z.object({
//   code: z.string().min(6, "Group code must be at least 6 characters"),
// });


// type Props = {
//   open: boolean;
//   setOpen: (open: boolean) => void;
//   onSuccess?: () => void; // ✅ Add this
// };

// export default function JoinGroupModal({ open, setOpen, onSuccess }: Props) {
//   const [loading, setLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm<{ code: string }>({
//     resolver: zodResolver(joinSchema),
//   });

// //   const onSubmit = async (data: { code: string }) => {
// //     setLoading(true);
// //     try {
// //       //const res = await axios.post("/group/join", data);
// //       await joinGroup(data.code);
// //       toast({ title: "Joined!", description: "You have successfully joined the group." });
// //       reset();
// //       setOpen(false);
// //       onSuccess?.(); // ✅ Trigger refresh in parent
// //     } catch (err: any) {
// //       toast({
// //         variant: "destructive",
// //         title: "Error joining group",
// //         description: err.response?.data?.message || "Something went wrong.",
// //       });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
// const onSubmit = async (data: { code: string }) => {
//   setLoading(true);
//   try {
//     await joinGroup(data.code);
//     toast({
//       title: "Request Sent!",
//       description: "Your request to join the group has been sent. Please wait for approval.",
//     });
//     reset();
//     setOpen(false);
//     onSuccess?.(); // Refresh list if needed
//   } catch (err: any) {
//     toast({
//       variant: "destructive",
//       title: "Error requesting to join",
//       description: err.message || "Something went wrong.",
//     });
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogContent className="max-w-sm rounded-2xl">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-semibold text-center">Join a Group</DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <div>
//             <Input placeholder="Enter 6-character group code" {...register("code")} />
//             {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
//           </div>

//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading ? "Joining..." : "Join Group"}
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { joinGroup } from "@/api/grp";

// Zod validation: code must be at least 6 chars
const joinSchema = z.object({
  code: z.string().min(6, "Group code must be at least 6 characters"),
});

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
};

export default function JoinGroupModal({ open, setOpen, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ code: string }>({
    resolver: zodResolver(joinSchema),
  });

  // Submit handler with comprehensive error reporting
  const onSubmit = async (data: { code: string }) => {
    setLoading(true);
    try {
      await joinGroup(data.code);
      toast({
        title: "Request Sent!",
        description: "Your request to join the group has been sent. Please wait for approval.",
      });
      reset();
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      // Attempt to extract backend response message
      const msg =
        err?.response?.data?.message
          ? err.response.data.message
          : err?.message || "Something went wrong.";
      toast({
        variant: "destructive",
        title: "Error requesting to join",
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Join a Group
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              placeholder="Enter 6-character group code"
              {...register("code")}
              disabled={loading}
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Joining..." : "Join Group"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
