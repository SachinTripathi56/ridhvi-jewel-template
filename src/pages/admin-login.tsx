// Admin-login page kept for backward compat — redirects to /login (Clerk handles everything now)
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/login", { replace: true }); }, [navigate]);
  return null;
}
