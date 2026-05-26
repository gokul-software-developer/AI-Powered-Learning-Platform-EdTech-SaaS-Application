import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { GetCurrentSession } from "@/api/auth"; // your session API function
import { Loader } from "lucide-react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const session = await GetCurrentSession();
        setLoggedIn(session.loggedIn);
      } catch (err) {
        setLoggedIn(false);
      } finally {
        setIsChecking(false);
      }
    };

    check();
  }, []);

  if (isChecking) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader className="animate-spin w-6 h-6 text-gray-500" />
        <span className="ml-2 text-gray-500">Checking session...</span>
      </div>
    );
  }

  if (!loggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
