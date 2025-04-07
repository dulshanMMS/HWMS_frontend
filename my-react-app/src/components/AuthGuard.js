import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAuthGuard = (role) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login"); // Redirect to login if not authenticated
    } else if (role && user.role !== role) {
      navigate("/"); // Redirect to home if role mismatch
    }
  }, [user, navigate, role]);
};

export default useAuthGuard;