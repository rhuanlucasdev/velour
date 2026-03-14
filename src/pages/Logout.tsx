import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RedirectLoading from "./RedirectLoading";

export default function Logout() {
  const { logout, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        if (session) {
          await logout();
        }
      } finally {
        if (!isMounted) {
          return;
        }

        setTimeout(() => {
          if (isMounted) {
            navigate("/", { replace: true });
          }
        }, 500);
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [logout, navigate, session]);

  return (
    <RedirectLoading
      title="Signing you out..."
      subtitle="You will be redirected to the home page in a moment."
    />
  );
}
