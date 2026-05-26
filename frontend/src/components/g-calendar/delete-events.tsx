import { useState } from "react";
import { AppErrClient } from "@/utils/app-err";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Loader, Trash } from "lucide-react";

interface DeleteEventsDrawerProps {
  eventId: string;
}

const DeleteEventsDrawer = ({ eventId }: DeleteEventsDrawerProps) => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/google/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete event");
      }

      setOpen(false);
      // You can also trigger some event refresh here if needed
    } catch (error) {
      AppErrClient(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant={"destructive"} size={"sm"}>
          <Trash className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Delete Event</DrawerTitle>
          <DrawerDescription>Are you sure you want to delete this event?</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="flex items-center flex-row justify-end gap-3">
          <DrawerClose asChild>
            <Button variant={"outline"} size={"sm"}>
              Cancel
            </Button>
          </DrawerClose>
          <Button
            variant={"destructive"}
            size={"sm"}
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DeleteEventsDrawer;
