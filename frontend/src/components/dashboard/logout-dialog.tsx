import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { Button } from '../ui/button'
import { Loader, LucideLogOut } from 'lucide-react'
import { useState } from 'react'
import { AppErrClient } from '@/utils/app-err'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'
//import { useAuth } from '@/hooks/use-auth'
import { useDispatch } from 'react-redux'
import { logout } from '@/features/auth-slice'
import { LogoutUser } from '@/api/auth';


const LogoutDialog = () => {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);

    const navigate = useNavigate();
  //  const {logoutMutation} = useAuth();
    const dispatch = useDispatch();

   const handleLogout = async () => {
  try {
    setLoading(true);
    await LogoutUser(); // 🔥 Calls backend
    dispatch(logout()); // 🔥 Clears Redux
    toast({
      title: "Logout Success",
      description: "You have been successfully logged out of your account",
      variant: "default",
    });
    navigate("/");
  } catch (error) {
    AppErrClient(error);
  } finally {
    setLoading(false);
    setOpen(false);
  }
};
  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant={"destructive"} size={"sm"}>
                        <LucideLogOut className='h-4 w-4' />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    Logout
                </TooltipContent>
            </Tooltip>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Logout Confirmation
                </DialogTitle>
                <DialogDescription>
                    Manage user profile, edit and secure your data
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant={"outline"} size={"sm"}>Cancel</Button>
                </DialogClose>
                <Button 
                    variant={"destructive"} 
                    size={"sm"}
                    onClick={handleLogout}
                    disabled={isLoading}
                >
                    {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin" />Logging out..</> : <>Logout</>}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default LogoutDialog;