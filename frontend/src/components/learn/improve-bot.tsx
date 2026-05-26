import { useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button";
import { BookPlus } from "lucide-react";

const ImproveBot = () => {
  const [open, setOpen] = useState<boolean>(false);
    return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant={"default"} size={"sm"}>
                <BookPlus />
            </Button>
        </DialogTrigger>

        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Improve Your Bot
                </DialogTitle>
                <DialogDescription>
                    Add in more study materials, urls to improve the test experience and learning...
                </DialogDescription>
            </DialogHeader>

            <section className='my-4'>
                {/* Form to improve bot */}
            </section>

            <DialogFooter>
                <DialogClose asChild>
                    <Button variant={"outline"} size={"sm"}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button variant={"default"} size={"sm"} onClick={() => setOpen(false)}>
                        Save
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default ImproveBot