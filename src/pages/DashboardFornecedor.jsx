import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Edit,
  Eye,
  Phone,
  Star,
  Plus,
  Package,
  CheckCircle,
  Clock,
  Zap,
  MessageCircle,
  Camera,
  DollarSign
} from "lucide-react";

export default function DashboardFornecedor() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [supplier, setSupplier] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const supplierResult = await base44.entities.Supplier.filter({ user_id: currentUser.id });
        setSupplier(supplierResult[0] || null);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadUser();
  }, []);

  // Buscar promoções do fornecedor (quando a entidade Promotion existir)
  const { data: promocoes = [] } = useQuery({
    queryKey: ["promocoes", supplier?.id],
    queryFn: async () => {
      if (!supplier?.id) return [];
      // Quando a entidade Promotion for criada, descomentar:
      // return await base44.entities.Promotion.filter({ supplier_id: supplier.id });
      return [];
    },
    enabled: !!supplier?.id
  });

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    PENDENTE: { label: "Em Análise", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    APROVADO: { label: "Verificado ✓", color: "bg-green-100 text-green-700", icon: CheckCircle },
    REJEITADO: { label: "Rejeitado", color: "bg-red-100 text-red-700", icon: Clock }
  };

  const status = statusConfig[supplier.status_cadastro] || statusConfig.PENDENTE;
  const StatusIcon = status.icon;

  const promocoesAtivas = promocoes.filter(p => p.status === "ATIVO").length;
  const promocoesRecentes = promocoes.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      {/* Decoração */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo/Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
                {supplier.logo_url ? (
                  <img src={supplier.logo_url} alt={supplier.nome_fantasia} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  supplier.nome_fantasia?.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900">{supplier.nome_fantasia}</h1>
                <p className="text-gray-600">{supplier.razao_social}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                  {supplier.area_atuacao && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      {supplier.area_atuacao === "AMBOS" ? "Odonto & Medicina" : supplier.area_atuacao}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(createPageUrl("EditarFornecedor"))}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-yellow-400 hover:text-yellow-600 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Edit className="w-5 h-5" />
              Editar Perfil
            </button>
          </div>
        </motion.div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={Package}
            label="Promoções Ativas"
            value={promocoesAtivas}
            color="from-blue-400 to-blue-600"
            delay={0}
          />
          <MetricCard
            icon={Eye}
            label="Visualizações"
            value={supplier.total_visualizacoes || 0}
            color="from-green-400 to-green-600"
            delay={0.1}
          />
          <MetricCard
            icon={Phone}
            label="Cliques WhatsApp"
            value={supplier.total_cliques_whatsapp || 0}
            color="from-pink-400 to-pink-600"
            delay={0.2}
          />
          <MetricCard
            icon={Star}
            label="Avaliação Média"
            value={supplier.media_avaliacoes?.toFixed(1) || "0.0"}
            color="from-yellow-400 to-orange-500"
            delay={0.3}
          />
        </div>

        {/* AÇÕES RÁPIDAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <button
            onClick={() => navigate(createPageUrl("CriarPromocao"))}
            className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl hover:scale-[1.02] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black text-gray-900 mb-1">Criar Nova Promoção</h3>
                <p className="text-gray-600 text-sm">Adicione um novo produto ou oferta</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate(createPageUrl("MinhasPromocoes"))}
            className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl hover:scale-[1.02] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Package className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black text-gray-900 mb-1">Ver Minhas Promoções</h3>
                <p className="text-gray-600 text-sm">Gerencie suas ofertas e produtos</p>
              </div>
            </div>
          </button>
        </motion.div>

        {/* PROMOÇÕES RECENTES */}
        {promocoesRecentes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl shadow-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-gray-900">Promoções Recentes</h2>
              <button
                onClick={() => navigate(createPageUrl("MinhasPromocoes"))}
                className="text-orange-500 font-bold hover:text-orange-600 transition-colors"
              >
                Ver Todas →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {promocoesRecentes.map((promo, index) => (
                <PromocaoCard key={promo.id} promocao={promo} delay={index * 0.1} />
              ))}
            </div>
          </motion.div>
        )}

        {/* DICAS PARA VENDER MAIS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-3xl shadow-xl p-8 text-white"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black">Dicas para Vender Mais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DicaCard
              icon={Camera}
              titulo="Fotos de Qualidade"
              descricao="Use imagens profissionais e bem iluminadas dos seus produtos"
            />
            <DicaCard
              icon={MessageCircle}
              titulo="Responda Rápido"
              descricao="Atenda clientes no WhatsApp em até 1 hora para aumentar vendas"
            />
            <DicaCard
              icon={DollarSign}
              titulo="Preços Atualizados"
              descricao="Mantenha seus preços competitivos e sempre atualizados"
            />
          </div>
        </motion.div>

        {/* AVISO SE PENDENTE */}
        {supplier.status_cadastro === "PENDENTE" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6 mt-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-200 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-yellow-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Cadastro em Análise</h3>
                <p className="text-gray-700 mb-3">
                  Seu cadastro está sendo analisado pela nossa equipe. Você poderá criar promoções assim que for aprovado.
                </p>
                <p className="text-sm text-gray-600">
                  ⏱️ Tempo médio de aprovação: <strong>24-48 horas úteis</strong>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all"
    >
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3 shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </motion.div>
  );
}

function PromocaoCard({ promocao, delay }) {
  const statusColors = {
    ATIVO: "bg-green-100 text-green-700",
    PAUSADO: "bg-yellow-100 text-yellow-700",
    ENCERRADO: "bg-gray-100 text-gray-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
    >
      {promocao.imagem_url && (
        <div className="h-32 overflow-hidden bg-gray-200">
          <img src={promocao.imagem_url} alt={promocao.titulo} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${statusColors[promocao.status]}`}>
          {promocao.status}
        </span>
        <h3 className="font-bold text-gray-900 mb-2 truncate">{promocao.titulo}</h3>
        <div className="flex items-center gap-2">
          {promocao.preco_original && (
            <span className="text-sm text-gray-400 line-through">
              R$ {promocao.preco_original.toFixed(2)}
            </span>
          )}
          <span className="text-lg font-black text-green-600">
            R$ {promocao.preco_promocional?.toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function DicaCard({ icon: Icon, titulo, descricao }) {
  return (
    <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-bold text-white mb-1">{titulo}</h3>
      <p className="text-sm text-white/80">{descricao}</p>
    </div>
  );
}