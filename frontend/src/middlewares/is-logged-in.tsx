import { useAuth } from "@/hooks/use-auth";
import { Navigate, Outlet } from "react-router-dom";

const IsLoggedIn = () => {
    const {fetchUser : session} = useAuth();
    return (
        <div>
            {session.data?.$id ? <Outlet /> : <Navigate to={"/sign-in"} />}
        </div>
    )
}

export default IsLoggedIn;