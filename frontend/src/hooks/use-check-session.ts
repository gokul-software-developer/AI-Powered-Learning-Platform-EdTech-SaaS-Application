import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GetCurrentSession } from "@/api/auth"; // Assuming this hits /check-session

export const useCheckSession = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await GetCurrentSession();
        if (session.loggedIn) {
          navigate("/overview");
        }
      } catch (err) {
        // Not logged in – do nothing
      }
    };

    checkSession();
  }, [navigate]);
};
