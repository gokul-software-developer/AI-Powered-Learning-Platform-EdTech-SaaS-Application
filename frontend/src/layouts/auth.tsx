import Navbar from "@/components/navbar/navbar";
import { Outlet } from "react-router-dom";

const Auth = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex justify-center items-center">
        <Outlet />
      </div>
    </div>
  );
};

export default Auth;
