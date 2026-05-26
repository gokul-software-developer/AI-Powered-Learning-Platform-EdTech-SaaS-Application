import { AppErrClient } from "@/utils/app-err"
import { Button } from "../ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "../ui/drawer"
import { useState } from "react"
import { Loader } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { logout } from "@/features/auth-slice"

const LogoutButton = () => {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);

    const dispatch = useDispatch();

    const {logoutMutation} = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            setLoading(true); 
            await logoutMutation.mutateAsync();  
            dispatch(logout());
            navigate("/");
        } catch (error) {
            AppErrClient(error);
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
            <Button variant={"destructive"} size={"sm"}>
                Logout
            </Button>
        </DrawerTrigger>
        <DrawerContent>
            <DrawerHeader>
                <DrawerTitle>
                    Logout Confirmation
                </DrawerTitle>
                <DrawerDescription>
                    Are you sure you want to logout?
                </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className="flex items-center flex-row justify-end gap-3">
                <DrawerClose asChild>
                    <Button variant={"outline"} size={"sm"}>Cancel</Button>
                </DrawerClose>
                <Button 
                    variant={"destructive"} 
                    size={"sm"}
                    onClick={handleLogout}
                    disabled={isLoading}
                >
                    {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin" />Logging out..</> : <>Logout</>}
                </Button>
            </DrawerFooter>
        </DrawerContent>
    </Drawer>
  )
}

export default LogoutButton