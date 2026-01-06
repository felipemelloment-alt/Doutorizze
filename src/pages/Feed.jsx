import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Heart,
  Sparkles,
  Newspaper,
  GraduationCap,
  Tag,
  Building2,
  MapPin,
  Bell
} from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/components/utils/logger";
import StoriesUnificado from "@/components/substituicoes/StoriesUnificado";
import { formatarTextoData, formatarValor } from "@/components/constants/substituicao";
import FeedCard from "@/components/feed/FeedCard";
import VideoModal from "@/components/feed/VideoModal";
import ComunidadeTelegramCard from "@/components/feed/ComunidadeTelegramCard";

// Componente do Banner Stories com Auto-scroll INFINITO SEAMLESS
function StoriesBanner({ items, userType, onItemClick }) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicar itens apenas 2x para loop infinito
  const duplicatedItems = [...items, ...items];

  // Auto-scroll INFINITO SEAMLESS
  useEffect(() => {
    if (!scrollRef.current || isPaused || items.length === 0) return;

    const container = scrollRef.current;
    
    const animate = () => {
      if (!container || isPaused) return;
      
      // Incrementa scroll
      container.scrollLeft += 0.5;
      
      // Calcular largura de um conjunto de itens
      const singleSetWidth = container.scrollWidth / 2;
      
      // Quando passar do primeiro conjunto completo, volta instantaneamente para o início
      // Como os itens são idênticos, a transição é imperceptível
      if (container.scrollLeft >= singleSetWidth) {
        container.scrollLeft = 0;
      }
    };

    const interval = setInterval(animate, 20);

    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  // Pausar quando usuário interage
  const handleInteractionStart = () => setIsPaused(true);
  const handleInteractionEnd = () => {
    setTimeout(() => setIsPaused(false), 3000); // Retoma após 3s
  };

  if (items.length === 0) return null;

  const titulo = userType === "CLINICA" 
    ? "💼 DENTISTAS/MÉDICOS DISPONÍVEIS - VAGAS FIXAS"
    : "💼 CLÍNICAS CONTRATANDO - VAGAS FIXAS";

  return (
    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 py-3 mb-3 shadow-sm">
      {/* Título */}
      <div className="px-4 mb-2">
        <h2 className="text-center font-black text-xs text-white tracking-wide uppercase">
          {titulo}
        </h2>
      </div>

      {/* Carrossel SEM BARRA DE SCROLL */}
      <div
        ref={scrollRef}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        onMouseDown={handleInteractionStart}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
        className="flex gap-6 px-4 overflow-x-auto"
        style={{ 
          scrollBehavior: 'auto',
          msOverflowStyle: 'none',  /* IE e Edge */
          scrollbarWidth: 'none'    /* Firefox */
        }}
      >
        {/* CSS para esconder scrollbar no Chrome/Safari */}
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {duplicatedItems.map((item, index) => (
          <button
            key={`${item.id}-${index}`}
            onClick={() => onItemClick(item)}
            className="flex-shrink-0 flex flex-col items-center min-w-[90px] transition-transform active:scale-95 p-2 rounded-2xl hover:bg-white/10"
          >
            {/* Localização */}
            <div className="flex items-center gap-1 mb-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full">
              <MapPin className="w-3 h-3 text-red-500 fill-red-500" />
              <span className="text-[10px] text-gray-900 font-bold truncate max-w-[80px]">
                {item.cidade} - {item.uf}
              </span>
            </div>

            {/* Foto circular com borda gradiente */}
            <div className="relative mb-1">
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-[2px]">
                  {item.foto ? (
                    <img
                      src={item.foto}
                      alt={item.nome}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-500">
                        {item.nome?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nome */}
            <span className="text-[11px] font-black text-white truncate max-w-[90px] text-center leading-tight drop-shadow-lg">
              {item.nome}
            </span>

            {/* ESPECIALIDADE */}
            <span className="text-[10px] text-red-500 font-bold truncate max-w-[90px] uppercase drop-shadow-md">
              {item.especialidade}
            </span>

            {/* Badge VAGA FIXA */}
            <span className="mt-1 px-2 py-0.5 bg-green-600 text-white text-[9px] font-black rounded-full shadow-md">
              VAGA FIXA
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Tipos de post do feed
const tipoPostConfig = {
  NOVIDADE: { icon: Sparkles, color: "text-purple-500", bgColor: "bg-purple-50", label: "Novidade" },
  NOTICIA_SAUDE: { icon: Heart, color: "text-red-500", bgColor: "bg-red-50", label: "Saúde" },
  NOTICIA_IA: { icon: Sparkles, color: "text-blue-500", bgColor: "bg-blue-50", label: "IA & Tech" },
  PARCEIRO: { icon: Building2, color: "text-green-500", bgColor: "bg-green-50", label: "Parceiro" },
  PROMOCAO: { icon: Tag, color: "text-orange-500", bgColor: "bg-orange-50", label: "Promoção" },
  CURSO: { icon: GraduationCap, color: "text-indigo-500", bgColor: "bg-indigo-50", label: "Curso" },
  DESTAQUE_MARKETPLACE: { icon: Tag, color: "text-yellow-500", bgColor: "bg-yellow-50", label: "Marketplace" }
};

export default function Feed() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [userArea, setUserArea] = useState(null); // ODONTOLOGIA ou MEDICINA
  const [userLocation, setUserLocation] = useState({ cidade: null, uf: null });
  const [videoModal, setVideoModal] = useState({ open: false, post: null });

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Verificar tipo de usuário e localização
        const professionals = await base44.entities.Professional.filter({ user_id: currentUser.id });
        
        if (professionals.length > 0) {
          const prof = professionals[0];
          
          setUserType("PROFISSIONAL");
          setUserArea(prof.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA");
          setUserLocation({
            cidade: prof.cidades_atendimento?.[0]?.split(' - ')[0] || "Não informada",
            uf: prof.uf_conselho || "Não informado"
          });
          return;
        }

        const owners = await base44.entities.CompanyOwner.filter({ user_id: currentUser.id });
        
        if (owners.length > 0) {
          setUserType("CLINICA");
          const units = await base44.entities.CompanyUnit.filter({ owner_id: owners[0].id });
          
          if (units.length > 0) {
            const unit = units[0];
            
            setUserArea(unit.tipo_mundo === "ODONTOLOGIA" ? "ODONTOLOGIA" : unit.tipo_mundo === "MEDICINA" ? "MEDICINA" : "AMBOS");
            setUserLocation({
              cidade: unit.cidade,
              uf: unit.uf
            });
          }
          return;
        }

        const suppliers = await base44.entities.Supplier.filter({ user_id: currentUser.id });
        if (suppliers.length > 0) {
          setUserType("FORNECEDOR");
          return;
        }

        const hospitals = await base44.entities.Hospital.filter({ user_id: currentUser.id });
        if (hospitals.length > 0) {
          setUserType("HOSPITAL");
          const hosp = hospitals[0];
          
          setUserLocation({
            cidade: hosp.cidade,
            uf: hosp.uf
          });
          return;
        }

      } catch (error) {
        logger.error("Erro ao carregar dados do usuário:", error);
      }
    };
    loadUserData();
  }, []);

  // Buscar profissionais próximos (para clínicas verem)
  const { data: profissionaisProximos = [] } = useQuery({
    queryKey: ["profissionaisProximos", userLocation.uf],
    queryFn: async () => {
      if (userType !== "CLINICA" || !userLocation.uf) {
        return [];
      }
      
      const profissionais = await base44.entities.Professional.filter({
        status_cadastro: "APROVADO"
      });

      const filtered = profissionais
        .filter(p => p.uf_conselho === userLocation.uf)
        .slice(0, 20)
        .map(p => ({
          id: p.id,
          nome: p.nome_completo || p.nome,
          foto: p.selfie_documento_url,
          especialidade: p.especialidade_principal || p.especialidade || "DENTISTA",
          cidade: p.cidades_atendimento?.[0]?.split(' - ')[0] || "N/A",
          uf: p.uf_conselho,
          tipo_trabalho: p.aceita_freelance ? "FREELANCE" : "FIXO",
          page: "VerProfissional"
        }));

      // Se tiver menos de 6, duplicar para ter mais no carrossel
      if (filtered.length > 0 && filtered.length < 6) {
        const duplicated = [...filtered];
        while (duplicated.length < 6) {
          duplicated.push(...filtered.map(item => ({ ...item, id: `${item.id}-dup-${duplicated.length}` })));
        }
        return duplicated.slice(0, 12);
      }

      return filtered;
    },
    enabled: userType === "CLINICA" && !!userLocation.uf,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Buscar clínicas próximas (para profissionais verem)
  const { data: clinicasProximas = [] } = useQuery({
    queryKey: ["clinicasProximas", userLocation.uf],
    queryFn: async () => {
      if (userType !== "PROFISSIONAL" || !userLocation.uf) {
        return [];
      }

      const units = await base44.entities.CompanyUnit.filter({
        status_cadastro: "APROVADO"
      });

      // Buscar vagas de cada clínica para saber que especialidade procuram
      const allJobs = await base44.entities.Job.filter({
        status: "ABERTO"
      });

      // Filtrar por estado e formatar
      const filtered = units
        .filter(u => u.uf === userLocation.uf)
        .slice(0, 20)
        .map(u => {
          // Buscar vagas dessa clínica
          const unitJobs = allJobs.filter(j => j.unit_id === u.id);

          // Pegar especialidades das vagas abertas
          let especialidade = "CONTRATANDO";
          if (unitJobs.length > 0) {
            // Pega a primeira especialidade da primeira vaga
            if (unitJobs[0].especialidades_aceitas && unitJobs[0].especialidades_aceitas.length > 0) {
              especialidade = unitJobs[0].especialidades_aceitas[0];
            } else {
              // Se não tem especialidade específica, usa o tipo de profissional
              especialidade = unitJobs[0].tipo_profissional === "DENTISTA" ? "DENTISTA" : "MÉDICO";
            }
          } else {
            // Se não tem vagas, usa o tipo_mundo
            especialidade = u.tipo_mundo === "ODONTOLOGIA" ? "DENTISTA" : u.tipo_mundo === "MEDICINA" ? "MÉDICO" : "PROFISSIONAL";
          }

          return {
            id: u.id,
            nome: u.nome_fantasia || u.nome,
            foto: u.foto_fachada_url,
            especialidade: especialidade,
            cidade: u.cidade,
            uf: u.uf,
            page: "PerfilClinicaPublico"
          };
        });

      // Se tiver menos de 6, duplicar para ter mais no carrossel
      if (filtered.length > 0 && filtered.length < 6) {
        const duplicated = [...filtered];
        while (duplicated.length < 6) {
          duplicated.push(...filtered.map(item => ({ ...item, id: `${item.id}-dup-${duplicated.length}` })));
        }
        return duplicated.slice(0, 12);
      }

      return filtered;
    },
    enabled: userType === "PROFISSIONAL" && !!userLocation.uf,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Buscar posts do feed - FILTRADO POR ÁREA
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["feedPosts", userArea],
    queryFn: async () => {
      const feedPosts = await base44.entities.FeedPost.filter({ ativo: true });
      
      // Filtrar: não expirados e por área
      const now = new Date();
      const filteredPosts = feedPosts.filter(post => {
        // Verificar expiração
        if (post.expires_at && new Date(post.expires_at) < now) return false;
        // Verificar área
        return post.area === "AMBOS" || post.area === userArea;
      });
      
      return filteredPosts.sort((a, b) => {
        if (a.destaque && !b.destaque) return -1;
        if (!a.destaque && b.destaque) return 1;
        return new Date(b.created_date) - new Date(a.created_date);
      });
    },
    enabled: !!user && !!userArea,
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Handler para curtir post
  const handleCurtir = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      await base44.entities.FeedPost.update(postId, {
        curtidas: (post.curtidas || 0) + 1
      });
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
      toast.success("Curtido!");
    } catch (error) {
      logger.error("Erro ao curtir:", error);
    }
  };

  // Handler para clique no item do banner
  const handleBannerItemClick = (item) => {
    // Ignorar cliques em itens duplicados
    if (String(item.id).includes('-dup-')) {
      const realId = String(item.id).split('-dup-')[0];
      if (item.page === "VerProfissional") {
        navigate(createPageUrl("VerProfissional") + `?id=${realId}`);
      } else if (item.page === "PerfilClinicaPublico") {
        navigate(createPageUrl("PerfilClinicaPublico") + `?id=${realId}`);
      }
      return;
    }

    if (item.page === "VerProfissional") {
      navigate(createPageUrl("VerProfissional") + `?id=${item.id}`);
    } else if (item.page === "PerfilClinicaPublico") {
      navigate(createPageUrl("PerfilClinicaPublico") + `?id=${item.id}`);
    }
  };

  // Handler para clique nos stories de substituição
  const handleSubstituicaoClick = (item) => {
    if (String(item.id).includes('-dup-')) {
      const realId = String(item.id).split('-dup-')[0];
      if (item.tipo === "profissional") {
        navigate(createPageUrl("VerProfissional") + `?id=${realId}`);
      } else {
        navigate(createPageUrl("DetalheSubstituicao") + `?id=${realId}`);
      }
      return;
    }

    if (item.tipo === "profissional") {
      navigate(createPageUrl("VerProfissional") + `?id=${item.id}`);
    } else {
      navigate(createPageUrl("DetalheSubstituicao") + `?id=${item.id}`);
    }
  };

  // Buscar profissionais ONLINE para substituição (para clínicas verem)
  const { data: profissionaisOnlineSubstituicao = [] } = useQuery({
    queryKey: ["profissionaisOnlineSubstituicao", userLocation.cidade, userArea],
    queryFn: async () => {
      if (userType !== "CLINICA" || !userLocation.cidade || !userArea) return [];
      
      const profissionais = await base44.entities.Professional.filter({
        status_disponibilidade_substituicao: "ONLINE",
        disponivel_substituicao: true,
        esta_suspenso: false,
        status_cadastro: "APROVADO"
      });
      
      // Filtrar por área e cidade
      const filtered = profissionais
        .filter(p => {
          // Filtrar por área
          if (userArea === "ODONTOLOGIA" && p.tipo_profissional !== "DENTISTA") return false;
          if (userArea === "MEDICINA" && p.tipo_profissional !== "MEDICO") return false;
          
          // Filtrar por cidade
          if (!p.cidades_atendimento || p.cidades_atendimento.length === 0) return false;
          const profCidades = p.cidades_atendimento.map(c => c.split(' - ')[0].toLowerCase());
          return profCidades.includes(userLocation.cidade.toLowerCase());
        })
        .map(p => ({
          id: p.id,
          nome: p.nome_completo,
          foto: p.selfie_documento_url,
          especialidade: p.especialidade_principal || "Clínica Geral",
          cidade: userLocation.cidade,
          uf: p.uf_conselho,
          statusBadge: "ONLINE",
          tipo: "profissional"
        }));
      
      return filtered;
    },
    enabled: userType === "CLINICA" && !!userLocation.cidade && !!userArea
  });

  // Buscar vagas de substituição abertas (para profissionais verem)
  const { data: vagasSubstituicaoAbertas = [] } = useQuery({
    queryKey: ["vagasSubstituicaoAbertas", userLocation.cidade, userArea],
    queryFn: async () => {
      if (userType !== "PROFISSIONAL" || !userLocation.cidade || !userArea) return [];
      
      const vagas = await base44.entities.SubstituicaoUrgente.filter({
        status: "ABERTA"
      });
      
      // Filtrar por área e cidade
      const filtered = vagas
        .filter(v => {
          // Filtrar por área
          if (userArea === "ODONTOLOGIA" && v.tipo_profissional !== "DENTISTA") return false;
          if (userArea === "MEDICINA" && v.tipo_profissional !== "MEDICO") return false;
          
          // Filtrar por cidade
          return v.cidade?.toLowerCase() === userLocation.cidade?.toLowerCase();
        })
        .map(v => ({
          id: v.id,
          nome: v.nome_clinica,
          foto: null,
          especialidade: v.especialidade_necessaria,
          cidade: v.cidade,
          uf: v.uf,
          isUrgente: v.tipo_data === "IMEDIATO",
          dataTexto: formatarTextoData(v).substring(0, 15) + "...",
          remuneracao: v.tipo_remuneracao === "DIARIA" ? formatarValor(v.valor_diaria) : "% proc.",
          tipo: "substituicao"
        }));
      
      return filtered;
    },
    enabled: userType === "PROFISSIONAL" && !!userLocation.cidade && !!userArea
  });

  // Determinar itens do banner baseado no tipo de usuário
  const bannerItems = userType === "CLINICA" ? profissionaisProximos : clinicasProximas;
  const substituicoesItems = userType === "CLINICA" ? profissionaisOnlineSubstituicao : vagasSubstituicaoAbertas;

  const handleLike = async (postId) => {
    toast.success("Curtido!");
  };

  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.titulo,
          text: post.resumo,
          url: window.location.href
        });
      } catch (error) {
        // Erro silencioso ao compartilhar
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 overflow-x-hidden" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-center relative">
          <h1 className="text-lg font-black text-white tracking-tight uppercase drop-shadow-lg">
            OPORTUNIDADES
          </h1>
          <button
            onClick={() => navigate(createPageUrl("NotificationCenter"))}
            className="absolute right-0 w-11 h-11 bg-white rounded-full flex items-center justify-center hover:shadow-lg transition-all shadow-md"
          >
            <Bell className="w-5 h-5 text-red-500 fill-red-500" />
          </button>
        </div>
      </div>

      {/* Stories Unificado */}
      <StoriesUnificado
        substituicoes={substituicoesItems}
        vagas={bannerItems}
        userType={userType}
        onSubstituicaoClick={handleSubstituicaoClick}
        onVagaClick={handleBannerItemClick}
      />

      {/* CSS Global para esconder scrollbar */}
      <style>{`
        body, html, #root {
          overflow-x: hidden !important;
        }
        body::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Lista de Posts - Intercalando com CTA Telegram */}
      <div className="px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nenhuma novidade ainda
            </h3>
            <p className="text-gray-500">
              Em breve teremos conteúdos incríveis para você!
            </p>
          </div>
        ) : (
          <>
            {posts.map((post, index) => (
              <React.Fragment key={post.id}>
                <FeedCard
                  post={post}
                  onVideoClick={(p) => setVideoModal({ open: true, post: p })}
                  onCurtir={handleCurtir}
                />
                
                {/* A cada 5 posts, mostrar CTA do Telegram */}
                {(index + 1) % 5 === 0 && (
                  <ComunidadeTelegramCard key={`telegram-${index}`} />
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      {/* Modal de Vídeo */}
      <VideoModal
        isOpen={videoModal.open}
        onClose={() => setVideoModal({ open: false, post: null })}
        post={videoModal.post}
        onCurtir={handleCurtir}
      />
    </div>
  );
}