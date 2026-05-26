import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Loader, Pen } from 'lucide-react'
import { Button } from '../ui/button'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateEventTypes } from '@/types/events-types'
import { createEventsSchema } from '@/schemas/events-schemas'
import { AppErrClient } from '@/utils/app-err'
import { Form } from '../ui/form'

interface UpdateEventDialogProps {
  eventId: string
  initialData: CreateEventTypes
  onUpdated?: (updatedEvent: any) => void
}

const UpdateEventDialog = ({ eventId, initialData, onUpdated }: UpdateEventDialogProps) => {
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const form = useForm<CreateEventTypes>({
    resolver: zodResolver(createEventsSchema),
    defaultValues: initialData,
  })

  // When initialData changes, reset the form values
  useEffect(() => {
    form.reset(initialData)
  }, [initialData])

  const onSubmit = async (values: CreateEventTypes) => {
    try {
      setLoading(true)
      const response = await fetch(`/google/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Failed to update event')
      }

      const updatedEvent = await response.json()
      if (onUpdated) onUpdated(updatedEvent)
      setOpen(false)
    } catch (error) {
      AppErrClient(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'outline'} size={'sm'}>
          <Pen className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Event</DialogTitle>
          <DialogDescription>
            Manage your events from Study App connected smoothly with your Google Calendar
          </DialogDescription>
        </DialogHeader>
        <section className='my-4'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Here you can add form fields for event properties, example: */}
              {/* <input {...form.register('summary')} placeholder='Event Summary' /> */}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant={'outline'} size={'sm'}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button disabled={loading} variant={'default'} size={'sm'} type="submit">
                  {loading ? (
                    <>
                      <Loader className='animate-spin mr-1 h-4 w-4' />
                      updating..
                    </>
                  ) : (
                    <>
                      <Pen className='mr-1 h-4 w-4' />
                      Update
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </section>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateEventDialog
