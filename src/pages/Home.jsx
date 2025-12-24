/**
 * HOME - Rota raiz do app
 * Redireciona para HomePage (landing) ou Feed (logados)
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2 } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await base44.auth.isAuthenticated();
        
        if (isAuthenticated) {
          // Logado → Feed
          navigate(createPageUrl("Feed"), { replace: true });
        } else {
          // Não logado → Landing page
          navigate(createPageUrl("HomePage"), { replace: true });
        }
      } catch (error) {
        // Erro → Landing page
        navigate(createPageUrl("HomePage"), { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  // Loading durante verificação
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
    </div>
  );
}