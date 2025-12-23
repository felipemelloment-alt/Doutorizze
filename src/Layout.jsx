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
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        setUser(null);
        const timer = setTimeout(() => setLoading(false), 3000);
        return () => clearTimeout(timer);
      }
    };
    
    loadUser();
    trackPageView(currentPageName);
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