import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BottomBar from "@/components/navigation/BottomBar";
import SplashScreen from "@/components/shared/SplashScreen";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import OfflineBanner from "@/components/shared/OfflineBanner";
import { AnimatePresence } from "framer-motion";
import { trackPageView } from "@/components/utils/analytics";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadUser = async () => {
      // Timeout de segurança - máximo 1.5 segundos
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }, 1500);

      try {
        const currentUser = await base44.auth.me();
        clearTimeout(timeoutId);
        if (isMounted) {
          setUser(currentUser);
          setLoading(false);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };
    
    loadUser();
    trackPageView(currentPageName);

    return () => {
      isMounted = false;
    };
  }, [currentPageName]);

  const paginasSemBottomBar = [
    "OnboardingVertical",
    "OnboardingTipoConta",
    "EscolherTipoCadastro",
    "CadastroProfissional",
    "CadastroClinica",
    "CadastroSucesso",
    "AdminAprovacoes",
    "AvaliarClinica",
    "AvaliarProfissional",
    "Onboarding",
    "TermosUso",
    "PoliticaPrivacidade"
  ];

  const mostrarBottomBar = user && !paginasSemBottomBar.includes(currentPageName);

  return (
    <ErrorBoundary>
      <style>{`
        body, html, #root {
          overflow-x: hidden !important;
        }
        body::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <AnimatePresence>
        {loading && <SplashScreen />}
      </AnimatePresence>
      
      {!loading && (
        <div className="min-h-screen">
          <OfflineBanner />
          <div className={mostrarBottomBar ? "pb-20" : ""}>
            {children}
          </div>
          {mostrarBottomBar && <BottomBar />}
        </div>
      )}
    </ErrorBoundary>
  );
}