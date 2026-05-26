import { Loader2, Plus } from "lucide-react"
import { Button } from "../ui/button"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetTitle, SheetTrigger } from "../ui/sheet"
import { useForm } from "react-hook-form"
import { CreatestudyPlanTypes } from "@/types/study-types"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreatestudyPlanSchema } from "@/schemas/study-schemas"
import { useState } from "react"
import { AppErrClient } from "@/utils/app-err"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"

const CreateSchedule = () => {
    const [open, setOpen] = useState<boolean>(false);
    const form = useForm<CreatestudyPlanTypes>({
        resolver : zodResolver(CreatestudyPlanSchema),
        defaultValues : {
            title : "",
            subject : "",
            age : 0,
            availablehoursinWeekend : "",
            breaks : "FIFTY_TWO_SEVENTEEN",
            description: "",
            education : "CompetitiveExam",
            exam : "",
            examdate : "",
            method : "FlashCards",
            prior : "Advanced",
            revision : "BeforeExam",
            studyHours : 0,
            studytime : "Afternoon",
            timelimit : "Days"
        }
    });
    const onSubmit = async (values : CreatestudyPlanTypes) => {
        try {   
            console.log(values);
        } catch (error) {
            AppErrClient(error);
        }
    }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
            <Button variant={"default"} size={"sm"}>
                <Plus className="mr-1 h-4 w-4" />
                Schedules
            </Button>
        </SheetTrigger>
        <SheetContent>
            <SheetTitle>
                Create Schedule
            </SheetTitle>
            <SheetDescription>
                Create and manage study plans for the specified subjects and make it your own progress tracker..
            </SheetDescription>

            <section className="my-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField control={form.control} name="title" render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    Title
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="GRE Prep - 6 Months mode" {...field} />
                                </FormControl>
                                <FormDescription>
                                    assign proper name for the schedule
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <SheetFooter className="mt-4">
                            <SheetClose asChild>
                                <Button variant={"outline"} size={"sm"}>Close</Button>
                            </SheetClose>
                            <Button disabled={form.formState.isSubmitting} variant={"default"} size={"sm"}>
                                {form.formState.isSubmitting ? <>
                                <Loader2 className="mr-1 w-4 h-4 animate-spin"/> Creating..</> : <>Create Schedule</>}
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </section>
        </SheetContent>
    </Sheet>
  )
}

export default CreateSchedule