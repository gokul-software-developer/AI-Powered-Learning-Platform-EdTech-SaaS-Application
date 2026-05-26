import { updateVerification } from "@/api/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { VerifyUserSchema } from "@/schemas/auth-schemas";
import { AppErrClient } from "@/utils/app-err";
import { Check, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ActivateEmail = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const secret = urlParams.get('secret');
    const userId = urlParams.get('userId');

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const verifyUser = async () => {
        try {
            if (!secret || !userId) {
                throw new Error("Info not gathered properly");
            }
            
            const payload = {
                userId, secret
            };
            const values = await VerifyUserSchema.parseAsync(payload); 
            const response = await updateVerification(values);

            if (response?.$id) {
                toast({
                    title: "Success",
                    description : "User has been verified"
                })
            }

            setLoading(false);

            setTimeout(() => {
                navigate("/set-state");
            }, 1000);
        } catch (error) {
            AppErrClient(error);
        }
    };

    useEffect(() => {
        verifyUser();
    }, [])
  return (
    <div className="min-h-[90vh] flex justify-center items-center w-full">
        <Card>
            <CardHeader>
                <CardTitle>
                    Email Verification
                </CardTitle>
                <CardDescription>
                    Verifying user credentials, it may take few seconds kindly wait 😃 
                </CardDescription>

                <CardContent className="flex h-[10vh] flex-row gap-4 justify-center items-center">
                    {loading ? <>
                        <Loader className="animate-spin h-4 w-4" />
                        <p className="text-lg font-medium tracking-tight text-muted-foreground">
                            Verifying
                        </p>
                    </> : <>
                        <Check className="animate-in h-4 w-4 text-green-500" />
                        <p className="text-lg font-medium tracking-tight text-green-500">
                            Email has been Verified...
                        </p>
                    </>}
                </CardContent>
            </CardHeader>
        </Card>
    </div>
  )
}

export default ActivateEmail