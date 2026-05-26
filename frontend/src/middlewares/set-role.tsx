import { login } from '@/features/auth-slice';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from 'lucide-react';

const SetRole = () => {
    const {fetchUser : session} = useAuth();
    const dispatch = useDispatch();

    console.log(session);

    useEffect(() => {
        dispatch(login(session.data));
    }, [
        session.data?.$id
    ]);

    if (session.isPending) {
        return (
            <main className='flex justify-center items-center w-full min-h-screen'>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Loading
                        </CardTitle>
                        <CardDescription>
                            Preparing your dashboard, it may take few seconds
                        </CardDescription>
                        <CardContent className='h-[10vh] flex flex-row gap-3 justify-center items-center'>
                            <Loader className='animate-spin mr-2 h-4 w-4' />
                            Loading 
                        </CardContent>
                    </CardHeader>
                </Card>
            </main>
        )
    }

    return (
        <div>
            {session.data?.$id ? <Navigate to={"/overview"} />  : <Navigate to={"/sign-in"} />}
        </div>
    )
}

export default SetRole