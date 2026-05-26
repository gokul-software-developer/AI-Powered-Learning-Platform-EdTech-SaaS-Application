import { Button } from '../ui/button'
import { Separator } from "@/components/ui/separator"
import GoogleIcon from './google-icon'
import { AppErrClient } from '@/utils/app-err'
import { useState } from 'react'
import { Loader } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const OauthWrapper = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const {loginwithOauthMutation} = useAuth();
    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            await loginwithOauthMutation.mutateAsync();
        } catch (error) {
            AppErrClient(error);
        } finally {
            setLoading(false);
        }
    }
  return (
    <>
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                </span>
            </div>
        </div>

        <div className="mt-6">
            <Button variant="outline" className="w-full" type="button" disabled={loading} onClick={handleGoogleSignIn}>
                {loading ? <>
                    <Loader className='animate-spin h-4 w-4 mr-2' />
                    Loading..
                </> : <>
                    <GoogleIcon />
                    Continue with Google
                </>}
            </Button>
        </div>
    </> 
  )
}

export default OauthWrapper