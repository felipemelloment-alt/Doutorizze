import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Check,
  X,
  Eye,
  Calendar,
  FileText,
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

export default function AdminAprovacoes() {
  const queryClient = useQueryClient();
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
        setIsAdmin(currentUser.role === "admin");
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Queries
  const { data: professionals = [] } = useQuery({
    queryKey: ["professionals", filterStatus],
    queryFn: async () => {
      const result = await base44.entities.Professional.filter(
        filterStatus === "TODOS" ? {} : { status_cadastro: filterStatus }
      );
      return result || [];
    },
    enabled: isAdmin && !loading,
    staleTime: 5 * 60 * 1000,
  });

  const { data: owners = [] } = useQuery({
    queryKey: ["companyOwners", filterStatus],
    queryFn: async () => {
      const result = await base44.entities.CompanyOwner.filter(
        filterStatus === "TODOS" ? {} : { status_cadastro: filterStatus }
      );
      return result || [];
    },
    enabled: isAdmin && !loading,
    staleTime: 5 * 60 * 1000,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers", filterStatus],
    queryFn: async () => {
      const result = await base44.entities.Supplier.filter(
        filterStatus === "TODOS" ? {} : { status_cadastro: filterStatus }
      );
      return result || [];
    },
    enabled: isAdmin && !loading,
    staleTime: 5 * 60 * 1000,
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ["hospitals", filterStatus],
    queryFn: async () => {
      const result = await base44.entities.Hospital.filter(
        filterStatus === "TODOS" ? {} : { status_cadastro: filterStatus }
      );
      return result || [];
    },
    enabled: isAdmin && !loading,
    staleTime: 5 * 60 * 1000,
  });

  const { data: institutions = [] } = useQuery({
    queryKey: ["institutions", filterStatus],
    queryFn: async () => {
      const result = await base44.entities.EducationInstitution.filter(
        filterStatus === "TODOS" ? {} : { status_cadastro: filterStatus }
      );
      return result || [];
    },
    enabled: isAdmin && !loading,
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const aprovarMutation = useMutation({
    mutationFn: async (cadastro) => {
      await base44.entities[cadastro.entity].update(cadastro.id, {
        status_cadastro: "APROVADO",
        approved_at: new Date().toISOString(),
        approved_by: user?.id,
        motivo_reprovacao: null
      });

      await base44.entities.Notification.create({
        user_id: cadastro.user_id,
        tipo: "CADASTRO_APROVADO",
        titulo: "🎉 Cadastro Aprovado!",
        mensagem: "Parabéns! Seu cadastro foi aprovado."
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      queryClient.invalidateQueries({ queryKey: ["companyOwners"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      toast.success("✅ Cadastro aprovado!");
      setDetailsModal(null);
    },
    onError: (error) => {
      toast.error("❌ Erro: " + error.message);
    }
  });

  const rejeitarMutation = useMutation({
    mutationFn: async ({ cadastro, motivo }) => {
      await base44.entities[cadastro.entity].update(cadastro.id, {
        status_cadastro: "REPROVADO",
        motivo_reprovacao: motivo
      });

      await base44.entities.Notification.create({
        user_id: cadastro.user_id,
        tipo: "CADASTRO_REJEITADO",
        titulo: "❌ Cadastro Reprovado",
        mensagem: `Motivo: ${motivo}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      queryClient.invalidateQueries({ queryKey: ["companyOwners"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      toast.success("Cadastro reprovado.");
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
      toast.error("❌ Erro: " + error.message);
    }
  });

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

      await base44.entities.Notification.create({
        user_id: usuario.user_id,
        tipo: "ALERTA",
        titulo: tipoMensagens[notificationData.tipo],
        mensagem: notificationData.mensagem
      });

      if (notificationData.enviarWhatsApp && usuario.whatsapp) {
        const msg = `🔔 *DOUTORIZZE*\n\n${notificationData.mensagem}`;
        window.open(`https://wa.me/55${usuario.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
      }
    },
    onSuccess: () => {
      toast.success("✅ Notificação enviada!");
      setNotificationModal(null);
      setNotificationData({ tipo: "CADASTRO", mensagem: "", enviarApp: true, enviarWhatsApp: false });
    },
    onError: (error) => {
      toast.error("❌ Erro: " + error.message);
    }
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  // Access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-900 mb-2">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">Esta página é exclusiva para administradores.</p>
          <button onClick={() => window.history.back()} className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Data processing
  const allCadastros = [
    ...professionals.map(p => ({ ...p, tipo: "PROFISSIONAL", entity: "Professional", nome: p.nome_completo, registro: `${p.tipo_profissional === "DENTISTA" ? "CRO" : "CRM"} ${p.registro_conselho}/${p.uf_conselho}`, localizacao: p.cidades_atendimento?.[0] || "N/A" })),
    ...owners.map(o => ({ ...o, tipo: "CLINICA", entity: "CompanyOwner", nome: o.nome_completo, registro: `CPF ${o.cpf}`, localizacao: "Responsável" })),
    ...suppliers.map(s => ({ ...s, tipo: "FORNECEDOR", entity: "Supplier", nome: s.nome_fantasia, registro: `CNPJ ${s.cnpj}`, localizacao: `${s.cidade} - ${s.uf}` })),
    ...hospitals.map(h => ({ ...h, tipo: "HOSPITAL", entity: "Hospital", nome: h.nome_fantasia, registro: h.tipo_instituicao, localizacao: `${h.cidade} - ${h.uf}` })),
    ...institutions.map(i => ({ ...i, tipo: "INSTITUICAO", entity: "EducationInstitution", nome: i.nome_fantasia, registro: i.tipo_instituicao, localizacao: `${i.cidade} - ${i.uf}` }))
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const filteredCadastros = allCadastros.filter(c => {
    const matchSearch = c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || c.registro?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === "TODOS" || c.tipo === filterType;
    return matchSearch && matchType;
  });

  const stats = {
    pendente: allCadastros.filter(c => c.status_cadastro === "EM_ANALISE").length,
    aprovado: allCadastros.filter(c => c.status_cadastro === "APROVADO").length,
    rejeitado: allCadastros.filter(c => c.status_cadastro === "REPROVADO").length,
    total: allCadastros.length
  };

  const totalPages = Math.ceil(filteredCadastros.length / itemsPerPage);
  const paginatedCadastros = filteredCadastros.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleReject = () => {
    const motivos = Object.entries(rejectionCheckboxes).filter(([_, v]) => v).map(([k]) => ({
      documento_ilegivel: "Documento ilegível",
      dados_incompletos: "Dados incompletos",
      registro_invalido: "Registro inválido",
      foto_inadequada: "Foto inadequada",
      outro: "Outro"
    }[k]));
    const motivoFinal = motivos.length > 0 ? `${motivos.join(", ")}${rejectionReason ? `. ${rejectionReason}` : ""}` : rejectionReason || "Não especificado";
    rejeitarMutation.mutate({ cadastro: rejectionModal, motivo: motivoFinal });
  };

  const getBorderColor = (status) => status === "EM_ANALISE" ? "border-yellow-400" : status === "APROVADO" ? "border-green-500" : status === "REPROVADO" ? "border-red-500" : "border-gray-200";

  const getStatusBadge = (status) => {
    if (status === "EM_ANALISE") return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">🟡 Pendente</span>;
    if (status === "APROVADO") return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">🟢 Aprovado</span>;
    if (status === "REPROVADO") return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">🔴 Rejeitado</span>;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl">DOUTORIZZE</span>
        </div>
        <div className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-bold">🔴 Admin</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
        {[{ label: "Pendentes", value: stats.pendente, color: "yellow", status: "EM_ANALISE" },
          { label: "Aprovados", value: stats.aprovado, color: "green", status: "APROVADO" },
          { label: "Rejeitados", value: stats.rejeitado, color: "red", status: "REPROVADO" },
          { label: "Total", value: stats.total, color: "blue", status: "TODOS" }
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            onClick={() => setFilterStatus(stat.status)}
            className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <div className="text-4xl font-black text-gray-900">{stat.value}</div>
              <div className={`w-3 h-3 rounded-full bg-${stat.color}-500`}></div>
            </div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white shadow-md p-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white outline-none">
            <option value="TODOS">Tipos</option>
            <option value="PROFISSIONAL">Profissionais</option>
            <option value="CLINICA">Clínicas</option>
            <option value="FORNECEDOR">Fornecedores</option>
            <option value="HOSPITAL">Hospitais</option>
            <option value="INSTITUICAO">Instituições</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white outline-none">
            <option value="TODOS">Status</option>
            <option value="EM_ANALISE">Pendentes</option>
            <option value="APROVADO">Aprovados</option>
            <option value="REPROVADO">Rejeitados</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-4">
        <AnimatePresence>
          {paginatedCadastros.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold">Nenhum cadastro encontrado</p>
            </div>
          ) : (
            paginatedCadastros.map((cadastro, index) => (
              <motion.div key={cadastro.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl p-5 shadow-md border-l-4 ${getBorderColor(cadastro.status_cadastro)}`}>
                <div className="flex flex-col gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center text-2xl">
                    {cadastro.tipo === "PROFISSIONAL" && "👤"}
                    {cadastro.tipo === "CLINICA" && "🏥"}
                    {cadastro.tipo === "FORNECEDOR" && <Package className="w-8 h-8 text-purple-500" />}
                    {cadastro.tipo === "HOSPITAL" && <Hospital className="w-8 h-8 text-blue-500" />}
                    {cadastro.tipo === "INSTITUICAO" && <GraduationCap className="w-8 h-8 text-indigo-500" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{cadastro.nome}</h3>
                    <p className="text-gray-600 text-sm">{cadastro.registro}</p>
                    <div className="flex items-center gap-4 mt-1 text-gray-500 text-sm">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{cadastro.localizacao}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(cadastro.created_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  </div>
                  <div>{getStatusBadge(cadastro.status_cadastro)}</div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setDetailsModal(cadastro)} className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 flex items-center gap-1">
                      <Eye className="w-4 h-4" /> Ver
                    </button>
                    <button onClick={() => setNotificationModal(cadastro)} className="px-4 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" /> Notificar
                    </button>
                    {cadastro.status_cadastro === "EM_ANALISE" && (
                      <>
                        <button onClick={() => aprovarMutation.mutate(cadastro)} disabled={aprovarMutation.isPending}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center gap-1 disabled:opacity-50">
                          <Check className="w-4 h-4" /> Aprovar
                        </button>
                        <button onClick={() => setRejectionModal(cadastro)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center gap-1">
                          <X className="w-4 h-4" /> Rejeitar
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-6">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="p-2 bg-white border-2 border-gray-200 rounded-xl disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
            <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-full font-bold ${currentPage === i + 1 ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" : "bg-white border-2 border-gray-200"}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="p-2 bg-white border-2 border-gray-200 rounded-xl disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {detailsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailsModal(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">Detalhes do Cadastro</h2>
                <button onClick={() => setDetailsModal(null)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-gray-500">Nome</p><p className="font-bold">{detailsModal.nome}</p></div>
                  <div><p className="text-sm text-gray-500">Tipo</p><p className="font-bold">{detailsModal.tipo}</p></div>
                  <div><p className="text-sm text-gray-500">Registro</p><p className="font-bold">{detailsModal.registro}</p></div>
                  <div><p className="text-sm text-gray-500">Status</p>{getStatusBadge(detailsModal.status_cadastro)}</div>
                </div>
                {detailsModal.documento_url && (
                  <a href={detailsModal.documento_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border-2 border-blue-300 text-blue-700 font-semibold rounded-xl hover:bg-blue-50">
                    <FileText className="w-4 h-4" /> Ver Documento
                  </a>
                )}
              </div>
              {detailsModal.status_cadastro === "EM_ANALISE" && (
                <div className="p-6 border-t flex gap-4">
                  <button onClick={() => aprovarMutation.mutate(detailsModal)} disabled={aprovarMutation.isPending}
                    className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl disabled:opacity-50"><Check className="w-5 h-5 inline mr-2" />Aprovar</button>
                  <button onClick={() => { setRejectionModal(detailsModal); setDetailsModal(null); }}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl"><X className="w-5 h-5 inline mr-2" />Rejeitar</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Modal */}
      <AnimatePresence>
        {notificationModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNotificationModal(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
              <div className="p-6 border-b flex items-center justify-between">
                <div><h3 className="text-xl font-black">Notificar Usuário</h3><p className="text-sm text-gray-500">{notificationModal.nome}</p></div>
                <button onClick={() => setNotificationModal(null)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Tipo</label>
                  <select value={notificationData.tipo} onChange={(e) => setNotificationData({ ...notificationData, tipo: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl">
                    <option value="CADASTRO">Pendência no Cadastro</option>
                    <option value="DOCUMENTO">Documento Inválido</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Mensagem</label>
                  <textarea value={notificationData.mensagem} onChange={(e) => setNotificationData({ ...notificationData, mensagem: e.target.value })}
                    placeholder="Descreva o problema..." rows={4} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl resize-none" />
                </div>
                <div className="p-4 bg-blue-50 rounded-xl space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={notificationData.enviarApp} onChange={(e) => setNotificationData({ ...notificationData, enviarApp: e.target.checked })} className="w-5 h-5" />
                    <span>📱 Notificação no App</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={notificationData.enviarWhatsApp} onChange={(e) => setNotificationData({ ...notificationData, enviarWhatsApp: e.target.checked })} className="w-5 h-5" />
                    <span>💬 WhatsApp</span>
                  </label>
                </div>
              </div>
              <div className="p-6 border-t flex gap-3">
                <button onClick={() => setNotificationModal(null)} className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl">Cancelar</button>
                <button onClick={() => notificarMutation.mutate()} disabled={notificarMutation.isPending || !notificationData.mensagem}
                  className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl disabled:opacity-50">
                  {notificarMutation.isPending ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectionModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRejectionModal(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-red-600">Motivo da Rejeição</h2>
              </div>
              <div className="p-6 space-y-4">
                {Object.keys(rejectionCheckboxes).map((key) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={rejectionCheckboxes[key]}
                      onChange={(e) => setRejectionCheckboxes(prev => ({ ...prev, [key]: e.target.checked }))} className="w-5 h-5" />
                    <span>{{ documento_ilegivel: "📄 Documento ilegível", dados_incompletos: "⚠️ Dados incompletos", registro_invalido: "❌ Registro inválido", foto_inadequada: "📸 Foto inadequada", outro: "💬 Outro" }[key]}</span>
                  </label>
                ))}
                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Observações adicionais..." rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl resize-none" />
              </div>
              <div className="p-6 border-t flex gap-4">
                <button onClick={() => setRejectionModal(null)} className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl">Cancelar</button>
                <button onClick={handleReject} disabled={rejeitarMutation.isPending}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl disabled:opacity-50">
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