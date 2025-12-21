import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  ExternalLink,
  Sparkles,
  Newspaper,
  GraduationCap,
  Tag,
  Building2,
  MapPin,
  Bell,
  ChevronRight,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";
import SubstituicoesStories from "@/components/substituicoes/SubstituicoesStories";
import { formatarTextoData, formatarValor } from "@/components/constants/substituicao";

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
              <MapPin className="w-3 h-3 text-blue-600" />
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
            <span className="text-[10px] text-white font-bold truncate max-w-[90px] uppercase drop-shadow-md">
              {item.especialidade}
            </span>

            {/* Badge VAGA FIXA */}
            <span className="mt-1 px-2 py-0.5 bg-white text-blue-700 text-[9px] font-black rounded-full shadow-md">
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
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [userArea, setUserArea] = useState(null); // ODONTOLOGIA ou MEDICINA
  const [userLocation, setUserLocation] = useState({ cidade: null, uf: null });

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        console.log("🔍 USER ID:", currentUser.id);

        // Verificar tipo de usuário e localização
        const professionals = await base44.entities.Professional.filter({ user_id: currentUser.id });
        console.log("👨‍⚕️ Professionals:", professionals);
        
        if (professionals.length > 0) {
          const prof = professionals[0];
          console.log("✅ TIPO: PROFISSIONAL");
          console.log("📍 UF Conselho:", prof.uf_conselho);
          console.log("📍 Cidades Atendimento:", prof.cidades_atendimento);
          
          setUserType("PROFISSIONAL");
          setUserArea(prof.tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA");
          setUserLocation({
            cidade: prof.cidades_atendimento?.[0]?.split(' - ')[0] || "Não informada",
            uf: prof.uf_conselho || "Não informado"
          });
          return;
        }

        const owners = await base44.entities.CompanyOwner.filter({ user_id: currentUser.id });
        console.log("🏢 Owners:", owners);
        
        if (owners.length > 0) {
          setUserType("CLINICA");
          const units = await base44.entities.CompanyUnit.filter({ owner_id: owners[0].id });
          console.log("🏥 Units:", units);
          
          if (units.length > 0) {
            const unit = units[0];
            console.log("✅ TIPO: CLINICA");
            console.log("📍 UF:", unit.uf);
            console.log("📍 Cidade:", unit.cidade);
            
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
          console.log("✅ TIPO: FORNECEDOR");
          return;
        }

        const hospitals = await base44.entities.Hospital.filter({ user_id: currentUser.id });
        if (hospitals.length > 0) {
          setUserType("HOSPITAL");
          const hosp = hospitals[0];
          console.log("✅ TIPO: HOSPITAL");
          console.log("📍 UF:", hosp.uf);
          
          setUserLocation({
            cidade: hosp.cidade,
            uf: hosp.uf
          });
          return;
        }

        console.log("⚠️ Nenhum tipo de usuário encontrado!");

      } catch (error) {
        console.error("❌ Erro ao carregar dados do usuário:", error);
      }
    };
    loadUserData();
  }, []);

  // Buscar profissionais próximos (para clínicas verem)
  const { data: profissionaisProximos = [] } = useQuery({
    queryKey: ["profissionaisProximos", userLocation.uf],
    queryFn: async () => {
      console.log("🔍 BUSCANDO PROFISSIONAIS...");
      console.log("UserType:", userType);
      console.log("UserLocation UF:", userLocation.uf);
      
      if (userType !== "CLINICA" || !userLocation.uf) {
        console.log("⚠️ Query não executada - userType:", userType, "uf:", userLocation.uf);
        return [];
      }
      
      const profissionais = await base44.entities.Professional.filter({
        status_cadastro: "APROVADO"
      });

      console.log("📋 Total profissionais aprovados:", profissionais.length);
      console.log("📋 Profissionais:", profissionais);

      // Filtrar por estado e formatar - MÍNIMO 6 itens
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

      console.log("✅ Profissionais filtrados por UF", userLocation.uf, ":", filtered.length);

      // Se tiver menos de 6, duplicar para ter mais no carrossel
      if (filtered.length > 0 && filtered.length < 6) {
        const duplicated = [...filtered];
        while (duplicated.length < 6) {
          duplicated.push(...filtered.map(item => ({ ...item, id: `${item.id}-dup-${duplicated.length}` })));
        }
        console.log("🔄 Duplicados criados, total:", duplicated.slice(0, 12).length);
        return duplicated.slice(0, 12);
      }

      return filtered;
    },
    enabled: userType === "CLINICA" && !!userLocation.uf
  });

  // Buscar clínicas próximas (para profissionais verem)
  const { data: clinicasProximas = [] } = useQuery({
    queryKey: ["clinicasProximas", userLocation.uf],
    queryFn: async () => {
      console.log("🔍 BUSCANDO CLÍNICAS...");
      console.log("UserType:", userType);
      console.log("UserLocation UF:", userLocation.uf);

      if (userType !== "PROFISSIONAL" || !userLocation.uf) {
        console.log("⚠️ Query não executada - userType:", userType, "uf:", userLocation.uf);
        return [];
      }

      const units = await base44.entities.CompanyUnit.filter({
        status_cadastro: "APROVADO"
      });

      console.log("📋 Total clínicas aprovadas:", units.length);
      console.log("📋 Clínicas:", units);

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

      console.log("✅ Clínicas filtradas por UF", userLocation.uf, ":", filtered.length);

      // Se tiver menos de 6, duplicar para ter mais no carrossel
      if (filtered.length > 0 && filtered.length < 6) {
        const duplicated = [...filtered];
        while (duplicated.length < 6) {
          duplicated.push(...filtered.map(item => ({ ...item, id: `${item.id}-dup-${duplicated.length}` })));
        }
        console.log("🔄 Duplicados criados, total:", duplicated.slice(0, 12).length);
        return duplicated.slice(0, 12);
      }

      return filtered;
    },
    enabled: userType === "PROFISSIONAL" && !!userLocation.uf
  });

  // Buscar posts do feed
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["feedPosts"],
    queryFn: async () => {
      const feedPosts = await base44.entities.FeedPost.filter({ ativo: true });
      return feedPosts.sort((a, b) => {
        if (a.destaque && !b.destaque) return -1;
        if (!a.destaque && b.destaque) return 1;
        return new Date(b.created_date) - new Date(a.created_date);
      });
    }
  });

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
        console.log("Erro ao compartilhar:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 overflow-x-hidden" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 px-4 py-3 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Feed</h1>
            <p className="text-white/90 text-xs font-medium">Novidades e oportunidades</p>
          </div>
          <button
            onClick={() => navigate(createPageUrl("NotificationCenter"))}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Stories de Substituições - NOVO */}
      <div className="-mt-3">
        <SubstituicoesStories
          items={substituicoesItems}
          userType={userType}
          onItemClick={handleSubstituicaoClick}
        />
      </div>

      {/* Banner Stories - AUTO-SCROLL INFINITO */}
      <div className="-mt-2">
        <StoriesBanner
          items={bannerItems}
          userType={userType}
          onItemClick={handleBannerItemClick}
        />
      </div>

      {/* CSS Global para esconder scrollbar */}
      <style>{`
        body, html, #root {
          overflow-x: hidden !important;
        }
        body::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Lista de Posts */}
      <div className="px-4 space-y-4">
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
          posts.map((post) => {
            const config = tipoPostConfig[post.tipo_post] || tipoPostConfig.NOVIDADE;
            const PostIcon = config.icon;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                {post.imagem_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.imagem_url}
                      alt={post.titulo}
                      className="w-full h-full object-cover"
                    />
                    {post.destaque && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                        ⭐ Destaque
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 ${config.bgColor} ${config.color} text-xs font-bold rounded-full flex items-center gap-1`}>
                      <PostIcon className="w-3 h-3" />
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {post.titulo}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.descricao}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                        <span className="text-sm">{post.curtidas || 0}</span>
                      </button>

                      <div className="flex items-center gap-1 text-gray-500">
                        <Eye className="w-5 h-5" />
                        <span className="text-sm">{post.visualizacoes || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShare(post)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Share2 className="w-5 h-5 text-gray-500" />
                      </button>

                      {post.link_externo && (
                        <a
                          href={post.link_externo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full hover:shadow-lg transition-all"
                        >
                          Ver mais
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}