import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
//import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { createGroup } from "@/api/grp";



const schema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters"),
});

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
  
};

export default function CreateGroupModal({ open, setOpen, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      await createGroup(data);

      toast({ title: "Group created successfully" });
      reset();
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      toast({
        title: "Failed to create group",
        description: err.response?.data?.message || "Server error",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <Input
            placeholder="Enter group name"
            {...register("name")}
            className={errors.name ? "border-red-500" : ""}
          />
          {/* {errors.name && (
            <p className="text-sm text-red-500 -mt-2">{errors.name.message}</p>
          )} */}
          {errors.name && (
  <p className="text-sm text-red-500 -mt-2">
    {errors.name.message?.toString()}
  </p>
)}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
