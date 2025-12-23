import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  User,
  Building2,
  MapPin,
  Check,
  X,
  Eye,
  Calendar,
  FileText,
  Phone,
  Mail,
  Shield,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Package,
  Hospital,
  MessageCircle,
  GraduationCap
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function AdminAprovacoes() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("TODOS");
  const [filterStatus, setFilterStatus] = useState("EM_ANALISE");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsModal, setDetailsModal] = useState(null);
  const [rejectionModal, setRejectionModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionCheckboxes, setRejectionCheckboxes] = useState({
    documento_ilegivel: false,
    dados_incompletos: false,
    registro_invalido: false,
    foto_inadequada: false,
    outro: false
  });
  const [notificationModal, setNotificationModal] = useState(null);
  const [notificationData, setNotificationData] = useState({
    tipo: "CADASTRO",
    mensagem: "",
    enviarApp: true,
    enviarWhatsApp: false
  });
  const itemsPerPage = 10;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Verificar se é admin
        if (currentUser.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Se não é admin, mostrar tela de acesso negado
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta área. Esta página é exclusiva para administradores.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Buscar profissionais
  const { data: professionals = [] } = useQuery({
    queryKey: ["professionals", filterStatus],
    queryFn: async () => {
      const result = await base44.entities.Professional.filter(
        filterStatus === "TODOS" ? {} : { status_cadastro: filterStatus }
      );
      return result || [];
    },
  });

  // Buscar donos de clínicas
  const { data: owners = [] } = useQuery({
    queryKey: ["companyOwners", filterStatus],
    queryFn: async () => {
      const result = await base44.entities.CompanyOwner.filter(
        filterStatus === "TODOS" ? {} : { status_cadastro: filterStatus }
      );
      return result || [];
    },
  });

  // Buscar fornecedores
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers", filterStatus],
    queryFn: async () => {
      const result = await base44.entities.Supplier.filter(
        filterStatus === "TODOS" ? {} : { status_cadastro: filterStatus }
      );
      return result || [];
    },
  });

  // Buscar hospitais
  const { data: hospitals = [] } = useQuery({
    queryKey: ["hospitals", filterStatus],
    queryFn: async () => {
      const result = await base44.entities.Hospital.filter(
        filterStatus === "TODOS" ? {} : { status_cadastro: filterStatus }
      );
      return result || [];
    },
  });

  // Buscar instituições de ensino
  const { data: institutions = [] } = useQuery({
    queryKey: ["institutions", filterStatus],
    queryFn: async () => {
      const result = await base44.entities.EducationInstitution.filter(
        filterStatus === "TODOS" ? {} : { status_cadastro: filterStatus }
      );
      return result || [];
    },
  });

  // Combinar e processar dados
  const allCadastros = [
    ...professionals.map(p => ({
      ...p,
      tipo: "PROFISSIONAL",
      entity: "Professional",
      nome: p.nome_completo,
      registro: `${p.tipo_profissional === "DENTISTA" ? "CRO" : "CRM"} ${p.registro_conselho}/${p.uf_conselho}`,
      localizacao: p.cidades_atendimento?.[0] || "N/A",
    })),
    ...owners.map(o => ({
      ...o,
      tipo: "CLINICA",
      entity: "CompanyOwner",
      nome: o.nome_completo,
      registro: `CPF ${o.cpf}`,
      localizacao: "Responsável",
    })),
    ...suppliers.map(s => ({
      ...s,
      tipo: "FORNECEDOR",
      entity: "Supplier",
      nome: s.nome_fantasia,
      registro: `CNPJ ${s.cnpj}`,
      localizacao: `${s.cidade} - ${s.uf}`,
    })),
    ...hospitals.map(h => ({
      ...h,
      tipo: "HOSPITAL",
      entity: "Hospital",
      nome: h.nome_fantasia,
      registro: h.tipo_instituicao,
      localizacao: `${h.cidade} - ${h.uf}`,
    })),
    ...institutions.map(i => ({
      ...i,
      tipo: "INSTITUICAO",
      entity: "EducationInstitution",
      nome: i.nome_fantasia,
      registro: i.tipo_instituicao,
      localizacao: `${i.cidade} - ${i.uf}`,
    }))
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  // Filtrar cadastros
  const filteredCadastros = allCadastros.filter(c => {
    const matchSearch = c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.registro?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === "TODOS" || c.tipo === filterType;
    return matchSearch && matchType;
  });

  // Estatísticas
  const stats = {
    pendente: allCadastros.filter(c => c.status_cadastro === "EM_ANALISE").length,
    aprovado: allCadastros.filter(c => c.status_cadastro === "APROVADO").length,
    rejeitado: allCadastros.filter(c => c.status_cadastro === "REPROVADO").length,
    total: allCadastros.length
  };

  // Paginação
  const totalPages = Math.ceil(filteredCadastros.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCadastros = filteredCadastros.slice(startIndex, startIndex + itemsPerPage);

  // Mutação de aprovação
  const aprovarMutation = useMutation({
    mutationFn: async (cadastro) => {
      const updateData = {
        status_cadastro: "APROVADO",
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        motivo_reprovacao: null
      };

      await base44.entities[cadastro.entity].update(cadastro.id, updateData);

      // Enviar notificação
      const destinatarioTipo = cadastro.tipo === "PROFISSIONAL" 
        ? cadastro.tipo_profissional 
        : cadastro.tipo === "CLINICA"
        ? "CLINICA"
        : cadastro.tipo === "FORNECEDOR"
        ? "FORNECEDOR"
        : cadastro.tipo === "HOSPITAL"
        ? "HOSPITAL"
        : "INSTITUICAO";

      await base44.entities.Notification.create({
        destinatario_id: cadastro.user_id,
        destinatario_tipo: destinatarioTipo,
        tipo: "STATUS_APROVADO",
        titulo: "🎉 Cadastro Aprovado!",
        mensagem: `Parabéns! Seu cadastro foi aprovado e você já pode começar a usar o NEW JOBS.`,
        canais_enviados: ["PUSH"]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      queryClient.invalidateQueries({ queryKey: ["companyOwners"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      toast.success("✅ Cadastro aprovado com sucesso!");
      setDetailsModal(null);
    },
    onError: (error) => {
      toast.error("❌ Erro ao aprovar: " + error.message);
    }
  });

  // Mutação de rejeição
  const rejeitarMutation = useMutation({
    mutationFn: async ({ cadastro, motivo }) => {
      const updateData = {
        status_cadastro: "REPROVADO",
        motivo_reprovacao: motivo
      };

      await base44.entities[cadastro.entity].update(cadastro.id, updateData);

      // Enviar notificação
      const destinatarioTipo = cadastro.tipo === "PROFISSIONAL" 
        ? cadastro.tipo_profissional 
        : cadastro.tipo === "CLINICA"
        ? "CLINICA"
        : cadastro.tipo === "FORNECEDOR"
        ? "FORNECEDOR"
        : cadastro.tipo === "HOSPITAL"
        ? "HOSPITAL"
        : "INSTITUICAO";

      await base44.entities.Notification.create({
        destinatario_id: cadastro.user_id,
        destinatario_tipo: destinatarioTipo,
        tipo: "STATUS_REPROVADO",
        titulo: "❌ Cadastro Reprovado",
        mensagem: `Seu cadastro foi reprovado. Motivo: ${motivo}`,
        canais_enviados: ["PUSH", "EMAIL"]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      queryClient.invalidateQueries({ queryKey: ["companyOwners"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      toast.success("❌ Cadastro reprovado.");
      setRejectionModal(null);
      setDetailsModal(null);
      setRejectionReason("");
      setRejectionCheckboxes({
        documento_ilegivel: false,
        dados_incompletos: false,
        registro_invalido: false,
        foto_inadequada: false,
        outro: false
      });
    },
    onError: (error) => {
      toast.error("❌ Erro ao rejeitar: " + error.message);
    }
  });

  const handleReject = () => {
    const motivos = Object.entries(rejectionCheckboxes)
      .filter(([_, checked]) => checked)
      .map(([key, _]) => {
        const labels = {
          documento_ilegivel: "Documento ilegível",
          dados_incompletos: "Dados incompletos",
          registro_invalido: "Registro profissional inválido",
          foto_inadequada: "Foto inadequada",
          outro: "Outro"
        };
        return labels[key];
      });

    const motivoFinal = motivos.length > 0 
      ? `${motivos.join(", ")}${rejectionReason ? `. ${rejectionReason}` : ""}`
      : rejectionReason || "Não especificado";

    rejeitarMutation.mutate({ cadastro: rejectionModal, motivo: motivoFinal });
  };

  // Mutation para enviar notificação
  const notificarMutation = useMutation({
    mutationFn: async () => {
      const usuario = notificationModal;
      
      const tipoMensagens = {
        CADASTRO: "Pendência no Cadastro",
        DOCUMENTO: "Documento Inválido",
        ANUNCIO: "Problema no Anúncio",
        VAGA: "Problema na Vaga",
        PRODUTO: "Problema no Produto",
        OUTRO: "Notificação"
      };

      const destinatarioTipo = usuario.tipo === "PROFISSIONAL" 
        ? usuario.tipo_profissional 
        : usuario.tipo === "CLINICA"
        ? "CLINICA"
        : usuario.tipo;

      const canais = [];
      if (notificationData.enviarApp) canais.push("PUSH");
      if (notificationData.enviarWhatsApp) canais.push("WHATSAPP");

      await base44.entities.Notification.create({
        destinatario_id: usuario.user_id,
        destinatario_tipo: destinatarioTipo,
        tipo: "PERFIL_INCOMPLETO",
        titulo: tipoMensagens[notificationData.tipo],
        mensagem: notificationData.mensagem,
        canais_enviados: canais
      });

      // Se WhatsApp marcado, abrir link
      if (notificationData.enviarWhatsApp && usuario.whatsapp) {
        const mensagemWpp = `🔔 *DOUTORIZZE - ${tipoMensagens[notificationData.tipo]}*\n\n${notificationData.mensagem}`;
        window.open(`https://wa.me/55${usuario.whatsapp}?text=${encodeURIComponent(mensagemWpp)}`, "_blank");
      }
    },
    onSuccess: () => {
      toast.success("✅ Notificação enviada com sucesso!");
      setNotificationModal(null);
      setNotificationData({
        tipo: "CADASTRO",
        mensagem: "",
        enviarApp: true,
        enviarWhatsApp: false
      });
    },
    onError: (error) => {
      toast.error("❌ Erro ao enviar notificação: " + error.message);
    }
  });

  const getBorderColor = (status) => {
    if (status === "EM_ANALISE") return "border-yellow-400";
    if (status === "APROVADO") return "border-green-500";
    if (status === "REPROVADO") return "border-red-500";
    return "border-gray-200";
  };

  const getStatusBadge = (status) => {
    if (status === "EM_ANALISE") {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
          🟡 Pendente
        </span>
      );
    }
    if (status === "APROVADO") {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
          🟢 Aprovado
        </span>
      );
    }
    if (status === "REPROVADO") {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
          🔴 Rejeitado
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Admin */}
      <div className="bg-white shadow-md py-4 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center">
            <Shield className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </div>
          <span className="font-black text-base md:text-xl">NEW JOBS</span>
        </div>
        <div className="bg-red-100 text-red-700 px-2 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-1 md:gap-2">
          🔴 <span className="hidden sm:inline">Painel</span> Admin
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 p-3 md:p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setFilterStatus("EM_ANALISE")}
          className="bg-white rounded-2xl p-4 md:p-5 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="text-3xl md:text-4xl font-black text-gray-900">{stats.pendente}</div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          </div>
          <div className="text-xs md:text-sm text-gray-500">Pendentes</div>
          <div className="text-xl md:text-2xl mt-1">🟡</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setFilterStatus("APROVADO")}
          className="bg-white rounded-2xl p-4 md:p-5 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="text-3xl md:text-4xl font-black text-gray-900">{stats.aprovado}</div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-xs md:text-sm text-gray-500">Aprovados</div>
          <div className="text-xl md:text-2xl mt-1">🟢</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setFilterStatus("REPROVADO")}
          className="bg-white rounded-2xl p-4 md:p-5 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="text-3xl md:text-4xl font-black text-gray-900">{stats.rejeitado}</div>
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
          </div>
          <div className="text-xs md:text-sm text-gray-500">Rejeitados</div>
          <div className="text-xl md:text-2xl mt-1">🔴</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => setFilterStatus("TODOS")}
          className="bg-white rounded-2xl p-4 md:p-5 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="text-3xl md:text-4xl font-black text-gray-900">{stats.total}</div>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          </div>
          <div className="text-xs md:text-sm text-gray-500">Total</div>
          <div className="text-xl md:text-2xl mt-1">🔵</div>
        </motion.div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white shadow-md p-3 md:p-4 flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 md:pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none text-sm md:text-base"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 md:px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 bg-white outline-none text-sm md:text-base"
          >
            <option value="TODOS">Tipos</option>
            <option value="PROFISSIONAL">Profissionais</option>
            <option value="CLINICA">Clínicas</option>
            <option value="FORNECEDOR">Fornecedores</option>
            <option value="HOSPITAL">Hospitais</option>
            <option value="INSTITUICAO">Instituições</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 md:px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 bg-white outline-none text-sm md:text-base"
          >
            <option value="TODOS">Status</option>
            <option value="EM_ANALISE">Pendentes</option>
            <option value="APROVADO">Aprovados</option>
            <option value="REPROVADO">Rejeitados</option>
          </select>
        </div>
      </div>

      {/* Lista de Cadastros */}
      <div className="p-3 md:p-4 space-y-3 md:space-y-4">
        <AnimatePresence>
          {paginatedCadastros.length === 0 ? (
            <div className="text-center py-12 md:py-20 bg-white rounded-2xl">
              <AlertTriangle className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold text-sm md:text-base">Nenhum cadastro encontrado</p>
            </div>
          ) : (
            paginatedCadastros.map((cadastro, index) => (
              <motion.div
                key={cadastro.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl p-4 md:p-5 shadow-md hover:shadow-lg transition-all border-l-4 ${getBorderColor(cadastro.status_cadastro)}`}
              >
                <div className="flex flex-col gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gray-200 flex items-center justify-center text-xl md:text-2xl overflow-hidden flex-shrink-0">
                    {cadastro.logo_url ? (
                      <img src={cadastro.logo_url} alt={cadastro.nome} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        {cadastro.tipo === "PROFISSIONAL" && "👤"}
                        {cadastro.tipo === "CLINICA" && "🏥"}
                        {cadastro.tipo === "FORNECEDOR" && <Package className="w-8 h-8 text-purple-500" />}
                        {cadastro.tipo === "HOSPITAL" && <Hospital className="w-8 h-8 text-blue-500" />}
                        {cadastro.tipo === "INSTITUICAO" && <GraduationCap className="w-8 h-8 text-indigo-500" />}
                      </>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-base md:text-lg text-gray-900 break-words">{cadastro.nome}</h3>
                      {cadastro.tipo === "FORNECEDOR" && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                          Fornecedor
                        </span>
                      )}
                      {cadastro.tipo === "HOSPITAL" && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                          Hospital
                        </span>
                      )}
                      {cadastro.tipo === "INSTITUICAO" && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">
                          Instituição
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs md:text-sm truncate">{cadastro.registro}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                      <p className="text-gray-500 text-xs md:text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="truncate">{cadastro.localizacao}</span>
                      </p>
                      <p className="text-gray-400 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(cadastro.created_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center">
                    {getStatusBadge(cadastro.status_cadastro)}
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setDetailsModal(cadastro)}
                      className="px-3 md:px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 flex items-center gap-1 text-sm md:text-base"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Ver</span>
                    </button>
                    <button
                      onClick={() => setNotificationModal(cadastro)}
                      className="px-3 md:px-4 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 flex items-center gap-1 md:gap-2 text-sm md:text-base"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Notificar</span>
                    </button>
                    {cadastro.status_cadastro === "EM_ANALISE" && (
                      <>
                        <button
                          onClick={() => aprovarMutation.mutate(cadastro)}
                          disabled={aprovarMutation.isPending}
                          className="px-3 md:px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center gap-1 disabled:opacity-50 text-sm md:text-base"
                        >
                          <Check className="w-4 h-4" />
                          <span className="hidden sm:inline">Aprovar</span>
                        </button>
                        <button
                          onClick={() => setRejectionModal(cadastro)}
                          className="px-3 md:px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center gap-1 text-sm md:text-base"
                        >
                          <X className="w-4 h-4" />
                          <span className="hidden sm:inline">Rejeitar</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 md:gap-2 py-4 md:py-6 px-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 md:px-4 md:py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${
                  currentPage === pageNum
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                    : "bg-white text-gray-600 border-2 border-gray-200 hover:border-yellow-400"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 md:px-4 md:py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      )}

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {detailsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailsModal(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold">Detalhes do Cadastro</h2>
                <button
                  onClick={() => setDetailsModal(null)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-gray-100 flex items-center justify-center flex-shrink-0"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              {/* Conteúdo */}
              <div className="p-4 md:p-6 space-y-4">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl mx-auto mb-4 md:mb-6 bg-gray-200 flex items-center justify-center text-5xl md:text-6xl overflow-hidden">
                  {detailsModal.logo_url ? (
                    <img src={detailsModal.logo_url} alt={detailsModal.nome} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      {detailsModal.tipo === "PROFISSIONAL" && "👤"}
                      {detailsModal.tipo === "CLINICA" && "🏥"}
                      {detailsModal.tipo === "FORNECEDOR" && <Package className="w-16 h-16 text-purple-500" />}
                      {detailsModal.tipo === "HOSPITAL" && <Hospital className="w-16 h-16 text-blue-500" />}
                      {detailsModal.tipo === "INSTITUICAO" && <GraduationCap className="w-16 h-16 text-indigo-500" />}
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Nome</p>
                    <p className="font-bold text-sm md:text-base text-gray-900 break-words">{detailsModal.nome}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Tipo</p>
                    <p className="font-bold text-sm md:text-base text-gray-900">{detailsModal.tipo}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Registro</p>
                    <p className="font-bold text-sm md:text-base text-gray-900 break-all">{detailsModal.registro}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Status</p>
                    {getStatusBadge(detailsModal.status_cadastro)}
                  </div>
                  {detailsModal.whatsapp && (
                    <div>
                      <p className="text-xs md:text-sm text-gray-500 mb-1">WhatsApp</p>
                      <p className="font-bold text-sm md:text-base text-gray-900">{detailsModal.whatsapp}</p>
                    </div>
                  )}
                  {detailsModal.email && (
                    <div className="sm:col-span-2">
                      <p className="text-xs md:text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-bold text-sm md:text-base text-gray-900 break-all">{detailsModal.email}</p>
                    </div>
                  )}
                  {detailsModal.tipo === "FORNECEDOR" && detailsModal.tipo_produtos && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Produtos</p>
                      <div className="flex flex-wrap gap-2">
                        {detailsModal.tipo_produtos.map((produto, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                            {produto}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {detailsModal.tipo === "HOSPITAL" && detailsModal.porte && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Porte</p>
                      <p className="font-bold text-gray-900">{detailsModal.porte}</p>
                    </div>
                  )}
                  {detailsModal.tipo === "INSTITUICAO" && detailsModal.areas && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Áreas</p>
                      <div className="flex flex-wrap gap-2">
                        {detailsModal.areas.map((area, i) => (
                          <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {detailsModal.tipo === "INSTITUICAO" && detailsModal.modalidades && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Modalidades</p>
                      <div className="flex flex-wrap gap-2">
                        {detailsModal.modalidades.map((mod, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                            {mod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {detailsModal.documento_url && (
                    <div className="col-span-2">
                      <a
                        href={detailsModal.documento_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 border-2 border-blue-300 text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        Ver Documento
                      </a>
                    </div>
                  )}
                  {detailsModal.contrato_social_url && (
                    <div className="col-span-2">
                      <a
                        href={detailsModal.contrato_social_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 border-2 border-blue-300 text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        Ver Contrato Social
                      </a>
                    </div>
                  )}
                </div>

                {detailsModal.motivo_reprovacao && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <p className="text-sm font-bold text-red-900 mb-1">Motivo da Rejeição:</p>
                    <p className="text-sm text-red-700">{detailsModal.motivo_reprovacao}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {detailsModal.status_cadastro === "EM_ANALISE" && (
                <div className="p-4 md:p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button
                    onClick={() => aprovarMutation.mutate(detailsModal)}
                    disabled={aprovarMutation.isPending}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base"
                  >
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                    Aprovar
                  </button>
                  <button
                    onClick={() => {
                      setRejectionModal(detailsModal);
                      setDetailsModal(null);
                    }}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                    Rejeitar
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Notificação */}
      <AnimatePresence>
        {notificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotificationModal(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-black text-gray-900">Notificar Usuário</h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">Usuário: {notificationModal.nome}</p>
                </div>
                <button
                  onClick={() => setNotificationModal(null)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-gray-100 flex items-center justify-center flex-shrink-0"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              {/* Conteúdo */}
              <div className="p-4 md:p-6 space-y-4">
                {/* Tipo de Notificação */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Tipo de Notificação
                  </label>
                  <select
                    value={notificationData.tipo}
                    onChange={(e) => setNotificationData({ ...notificationData, tipo: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none"
                  >
                    <option value="CADASTRO">Pendência no Cadastro</option>
                    <option value="DOCUMENTO">Documento Inválido</option>
                    <option value="ANUNCIO">Problema no Anúncio</option>
                    <option value="VAGA">Problema na Vaga</option>
                    <option value="PRODUTO">Problema no Produto</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>

                {/* Mensagem */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    value={notificationData.mensagem}
                    onChange={(e) => setNotificationData({ ...notificationData, mensagem: e.target.value })}
                    placeholder="Descreva o problema ou pendência..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none resize-none"
                  />
                </div>

                {/* Opções de Envio */}
                <div className="p-4 bg-blue-50 rounded-xl space-y-3">
                  <p className="text-sm font-bold text-gray-900">Canais de Envio:</p>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationData.enviarApp}
                        onChange={(e) => setNotificationData({ ...notificationData, enviarApp: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 font-medium">📱 Notificação no App</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationData.enviarWhatsApp}
                        onChange={(e) => setNotificationData({ ...notificationData, enviarWhatsApp: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-green-500 focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-gray-700 font-medium">💬 WhatsApp Doutorizze</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 md:p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setNotificationModal(null)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 text-sm md:text-base"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => notificarMutation.mutate()}
                  disabled={notificarMutation.isPending || !notificationData.mensagem}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  {notificarMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 h-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                      <span className="hidden sm:inline">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="hidden sm:inline">Enviar</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Rejeição */}
      <AnimatePresence>
        {rejectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRejectionModal(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-gray-100">
                <h2 className="text-lg md:text-xl font-bold text-red-600">Motivo da Rejeição</h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Selecione os motivos da rejeição</p>
              </div>

              {/* Conteúdo */}
              <div className="p-4 md:p-6 space-y-4">
                {/* Checkboxes */}
                {Object.keys(rejectionCheckboxes).map((key) => {
                  const labels = {
                    documento_ilegivel: "📄 Documento ilegível",
                    dados_incompletos: "⚠️ Dados incompletos",
                    registro_invalido: "❌ Registro profissional inválido",
                    foto_inadequada: "📸 Foto inadequada",
                    outro: "💬 Outro"
                  };
                  
                  return (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rejectionCheckboxes[key]}
                        onChange={(e) => setRejectionCheckboxes(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-red-500 focus:ring-2 focus:ring-red-500"
                      />
                      <span className="text-gray-700">{labels[key]}</span>
                    </label>
                  );
                })}

                {/* Textarea */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Observações Adicionais
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Descreva outros motivos..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 md:p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  onClick={() => setRejectionModal(null)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 text-sm md:text-base"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejeitarMutation.isPending}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl disabled:opacity-50 text-sm md:text-base"
                >
                  {rejeitarMutation.isPending ? "Rejeitando..." : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}