import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  Newspaper,
  Briefcase,
  PlusCircle,
  ShoppingBag,
  User,
  Search,
  Building2
} from "lucide-react";

export default function BottomBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const detectUserType = async () => {
      try {
        const user = await base44.auth.me();
        
        // Verificar se é profissional
        const professionals = await base44.entities.Professional.filter({ user_id: user.id });
        if (professionals.length > 0) {
          setUserType("PROFISSIONAL");
          return;
        }

        // Verificar se é clínica
        const owners = await base44.entities.CompanyOwner.filter({ user_id: user.id });
        if (owners.length > 0) {
          setUserType("CLINICA");
          return;
        }
      } catch (error) {
        console.error("Erro ao detectar tipo de usuário:", error);
      }
    };

    detectUserType();
  }, []);

  // Páginas onde não mostrar o BottomBar
  const paginasExcluidas = [
    "/CadastroProfissional",
    "/CadastroClinica",
    "/EscolherTipoCadastro",
    "/CadastroSucesso",
    "/AvaliarClinica",
    "/AvaliarProfissional"
  ];

  const currentPath = location.pathname;
  const shouldHide = paginasExcluidas.some(page => currentPath.includes(page));

  if (shouldHide || !userType) return null;

  const isActive = (pageName) => {
    return currentPath.includes(pageName);
  };

  const handleNavigate = (pageName) => {
    navigate(createPageUrl(pageName));
  };

  // Configuração de botões para PROFISSIONAL
  const botoesProfissional = [
    {
      icon: Newspaper,
      label: "Feed",
      page: "Feed",
      isCenter: false
    },
    {
      icon: Briefcase,
      label: "Vagas",
      page: "NewJobs",
      isCenter: false
    },
    {
      icon: PlusCircle,
      label: "Criar",
      page: "MarketplaceCreate",
      isCenter: true
    },
    {
      icon: ShoppingBag,
      label: "Market",
      page: "Marketplace",
      isCenter: false
    },
    {
      icon: User,
      label: "Perfil",
      page: "MeuPerfil",
      isCenter: false
    }
  ];

  // Configuração de botões para CLINICA
  const botoesClinica = [
    {
      icon: Newspaper,
      label: "Feed",
      page: "Feed",
      isCenter: false
    },
    {
      icon: Search,
      label: "Buscar",
      page: "BuscarProfissionais",
      isCenter: false
    },
    {
      icon: PlusCircle,
      label: "Criar",
      page: "CriarVaga",
      isCenter: true
    },
    {
      icon: Briefcase,
      label: "Vagas",
      page: "MinhasVagas",
      isCenter: false
    },
    {
      icon: Building2,
      label: "Perfil",
      page: "PerfilClinica",
      isCenter: false
    }
  ];

  const botoes = userType === "PROFISSIONAL" ? botoesProfissional : botoesClinica;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl pb-safe">
      <div className="h-16 flex items-center justify-around max-w-screen-xl mx-auto px-2">
        {botoes.map((botao, index) => {
          const Icon = botao.icon;
          const active = isActive(botao.page);

          // Botão Central (maior e com gradiente)
          if (botao.isCenter) {
            return (
              <button
                key={index}
                onClick={() => handleNavigate(botao.page)}
                className="flex flex-col items-center justify-center -mt-4 transition-all hover:scale-110"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs text-gray-500 font-medium mt-1">{botao.label}</span>
              </button>
            );
          }

          // Botões Normais
          return (
            <button
              key={index}
              onClick={() => handleNavigate(botao.page)}
              className="flex flex-col items-center justify-center flex-1 h-full relative transition-all hover:scale-105"
            >
              {/* Indicador de ativo */}
              {active && (
                <div className="absolute top-0 w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              )}

              <Icon className={`w-6 h-6 mb-1 ${active ? "text-orange-500" : "text-gray-400"}`} />
              <span className={`text-xs ${active ? "text-orange-500 font-bold" : "text-gray-400"}`}>
                {botao.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}