import { toast } from "@/hooks/use-toast";

export function AppErrServer(err : any) {
    if (err instanceof Error) {
        throw new Error(err.message);
    }
    else  {
        throw new Error("Something went wrong");
    }
};

export function AppErrClient(err : any) {
    if (err instanceof Error) {
        toast({
            title : err.name,
            description : err.message,
            variant : "destructive"
        })
    }
    else {
        toast({
            title : "Failed",
            description : "Something went wrong",
            variant : "destructive"
        })
    }
};