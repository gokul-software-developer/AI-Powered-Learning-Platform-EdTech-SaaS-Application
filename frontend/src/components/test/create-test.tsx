import { CreateTestSchema } from "@/schemas/test-schemas";
import { CreateTestTypes } from "@/types/test-types";
import { AppErrClient } from "@/utils/app-err";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react"
import { useForm } from "react-hook-form";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Edit2, Loader2 } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const CreateTest = () => {
    const [open, setOpen] = useState<boolean>(false);
    const form = useForm<CreateTestTypes>({
        resolver : zodResolver(CreateTestSchema),
        defaultValues : {
            title : "",
            description : "",
            uid : ""
        }
    });

    const onSubmit = async (values : CreateTestTypes) => {
        try {
            console.log(values);
        } catch (error) {
            AppErrClient(error);
        } finally {
            setOpen(false);
        }
    }

    return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant={"default"} size={"sm"}>
                <Edit2 className="mr-1 h-4 w-4" />
                Tests
            </Button>
        </DialogTrigger>

        <DialogContent>
            <DialogHeader>
                <DialogTitle>Generate Quizzes</DialogTitle>
                <DialogDescription>
                    create your own test sessions and prepare yourself for mastering the subject.
                </DialogDescription>
            </DialogHeader>

            <section>
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField control={form.control} name="title" render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    Name
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="test preparation 1" {...field} />
                                </FormControl>
                                <FormMessage />
                                <FormDescription>
                                    Give a name for your test, make it unique to remember.
                                </FormDescription>
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="description" render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    Name
                                </FormLabel>
                                <FormControl>
                                    <Textarea placeholder="type somthing here.." {...field} />
                                </FormControl>
                                <FormMessage />
                                <FormDescription>
                                    *Optional
                                </FormDescription>
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="uid" render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    Choose Teacher
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a teacher to create tests" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="Science Bot - GRE">Science Bot - GRE</SelectItem>
                                    <SelectItem value="Gate Prep Teacher">Gate Prep Teacher</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )} />

                        <DialogFooter className="">
                            <DialogClose asChild>
                                <Button variant={"outline"} size={"sm"}>
                                    Close
                                </Button>
                            </DialogClose>

                            <Button variant={"default"} size={"sm"} disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? (<>
                                    <Loader2 className="mr-1 h-4 w-4" />
                                    Loading...
                                </>) : (<>
                                    Submit
                                </>)}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </section>
        </DialogContent>
    </Dialog>
  )
}

export default CreateTest