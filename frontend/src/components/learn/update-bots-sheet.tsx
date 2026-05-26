import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit3Icon, Loader, Trash2 } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { createBotTypes } from "@/types/bot-types";
import { AppErrClient } from "@/utils/app-err";
import { useBots } from "@/hooks/use-bots";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { createBotSchema, createBotServerSchema } from "@/schemas/bots-schemas";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Alert, AlertTitle } from "../ui/alert";
import { ScrollArea } from "../ui/scroll-area";

const UpdateBotsSheet = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [fileList, setFileList] = useState<File[]>([]); // State for uploaded files

    const {createBotMutation} = useBots();
    const authInfo = useSelector((state: RootState) => state.auth);
    console.log(authInfo.userData)

    const form = useForm<createBotTypes>({
        resolver: zodResolver(createBotSchema),
        defaultValues: {
            title: "",
            description: "",
            fileUrl: []
        }
    });

    const onSubmit = async (values: createBotTypes) => {
        try {
            setLoading(true);
            const payload = {
                ...values,
                fileUrl: fileList, // Attach the uploaded files
                userId: authInfo.userData.$id
            };

            const parsedPayload = await createBotServerSchema.parseAsync(payload);

            await createBotMutation.mutateAsync(parsedPayload);

            toast({
                title: "Success",
                description: `${values.title} has been created successfully`
            });
        } catch (error) {
            AppErrClient(error);
        } finally {
            setLoading(false);
            setOpen(false);
            form.reset();
            setFileList([]); // Reset file list on submission
        }
    };

    const handleFileAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            setFileList((prev) => [...prev, ...newFiles]);
        }
    };

    const handleFileRemove = (index: number) => {
        setFileList((prev) => prev.filter((_, i) => i !== index));
    };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
            <Button variant={"outline"} size={"sm"}>
                <Edit3Icon />
            </Button>
        </SheetTrigger>

        <SheetContent>
            <SheetHeader>
                <SheetTitle>Update Bot Info.</SheetTitle>
                <SheetDescription>
                    Update the details of your bot to better serve your users.
                </SheetDescription>
            </SheetHeader>
            <section className="my-4">
                <Form {...form}>
                    <form className="" onSubmit={form.handleSubmit(onSubmit)}>
                        <ScrollArea className="max-h-[60vh]">
                            <main className="flex flex-col gap-4 px-1">
                            <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Eg: Professor Science" type="text" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Name the bot according to your wish.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Small description" {...field} />
                                </FormControl>
                                <FormDescription>Optional</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormItem>
                            <FormLabel>Upload Study Materials</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    multiple
                                    onChange={handleFileAdd} // Add multiple files
                                />
                            </FormControl>
                            <FormDescription>Do not upload files more than 10MB.</FormDescription>
                        </FormItem>

                        {/* Display the uploaded files */}
                        
                        <div className="mt-4">
                            {fileList.map((file, index) => (
                                <Alert key={index} className="flex flex-row justify-between items-center">
                                    <AlertTitle>
                                        {file.name}
                                    </AlertTitle>
                                    <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleFileRemove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                </Alert>
                            ))}
                        </div>
                            </main>
                            </ScrollArea>
                        <SheetFooter className="flex flex-col gap-2">
                            <SheetClose asChild>
                                <Button size={"sm"} variant={"outline"} onClick={() => form.reset()}>
                                    Cancel
                                </Button>
                            </SheetClose>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                variant={"default"}
                                size={"sm"}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader className="animate-spin mr-1 w-4 h-4" />
                                        Loading...
                                    </>
                                ) : (
                                    <>Update Bot</>
                                )}
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </section>
        </SheetContent>
    </Sheet>
  )
}

export default UpdateBotsSheet