import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { AppErrClient } from "@/utils/app-err";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email({
    message: "Enter a valid email address",
  }),
});

type subscribeProps = z.infer<typeof subscribeSchema>;

const Cta = () => {
  const form = useForm<subscribeProps>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: subscribeProps) {
    try {
      console.log(values);
      toast({
        title: "Success",
        description:
          "We've sent you an email to confirm your subscription. Please check your inbox.",
      });
    } catch (error) {
      AppErrClient(error);
    } finally {
      form.reset();
    }
  }

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(/pattern2.jpg)` }}
    >
      <main className="max-w-4xl w-full mx-4 space-y-4 text-center bg-black/70 backdrop-blur-sm p-12 rounded-xl border border-white/10 shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          <span className="text-primary">CONNECT</span> WITH US
        </h1>
        
        <p className="text-base text-white/80 max-w-2xl mx-auto leading-normal">
          Get personalized study plans, track your progress, and achieve academic success with our AI-powered study assistant.
          Connect with Google Calendar and Notion for seamless integration.
        </p>

        <Form {...form}>
          <form 
            className="flex flex-col sm:flex-row gap-3 mt-6 max-w-2xl mx-auto" 
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField 
              control={form.control} 
              name="email" 
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Enter your Email"
                      className="h-10 px-4 text-sm placeholder:text-white/50 bg-white/10 border-white/20 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-left text-xs" />
                </FormItem>
              )} 
            />
            <Button 
              variant={"default"} 
              size={"default"} 
              type="submit"
              className="h-10 px-6 text-sm bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90"
            >
              🚀 Try It for Free!
            </Button>
          </form>
        </Form>

        <p className="text-xs text-white/60 mt-4">
          Join thousands of students who are already achieving more with less stress.
        </p>
      </main>
    </div>
  );
};

export default Cta;