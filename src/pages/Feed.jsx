import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// Componente do Banner Stories com Auto-scroll
function StoriesBanner({ items, userType, onItemClick }) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Auto-scroll effect
  useEffect(() => {
    if (!scrollRef.current || isPaused || items.length === 0) return;

    const container = scrollRef.current;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const newPos = prev + 1;
        if (newPos >= maxScroll) {
          return 0;
        }
        return newPos;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  const handleTouchStart = () => {
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handleScroll = (e) => {
    setScrollPosition(e.target.scrollLeft);
  };

  if (items.length === 0) return null;

  const titulo = userType === "CLINICA" 
    ? "🔔 PROFISSIONAIS DISPONÍVEIS 📣"
    : "🔔 CLÍNICAS CONTRATANDO 📣";

  return (
    <div className="bg-white py-4 mb-4 shadow-sm">
      <div className="px-4 mb-3">
        <h2 className="text-center font-black text-lg text-red-600 tracking-wide">
          {titulo}
        </h2>
      </div>

      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onScroll={handleScroll}
        className="flex gap-4 px-4 overflow-x-auto scrollbar-hide"
        style={{ scrollBehavior: 'auto' }}
      >
        {items.map((item, index) => (
          <motion.button
            key={item.id || index}
            onClick={() => onItemClick(item)}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 flex flex-col items-center min-w-[100px]"
          >
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-red-500" />
              <span className="text-xs text-gray-600 font-medium truncate max-w-[90px]">
                {item.cidade} - {item.uf}
              </span>
            </div>

            <div className="relative">
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

            <span className="text-xs font-bold text-gray-900 mt-1 truncate max-w-[100px] text-center">
              {item.nome}
            </span>

            <span className="text-[10px] text-green-600 font-semibold truncate max-w-[100px] uppercase">
              {item.especialidade}
            </span>

            {item.tipo_trabalho && (
              <span className="mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full">
                {item.tipo_trabalho}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

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
  const [userLocation, setUserLocation] = useState({ cidade: null, uf: null });
  const [feedPreferences, setFeedPreferences] = useState(null);

  // Carregar dados do usuário e preferências
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Carregar preferências do feed
        const prefs = await base44.entities.NotificationPreference.filter({ 
          created_by: currentUser.email 
        });
        if (prefs.length > 0) {
          setFeedPreferences(prefs[0]);
        }

        // Verificar tipo de usuário e localização
        const professionals = await base44.entities.Professional.filter({ user_id: currentUser.id });
        if (professionals.length > 0) {
          setUserType("PROFISSIONAL");
          setUserLocation({
            cidade: professionals[0].cidades_atendimento?.[0]?.split(' - ')[0] || professionals[0].cidade,
            uf: professionals[0].uf_conselho || professionals[0].uf
          });
          return;
        }

        const owners = await base44.entities.CompanyOwner.filter({ user_id: currentUser.id });
        if (owners.length > 0) {
          setUserType("CLINICA");
          const units = await base44.entities.CompanyUnit.filter({ owner_id: owners[0].id });
          if (units.length > 0) {
            setUserLocation({
              cidade: units[0].cidade,
              uf: units[0].uf
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
          setUserLocation({
            cidade: hospitals[0].cidade,
            uf: hospitals[0].uf
          });
          return;
        }

      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };
    loadUserData();
  }, []);

  // Buscar profissionais próximos (para clínicas)
  const { data: profissionaisProximos = [] } = useQuery({
    queryKey: ["profissionaisProximos", userLocation.uf],
    queryFn: async () => {
      if (userType !== "CLINICA" || !userLocation.uf) return [];
      
      const profissionais = await base44.entities.Professional.filter({
        status_cadastro: "APROVADO"
      });

      return profissionais
        .filter(p => p.uf_conselho === userLocation.uf)
        .slice(0, 20)
        .map(p => ({
          id: p.id,
          nome: p.nome_completo,
          foto: p.selfie_documento_url,
          especialidade: p.especialidade_principal,
          cidade: p.cidades_atendimento?.[0]?.split(' - ')[0] || "N/A",
          uf: p.uf_conselho,
          tipo_trabalho: p.aceita_freelance ? "FREELANCE" : "FIXO",
          page: "VerProfissional"
        }));
    },
    enabled: userType === "CLINICA" && !!userLocation.uf
  });

  // Buscar clínicas próximas (para profissionais)
  const { data: clinicasProximas = [] } = useQuery({
    queryKey: ["clinicasProximas", userLocation.uf],
    queryFn: async () => {
      if (userType !== "PROFISSIONAL" || !userLocation.uf) return [];
      
      const units = await base44.entities.CompanyUnit.filter({
        status_cadastro: "APROVADO"
      });

      return units
        .filter(u => u.uf === userLocation.uf)
        .slice(0, 20)
        .map(u => ({
          id: u.id,
          nome: u.nome_fantasia,
          foto: u.foto_fachada_url,
          especialidade: u.tipo_empresa,
          cidade: u.cidade,
          uf: u.uf,
          page: "PerfilClinicaPublico"
        }));
    },
    enabled: userType === "PROFISSIONAL" && !!userLocation.uf
  });

  // Buscar posts do feed
  const { data: allPosts = [], isLoading, refetch } = useQuery({
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

  // Filtrar posts baseado nas preferências do FeedConfig
  const posts = React.useMemo(() => {
    if (!feedPreferences || !allPosts.length) return allPosts;

    const tiposAtivos = feedPreferences.tipos_conteudo_ativos || [];
    const apenasMeuEstado = feedPreferences.apenas_meu_estado || false;

    return allPosts.filter(post => {
      const tipoMap = {
        'NOVIDADE': 'novidades',
        'NOTICIA_SAUDE': 'noticias',
        'NOTICIA_IA': 'noticias',
        'PARCEIRO': 'novidades',
        'PROMOCAO': 'promocoes',
        'CURSO': 'cursos',
        'DESTAQUE_MARKETPLACE': 'marketplace'
      };

      const tipoPreferencia = tipoMap[post.tipo_post];
      
      if (tiposAtivos.length === 0) return true;
      
      const tipoAtivo = tiposAtivos.includes(tipoPreferencia);
      
      if (apenasMeuEstado && userLocation.uf) {
        const postUf = post.localizacao?.split(' - ')[1] || post.uf;
        const regiaoMatch = postUf === userLocation.uf;
        return tipoAtivo && regiaoMatch;
      }

      return tipoAtivo;
    });
  }, [allPosts, feedPreferences, userLocation.uf]);

  // Handler para clique no item do banner
  const handleBannerItemClick = (item) => {
    if (item.page === "VerProfissional") {
      navigate(createPageUrl("VerProfissional") + `?id=${item.id}`);
    } else if (item.page === "PerfilClinicaPublico") {
      navigate(createPageUrl("PerfilClinicaPublico") + `?id=${item.id}`);
    }
  };

  const bannerItems = userType === "CLINICA" ? profissionaisProximos : clinicasProximas;

  const curtirMutation = useMutation({
    mutationFn: async (postId) => {
      const post = allPosts.find(p => p.id === postId);
      return await base44.entities.FeedPost.update(postId, {
        curtidas: (post.curtidas || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
      toast.success("❤️ Curtido!");
    }
  });

  const incrementarVisualizacoesMutation = useMutation({
    mutationFn: async (postId) => {
      const post = allPosts.find(p => p.id === postId);
      return await base44.entities.FeedPost.update(postId, {
        visualizacoes: (post.visualizacoes || 0) + 1
      });
    }
  });

  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.titulo,
          text: post.descricao,
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

  const handleAbrirLink = (post) => {
    incrementarVisualizacoesMutation.mutate(post.id);
    
    if (post.link_interno) {
      navigate(createPageUrl(post.link_interno));
    } else if (post.link_externo) {
      window.open(post.link_externo, "_blank");
    }
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch {
      return "Recente";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Feed</h1>
            <p className="text-white/80 text-sm">Novidades e oportunidades</p>
          </div>
          <button
            onClick={() => navigate(createPageUrl("NotificationCenter"))}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Bell className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Banner Stories */}
      <div className="-mt-4">
        <StoriesBanner
          items={bannerItems}
          userType={userType}
          onItemClick={handleBannerItemClick}
        />
      </div>

      {/* Lista de Posts */}
      <div className="px-4 space-y-4">
        {posts.length === 0 ? (
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
                      {getTimeAgo(post.created_date)}
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
                        onClick={() => curtirMutation.mutate(post.id)}
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

                      {(post.link_externo || post.link_interno) && (
                        <button
                          onClick={() => handleAbrirLink(post)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full hover:shadow-lg transition-all"
                        >
                          Ver mais
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pull to Refresh */}
      {posts.length > 0 && (
        <div className="fixed bottom-24 right-6 z-50">
          <button
            onClick={() => refetch()}
            className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all"
          >
            <span className="text-2xl">🔄</span>
          </button>
        </div>
      )}
    </div>
  );
}