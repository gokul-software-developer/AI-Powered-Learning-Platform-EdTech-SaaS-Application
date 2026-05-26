import { Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "../ui/drawer"

const DeleteSchedule = () => {
  return (
    <Drawer>
        <DrawerTrigger asChild>
            <Button size={"sm"} variant={"destructive"}>
                <Trash2 />
            </Button>
        </DrawerTrigger>
        <DrawerContent>
            <DrawerHeader>
                <DrawerTitle>
                    Delete Schedules
                </DrawerTitle>
                <DrawerDescription>
                    Are you sure you want to delete this schedules? your progress in dashboard will be lost.
                </DrawerDescription>
            </DrawerHeader>

            <DrawerFooter>
                <DrawerClose asChild>
                    <Button variant="outline" size="sm">Cancel</Button>
                </DrawerClose>
                <Button variant="destructive" size="sm">Delete</Button>
            </DrawerFooter>
        </DrawerContent>
    </Drawer>
  )
}

export default DeleteSchedule