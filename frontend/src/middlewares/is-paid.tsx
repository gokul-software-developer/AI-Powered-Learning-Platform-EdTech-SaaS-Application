import { Navigate, Outlet } from "react-router-dom";

const IsPaid = () => {
    const payInfo = {};
    return (
        <div>
            {payInfo ? <Outlet /> :<Navigate to={"/"} />}
        </div>      
    )
}

export default IsPaid