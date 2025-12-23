/**
 * PROTECTED ROUTE - Security Guard Component
 * 
 * Protege rotas que requerem autenticação e/ou role específico.
 * Previne crashes por user=null e bypass de acesso admin.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Shield, Loader2 } from "lucide-react";

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireRole = null, // "admin" | "user" | null
  redirectTo = null,
  fallback = null
}) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        
        if (!currentUser) {
          // Não autenticado - redirecionar para login
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }

        setUser(currentUser);

        // Verificar role se necessário
        if (requireAdmin && currentUser.role !== "admin") {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        if (requireRole && currentUser.role !== requireRole) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        // Autorizado!
        setAuthorized(true);
        setLoading(false);

      } catch (error) {
        console.error("Erro de autenticação:", error);
        // Erro ao verificar auth - redirecionar para login
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };

    checkAuth();
  }, [requireAdmin, requireRole]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Não autorizado (role insuficiente)
  if (!authorized) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">
            {requireAdmin 
              ? "Esta página é exclusiva para administradores."
              : "Você não tem permissão para acessar esta página."
            }
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all"
            >
              Voltar
            </button>
            <button
              onClick={() => navigate(createPageUrl(redirectTo || "Feed"))}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
            >
              Ir para Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Autorizado - renderizar children com user no contexto
  return (
    <>
      {typeof children === 'function' ? children({ user }) : children}
    </>
  );
}

/**
 * Hook para usar em componentes que precisam do user
 */
export function useProtectedUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { user, loading, error, isAdmin: user?.role === "admin" };
}