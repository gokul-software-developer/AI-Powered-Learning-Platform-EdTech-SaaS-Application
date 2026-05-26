import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Loader, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateEventTypes } from '@/types/events-types'
import { createEventsSchema } from '@/schemas/events-schemas'
import { AppErrClient } from '@/utils/app-err'
import { Form } from '../ui/form'

const CreateEventDialog = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const form = useForm<CreateEventTypes>({
        resolver : zodResolver(createEventsSchema),
        defaultValues : {

        }
    });

    const onSubmit = async (values: CreateEventTypes) => {
  try {
    setLoading(true);

    const response = await fetch('/google/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create event');
    }

    // Optionally, parse response data
    // const createdEvent = await response.json();

    setOpen(false);
  } catch (error) {
    AppErrClient(error);
  } finally {
    setLoading(false);
  }
};


  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant={"outline"} size={"sm"}>
                <Plus className='mr-1 h-4 w-4' />
                Event
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Create Event
                </DialogTitle>
                <DialogDescription>
                    Manage your events from Study App conected smoothly with your google calendar
                </DialogDescription>
            </DialogHeader>
            <section className='my-4'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant={"outline"} size={"sm"}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button disabled={loading} variant={"default"} size={"sm"}>
                                {loading ? <>
                                    <Loader className='animate-spin mr-1 h-4 w-4' />
                                    Loading..
                                </> : <>
                                <Plus className='mr-1 h-4 w-4' />
                                Event
                                </>}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </section>
        </DialogContent>
    </Dialog>
  )
}

export default CreateEventDialog