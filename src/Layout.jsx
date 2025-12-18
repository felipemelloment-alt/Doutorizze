import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BottomBar from "@/components/navigation/BottomBar";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const paginasSemBottomBar = [
    "EscolherTipoCadastro",
    "CadastroProfissional",
    "CadastroClinica",
    "CadastroSucesso",
    "AdminAprovacoes",
    "AvaliarClinica",
    "AvaliarProfissional"
  ];

  const mostrarBottomBar = user && !paginasSemBottomBar.includes(currentPageName);

  return (
    <div className="min-h-screen">
      <div className={mostrarBottomBar ? "pb-20" : ""}>
        {children}
      </div>
      {mostrarBottomBar && <BottomBar />}
    </div>
  );
}