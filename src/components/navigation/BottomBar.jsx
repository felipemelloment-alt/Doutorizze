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
  Building2,
  Tag,
  BarChart3,
  Hospital,
  Users,
  BookOpen,
  GraduationCap,
  House,
  Settings,
  Edit,
  MessageCircle,
  Filter,
  Plus,
  Eye
} from "lucide-react";

export default function BottomBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const detectUserType = async () => {
      try {
        const user = await base44.auth.me();
        
        // Verificar se é freelancer
        const freelancers = await base44.entities.Freelancer.filter({ user_id: user.id });
        if (freelancers.length > 0) {
          setUserType("FREELANCER");
          return;
        }

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

        // Verificar se é fornecedor
        const suppliers = await base44.entities.Supplier.filter({ user_id: user.id });
        if (suppliers.length > 0) {
          setUserType("FORNECEDOR");
          return;
        }

        // Verificar se é hospital
        const hospitals = await base44.entities.Hospital.filter({ user_id: user.id });
        if (hospitals.length > 0) {
          setUserType("HOSPITAL");
          return;
        }

        // Verificar se é instituição
        const institutions = await base44.entities.EducationInstitution.filter({ user_id: user.id });
        if (institutions.length > 0) {
          setUserType("INSTITUICAO");
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
    "/CadastroFornecedor",
    "/CadastroHospital",
    "/CadastroInstituicao",
    "/CadastroFreelancer",
    "/EscolherTipoCadastro",
    "/CadastroSucesso",
    "/AvaliarClinica",
    "/AvaliarProfissional",
    "/Onboarding"
  ];

  const currentPath = location.pathname;
  const shouldHide = paginasExcluidas.some(page => currentPath.includes(page));

  if (shouldHide || !userType) return null;

  const isActive = (pageName) => {
    return currentPath.toLowerCase().includes(pageName.toLowerCase());
  };

  const handleNavigate = (pageName) => {
    navigate(createPageUrl(pageName));
  };

  // Função para determinar config do botão central baseado na página atual
  const getBotaoCentralConfig = (pathname, userType) => {
    const path = pathname.toLowerCase();
    
    // ============================================
    // FEED e CONFIGURAÇÕES
    // ============================================
    if (path.includes("feed") || path.includes("configuracoes") || path.includes("configura")) {
      return { 
        icon: Settings, 
        label: "Config", 
        page: "Configuracoes",
        iconColor: "text-purple-500",
        activeColor: "text-purple-500",
        bgColor: "bg-purple-500"
      };
    }
    
    // ============================================
    // VAGAS (NewJobs + páginas relacionadas)
    // ============================================
    if (path.includes("newjobs") || path.includes("criarvaga") || path.includes("editarvaga")) {
      if (userType === "CLINICA" || userType === "HOSPITAL") {
        return { 
          icon: Plus, 
          label: "Vaga", 
          page: "CriarVaga",
          iconColor: "text-green-500",
          activeColor: "text-green-500",
          bgColor: "bg-green-500"
        };
      }
      return { 
        icon: Briefcase, 
        label: "Aplicar", 
        page: "MinhasCandidaturas",
        iconColor: "text-blue-500",
        activeColor: "text-blue-500",
        bgColor: "bg-blue-500"
      };
    }
    
    // MinhasCandidaturas (profissional)
    if (path.includes("minhascandidaturas")) {
      return { 
        icon: Briefcase, 
        label: "Aplicar", 
        page: "MinhasCandidaturas",
        iconColor: "text-blue-500",
        activeColor: "text-blue-500",
        bgColor: "bg-blue-500"
      };
    }
    
    // MinhasVagas (clínica)
    if (path.includes("minhasvagas")) {
      return { 
        icon: Plus, 
        label: "Vaga", 
        page: "CriarVaga",
        iconColor: "text-green-500",
        activeColor: "text-green-500",
        bgColor: "bg-green-500"
      };
    }
    
    // ============================================
    // MARKETPLACE
    // ============================================
    if (path.includes("marketplace") && !path.includes("create") && !path.includes("detail") && !path.includes("meusanuncios")) {
      return { 
        icon: MessageCircle, 
        label: "Meus", 
        page: "MeusAnunciosMarketplace",
        iconColor: "text-orange-500",
        activeColor: "text-orange-500",
        bgColor: "bg-orange-500"
      };
    }
    
    // MeusAnunciosMarketplace OU MarketplaceCreate
    if (path.includes("meusanunciosmarketplace") || path.includes("marketplacecreate") || (path.includes("marketplace") && path.includes("create"))) {
      return { 
        icon: Plus, 
        label: "Anunciar", 
        page: "MarketplaceCreate",
        iconColor: "text-yellow-500",
        activeColor: "text-yellow-500",
        bgColor: "bg-yellow-500"
      };
    }
    
    // ============================================
    // PERFIL
    // ============================================
    // MeuPerfil OU EditarPerfil (profissional)
    if (path.includes("meuperfil") || path.includes("editarperfil")) {
      return { 
        icon: Edit, 
        label: "Editar", 
        page: "EditarPerfil",
        iconColor: "text-pink-500",
        activeColor: "text-pink-500",
        bgColor: "bg-pink-500"
      };
    }
    
    // PerfilClinica OU EditarClinica (clínica)
    if (path.includes("perfilclinica") || path.includes("editarclinica")) {
      return { 
        icon: Edit, 
        label: "Editar", 
        page: "EditarClinica",
        iconColor: "text-pink-500",
        activeColor: "text-pink-500",
        bgColor: "bg-pink-500"
      };
    }
    
    // ============================================
    // BUSCAR PROFISSIONAIS
    // ============================================
    if (path.includes("buscarprofissionais")) {
      return { 
        icon: Filter, 
        label: "Filtros", 
        page: null,
        action: "openFilters",
        iconColor: "text-cyan-500",
        activeColor: "text-cyan-500",
        bgColor: "bg-cyan-500"
      };
    }
    
    // ============================================
    // FORNECEDOR
    // ============================================
    if (path.includes("minhaspromocoes") || path.includes("criarpromocao") || path.includes("dashboardfornecedor") || path.includes("perfilfornecedor")) {
      return { 
        icon: Plus, 
        label: "Promo", 
        page: "CriarPromocao",
        iconColor: "text-red-500",
        activeColor: "text-red-500",
        bgColor: "bg-red-500"
      };
    }
    
    // ============================================
    // INSTITUIÇÃO
    // ============================================
    if (path.includes("meuscursos") || path.includes("criarcurso") || path.includes("dashboardinstituicao") || path.includes("perfilinstituicao")) {
      return { 
        icon: Plus, 
        label: "Curso", 
        page: "CriarCurso",
        iconColor: "text-indigo-500",
        activeColor: "text-indigo-500",
        bgColor: "bg-indigo-500"
      };
    }
    
    // ============================================
    // HOSPITAL
    // ============================================
    if (path.includes("dashboardhospital") || path.includes("candidatoshospital")) {
      return { 
        icon: Plus, 
        label: "Vaga", 
        page: "CriarVaga",
        iconColor: "text-green-500",
        activeColor: "text-green-500",
        bgColor: "bg-green-500"
      };
    }
    
    // ============================================
    // DEFAULT
    // ============================================
    return { 
      icon: PlusCircle, 
      label: "Criar", 
      page: "MarketplaceCreate",
      iconColor: "text-orange-500",
      activeColor: "text-orange-500",
      bgColor: "bg-orange-500"
    };
  };

  // Configuração de botões para PROFISSIONAL
  const botoesProfissional = [
    { icon: Newspaper, label: "Feed", page: "Feed", isCenter: false },
    { icon: Briefcase, label: "Vagas", page: "NewJobs", isCenter: false },
    { icon: null, label: null, page: null, isCenter: true },
    { icon: MessageCircle, label: "Chats", page: "Chats", isCenter: false },
    { icon: User, label: "Perfil", page: "MeuPerfil", isCenter: false }
  ];

  // Configuração de botões para CLINICA
  const botoesClinica = [
    { icon: Newspaper, label: "Feed", page: "Feed", isCenter: false },
    { icon: Search, label: "Buscar", page: "BuscarProfissionais", isCenter: false },
    { icon: null, label: null, page: null, isCenter: true },
    { icon: MessageCircle, label: "Chats", page: "Chats", isCenter: false },
    { icon: Building2, label: "Perfil", page: "PerfilClinica", isCenter: false }
  ];

  // Configuração de botões para FORNECEDOR
  const botoesFornecedor = [
    { icon: House, label: "Home", page: "Feed", isCenter: false },
    { icon: Tag, label: "Promoções", page: "MinhasPromocoes", isCenter: false },
    { icon: null, label: null, page: null, isCenter: true },
    { icon: MessageCircle, label: "Chats", page: "Chats", isCenter: false },
    { icon: Building2, label: "Perfil", page: "PerfilFornecedor", isCenter: false }
  ];

  // Configuração de botões para HOSPITAL
  const botoesHospital = [
    { icon: House, label: "Home", page: "Feed", isCenter: false },
    { icon: Users, label: "Candidatos", page: "CandidatosHospital", isCenter: false },
    { icon: null, label: null, page: null, isCenter: true },
    { icon: Briefcase, label: "Vagas", page: "MinhasVagas", isCenter: false },
    { icon: Hospital, label: "Perfil", page: "DashboardHospital", isCenter: false }
  ];

  // Configuração de botões para INSTITUIÇÃO
  const botoesInstituicao = [
    { icon: House, label: "Home", page: "Feed", isCenter: false },
    { icon: BookOpen, label: "Cursos", page: "MeusCursos", isCenter: false },
    { icon: null, label: null, page: null, isCenter: true },
    { icon: BarChart3, label: "Métricas", page: "DashboardInstituicao", isCenter: false },
    { icon: GraduationCap, label: "Perfil", page: "PerfilInstituicao", isCenter: false }
  ];

  // Configuração de botões para FREELANCER
  const botoesFreelancer = [
    { icon: Briefcase, label: "Vagas", page: "NewJobs", isCenter: false },
    { icon: Eye, label: "Portfólio", page: "Portfolio", isCenter: false },
    { icon: null, label: null, page: null, isCenter: true },
    { icon: MessageCircle, label: "Propostas", page: "MinhasCandidaturas", isCenter: false },
    { icon: User, label: "Perfil", page: "DashboardFreelancer", isCenter: false }
  ];

  const botoesMap = {
    FREELANCER: botoesFreelancer,
    PROFISSIONAL: botoesProfissional,
    CLINICA: botoesClinica,
    FORNECEDOR: botoesFornecedor,
    HOSPITAL: botoesHospital,
    INSTITUICAO: botoesInstituicao
  };

  const botoes = botoesMap[userType] || [];

  const pathname = location.pathname;
  const botaoCentralConfig = getBotaoCentralConfig(pathname, userType);
  const CentralIcon = botaoCentralConfig.icon;
  const centralActive = botaoCentralConfig.page ? isActive(botaoCentralConfig.page) : false;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl pb-safe">
      <div className="h-16 flex items-center justify-around max-w-screen-xl mx-auto px-2">
        {botoes.map((botao, index) => {

          // ========== BOTÃO CENTRAL DINÂMICO ==========
          if (botao.isCenter) {
            return (
              <button
                key={index}
                onClick={() => {
                  if (botaoCentralConfig.action === "openFilters") {
                    window.dispatchEvent(new CustomEvent('openFilters'));
                  } else if (botaoCentralConfig.page) {
                    handleNavigate(botaoCentralConfig.page);
                  }
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all hover:scale-105 ${
                  centralActive ? "-mt-4" : ""
                }`}
              >
                {/* Fundo circular APENAS quando ATIVO */}
                {centralActive && (
                  <div className={`w-14 h-14 rounded-full ${botaoCentralConfig.bgColor} shadow-xl flex items-center justify-center`}>
                    <CentralIcon className="w-7 h-7 text-white" />
                  </div>
                )}

                {/* Ícone quando NÃO ativo - com cor de destaque */}
                {!centralActive && (
                  <CentralIcon className={`w-6 h-6 mb-1 ${botaoCentralConfig.iconColor}`} />
                )}

                {/* Texto */}
                <span className={`text-xs ${
                  centralActive 
                    ? `${botaoCentralConfig.activeColor} font-bold mt-1` 
                    : "text-gray-400"
                }`}>
                  {botaoCentralConfig.label}
                </span>
              </button>
            );
          }

          // ========== BOTÕES NORMAIS (laterais) ==========
          const Icon = botao.icon;
          const active = isActive(botao.page);

          return (
            <button
              key={index}
              onClick={() => handleNavigate(botao.page)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all hover:scale-105 ${
                active ? "-mt-4" : ""
              }`}
            >
              {/* Fundo circular + ícone quando ATIVO */}
              {active && (
                <div className="w-14 h-14 rounded-full bg-purple-500 shadow-xl flex items-center justify-center">
                  <Icon className="w-7 h-7 text-white" />
                </div>
              )}

              {/* Ícone quando NÃO ativo - cinza */}
              {!active && (
                <Icon className="w-6 h-6 mb-1 text-gray-400" />
              )}

              {/* Texto */}
              <span className={`text-xs ${
                active ? "text-purple-500 font-bold mt-1" : "text-gray-400"
              }`}>
                {botao.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}