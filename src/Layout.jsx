import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BottomBar from "@/components/navigation/BottomBar";
import SplashScreen from "@/components/shared/SplashScreen";
import { AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);

    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
    return () => clearTimeout(timer);
  }, []);

  const paginasSemBottomBar = [
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
    <>
      <AnimatePresence>
        {loading && <SplashScreen />}
      </AnimatePresence>
      
      {!loading && (
        <div className="min-h-screen">
          <div className={mostrarBottomBar ? "pb-20" : ""}>
            {children}
          </div>
          {mostrarBottomBar && <BottomBar />}
        </div>
      )}
    </>
  );
}