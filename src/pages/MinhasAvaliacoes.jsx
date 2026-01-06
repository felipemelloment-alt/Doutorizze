import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import {
  ChevronLeft,
  Star,
  Clock,
  Calendar,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MinhasAvaliacoes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // PROFISSIONAL | CLINICA
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("PENDENTES");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Detectar tipo de usuário
        const professionals = await base44.entities.Professional.filter({ user_id: currentUser.id });
        if (professionals.length > 0) {
          setUserType("PROFISSIONAL");
          setUserId(professionals[0].id);
          return;
        }

        const owners = await base44.entities.CompanyOwner.filter({ user_id: currentUser.id });
        if (owners.length > 0) {
          setUserType("CLINICA");
          setUserId(owners[0].id);
          return;
        }
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  // Buscar contratos
  const { data: contracts = [] } = useQuery({
    queryKey: ["contracts", userId, userType],
    queryFn: async () => {
      if (!userId || !userType) return [];
      
      const filter = userType === "PROFISSIONAL" 
        ? { professional_id: userId }
        : { unit_id: userId };
      
      return await base44.entities.JobContract.filter(filter);
    },
    enabled: !!userId && !!userType
  });

  // Buscar avaliações
  const { data: ratings = [] } = useQuery({
    queryKey: ["ratings", userId, userType],
    queryFn: async () => {
      if (!userId || !userType) return [];
      
      const allRatings = await base44.entities.Rating.list();
      return allRatings.filter(r => 
        r.avaliador_id === userId || r.avaliado_id === userId
      );
    },
    enabled: !!userId && !!userType
  });

  // Buscar dados relacionados
  const { data: professionals = [] } = useQuery({
    queryKey: ["professionals"],
    queryFn: () => base44.entities.Professional.list(),
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: () => base44.entities.CompanyUnit.list(),
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => base44.entities.Job.list(),
  });

  // Contratos pendentes de avaliação
  const contratosPendentes = contracts.filter(contract => {
    if (contract.status !== "ATIVO") return false;
    
    const campoAvaliacao = userType === "PROFISSIONAL" 
      ? "avaliacao_dentista_feita" 
      : "avaliacao_clinica_feita";
    
    return !contract[campoAvaliacao];
  });

  // Avaliações realizadas
  const avaliacoesRealizadas = ratings.filter(r => r.avaliador_id === userId);

  // Avaliações recebidas
  const avaliacoesRecebidas = ratings.filter(r => r.avaliado_id === userId);

  // Média das avaliações recebidas
  const mediaAvaliacoes = avaliacoesRecebidas.length > 0
    ? (avaliacoesRecebidas.reduce((sum, r) => sum + r.nota, 0) / avaliacoesRecebidas.length).toFixed(1)
    : 0;

  const renderStars = (nota) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= nota ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getOutraParteInfo = (contract) => {
    if (userType === "PROFISSIONAL") {
      const unit = units.find(u => u.id === contract.unit_id);
      return {
        nome: unit?.nome_fantasia || "Clínica",
        tipo: "Clínica"
      };
    } else {
      const prof = professionals.find(p => p.id === contract.professional_id);
      return {
        nome: prof?.nome_completo || "Profissional",
        tipo: "Profissional"
      };
    }
  };

  const getJobInfo = (contract) => {
    const job = jobs.find(j => j.id === contract.job_id);
    return job?.titulo || "Vaga";
  };

  const getDiasRestantes = (contract) => {
    const expiresAt = new Date(contract.token_expires_at);
    const hoje = new Date();
    return differenceInDays(expiresAt, hoje);
  };

  if (!user || !userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-3xl font-black text-gray-900">Minhas Avaliações</h1>
          <p className="text-gray-600">Gerencie suas avaliações e feedback</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-xl p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("PENDENTES")}
            className={`flex-1 px-6 py-3 font-bold rounded-2xl transition-all ${
              activeTab === "PENDENTES"
                ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Pendentes {contratosPendentes.length > 0 && `(${contratosPendentes.length})`}
          </button>
          <button
            onClick={() => setActiveTab("REALIZADAS")}
            className={`flex-1 px-6 py-3 font-bold rounded-2xl transition-all ${
              activeTab === "REALIZADAS"
                ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Realizadas
          </button>
          <button
            onClick={() => setActiveTab("RECEBIDAS")}
            className={`flex-1 px-6 py-3 font-bold rounded-2xl transition-all ${
              activeTab === "RECEBIDAS"
                ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Recebidas
          </button>
        </div>

        {/* Tab Pendentes */}
        {activeTab === "PENDENTES" && (
          <div className="space-y-4">
            {contratosPendentes.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                titulo="Nenhuma avaliação pendente"
                descricao="Você está em dia com suas avaliações!"
              />
            ) : (
              contratosPendentes.map((contract, index) => {
                const outraParte = getOutraParteInfo(contract);
                const jobTitulo = getJobInfo(contract);
                const diasRestantes = getDiasRestantes(contract);
                
                return (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-3xl shadow-xl p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {outraParte.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-gray-900 text-lg">{outraParte.nome}</h3>
                          <p className="text-gray-600 text-sm">{outraParte.tipo}</p>
                          <p className="text-gray-500 text-sm mt-1">{jobTitulo}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {format(new Date(contract.created_date), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          {diasRestantes >= 0 && (
                            <div className={`flex items-center gap-2 mt-2 px-3 py-1 rounded-full w-fit ${
                              diasRestantes <= 2 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                              <Clock className="w-4 h-4" />
                              <span className="text-xs font-bold">
                                {diasRestantes === 0 
                                  ? "Expira hoje" 
                                  : `${diasRestantes} dia${diasRestantes > 1 ? "s" : ""} restante${diasRestantes > 1 ? "s" : ""}`
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const token = userType === "PROFISSIONAL" 
                            ? contract.token_dentista 
                            : contract.token_clinica;
                          const targetPage = userType === "PROFISSIONAL" 
                            ? "AvaliarClinica" 
                            : "AvaliarProfissional";
                          navigate(createPageUrl(targetPage) + `?token=${token}`);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                      >
                        Avaliar Agora
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Tab Realizadas */}
        {activeTab === "REALIZADAS" && (
          <div className="space-y-4">
            {avaliacoesRealizadas.length === 0 ? (
              <EmptyState
                icon={Star}
                titulo="Você ainda não avaliou ninguém"
                descricao="Suas avaliações aparecerão aqui"
              />
            ) : (
              avaliacoesRealizadas.map((rating, index) => {
                const avaliado = rating.avaliado_tipo === "DENTISTA" 
                  ? professionals.find(p => p.id === rating.avaliado_id)
                  : units.find(u => u.id === rating.avaliado_id);
                
                return (
                  <motion.div
                    key={rating.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-3xl shadow-xl p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {(avaliado?.nome_completo || avaliado?.nome_fantasia || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-gray-900 text-lg">
                          {avaliado?.nome_completo || avaliado?.nome_fantasia || "Usuário"}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {rating.avaliado_tipo === "DENTISTA" ? "Profissional" : "Clínica"}
                        </p>
                        <div className="mt-2">
                          {renderStars(rating.nota)}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {format(new Date(rating.created_date), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Tab Recebidas */}
        {activeTab === "RECEBIDAS" && (
          <>
            {avaliacoesRecebidas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl p-6 mb-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 mb-1">Sua Média Geral</h2>
                    <p className="text-gray-600">Baseado em {avaliacoesRecebidas.length} avaliação{avaliacoesRecebidas.length !== 1 && "ões"}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-5xl font-black text-gray-900">{mediaAvaliacoes}</div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                    {renderStars(Math.round(parseFloat(mediaAvaliacoes)))}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {avaliacoesRecebidas.length === 0 ? (
                <EmptyState
                  icon={Star}
                  titulo="Você ainda não recebeu avaliações"
                  descricao="Suas avaliações aparecerão aqui"
                />
              ) : (
                avaliacoesRecebidas.map((rating, index) => {
                  const avaliador = rating.avaliador_tipo === "DENTISTA" 
                    ? professionals.find(p => p.id === rating.avaliador_id)
                    : units.find(u => u.id === rating.avaliador_id);
                  
                  return (
                    <motion.div
                      key={rating.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-3xl shadow-xl p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {(avaliador?.nome_completo || avaliador?.nome_fantasia || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-gray-900 text-lg">
                            {avaliador?.nome_completo || avaliador?.nome_fantasia || "Usuário"}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {rating.avaliador_tipo === "DENTISTA" ? "Profissional" : "Clínica"}
                          </p>
                          <div className="mt-2">
                            {renderStars(rating.nota)}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {format(new Date(rating.created_date), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Componente de Estado Vazio
function EmptyState({ icon: Icon, titulo, descricao }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-12 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-black text-gray-900 mb-2">{titulo}</h3>
      <p className="text-gray-600">{descricao}</p>
    </motion.div>
  );
}