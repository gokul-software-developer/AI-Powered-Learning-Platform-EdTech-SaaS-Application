import { Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "../ui/drawer"

const DeleteBotDrawer = () => {
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
                    Delete Bot
                </DrawerTitle>
                <DrawerDescription>
                    Are you sure you want to delete this bot? This action cannot be undone.
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

export default DeleteBotDrawer