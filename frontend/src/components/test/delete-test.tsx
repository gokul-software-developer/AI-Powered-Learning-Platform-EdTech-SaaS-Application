import { Loader2Icon, Trash } from "lucide-react"
import { Button } from "../ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "../ui/drawer"
import { useState } from "react"
import { AppErrClient } from "@/utils/app-err"

const DeleteTest = ({id} : {id : string}) => {
    const [open, setOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const onSubmit = async () => {
        try {
            if (!id) {
                throw new Error("Test not found, reload again to continue");
            }
            console.log('Test deleted', id);
        } catch (error) {
            AppErrClient(error);
        } finally {
            setIsLoading(false);
            setOpen(false);
        }
    }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
            <Button variant={"destructive"} size={"sm"}>
                <Trash className="h-4 w-4" />
            </Button>
        </DrawerTrigger>

        <DrawerContent>
            <DrawerHeader>
                <DrawerTitle>
                    Delete Test
                </DrawerTitle>
                <DrawerDescription>
                    Are you sure you want to delete this test?
                </DrawerDescription>
            </DrawerHeader>

            <DrawerFooter className="flex items-center flex-row justify-end gap-3">
                <DrawerClose asChild>
                    <Button variant={"outline"} size={"sm"}>
                        Cancel
                    </Button>
                </DrawerClose>
                <Button disabled={isLoading} onSubmit={onSubmit} variant={"destructive"} size={"sm"}>
                    {isLoading ? <>
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        Deleting...
                    </> : <>Delete Test</>}
                </Button>
            </DrawerFooter>
        </DrawerContent>
    </Drawer>
  )
}

export default DeleteTest