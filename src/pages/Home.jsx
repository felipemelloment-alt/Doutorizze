import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2 } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // Preferível a isAuthenticated: garante sessão válida
        const user = await base44.auth.me();

        if (!mounted) return;

        if (user) {
          navigate(createPageUrl("Feed"), { replace: true });
        } else {
          navigate(createPageUrl("HomePage"), { replace: true });
        }
      } catch (e) {
        if (!mounted) return;
        navigate(createPageUrl("HomePage"), { replace: true });
      }
    };

    checkAuth();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  );
}