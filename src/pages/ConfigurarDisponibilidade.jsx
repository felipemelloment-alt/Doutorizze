import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Calendar,
  Clock,
  Save,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Trash2
} from "lucide-react";

export default function ConfigurarDisponibilidade() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);

  const [disponibilidade, setDisponibilidade] = useState({
    segunda: { ativo: false, inicio: "08:00", fim: "18:00" },
    terca: { ativo: false, inicio: "08:00", fim: "18:00" },
    quarta: { ativo: false, inicio: "08:00", fim: "18:00" },
    quinta: { ativo: false, inicio: "08:00", fim: "18:00" },
    sexta: { ativo: false, inicio: "08:00", fim: "18:00" },
    sabado: { ativo: false, inicio: "08:00", fim: "18:00" },
    domingo: { ativo: false, inicio: "08:00", fim: "18:00" }
  });

  const [bloqueios, setBloqueios] = useState([]);
  const [showModalBloqueio, setShowModalBloqueio] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const profs = await base44.entities.Professional.filter({ user_id: currentUser.id });
        if (profs[0]) {
          setProfessional(profs[0]);
          
          // Carregar disponibilidade salva
          if (profs[0].horarios_disponibilidade) {
            setDisponibilidade(profs[0].horarios_disponibilidade);
          }
        }
      } catch (error) {
        toast.error("Erro ao carregar dados");
      }
    };
    loadData();
  }, []);

  // Buscar bloqueios existentes
  const { data: bloqueiosExistentes = [] } = useQuery({
    queryKey: ["bloqueios", professional?.id],
    queryFn: async () => {
      if (!professional?.id) return [];
      return await base44.entities.BloqueioAgenda.filter({ professional_id: professional.id });
    },
    enabled: !!professional?.id
  });

  useEffect(() => {
    if (bloqueiosExistentes.length > 0) {
      setBloqueios(bloqueiosExistentes);
    }
  }, [bloqueiosExistentes]);

  // Mutation para salvar
  const salvarMutation = useMutation({
    mutationFn: async () => {
      if (!professional) return;

      await base44.entities.Professional.update(professional.id, {
        horarios_disponibilidade: disponibilidade
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional"] });
      toast.success("✅ Disponibilidade salva com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar: " + error.message);
    }
  });

  // Mutation para criar bloqueio
  const criarBloqueioMutation = useMutation({
    mutationFn: async (bloqueioData) => {
      return await base44.entities.BloqueioAgenda.create({
        professional_id: professional.id,
        ...bloqueioData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloqueios"] });
      toast.success("Bloqueio adicionado!");
      setShowModalBloqueio(false);
    },
    onError: (error) => {
      toast.error("Erro ao criar bloqueio: " + error.message);
    }
  });

  // Mutation para deletar bloqueio
  const deletarBloqueioMutation = useMutation({
    mutationFn: async (bloqueioId) => {
      return await base44.entities.BloqueioAgenda.delete(bloqueioId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloqueios"] });
      toast.success("Bloqueio removido!");
    }
  });

  const handleToggleDia = (dia) => {
    setDisponibilidade(prev => ({
      ...prev,
      [dia]: { ...prev[dia], ativo: !prev[dia].ativo }
    }));
  };

  const handleHorarioChange = (dia, campo, valor) => {
    setDisponibilidade(prev => ({
      ...prev,
      [dia]: { ...prev[dia], [campo]: valor }
    }));
  };

  const handleCopiarParaTodos = (dia) => {
    const horarioDia = disponibilidade[dia];
    setDisponibilidade(prev => {
      const novaDispo = {};
      Object.keys(prev).forEach(d => {
        novaDispo[d] = {
          ...prev[d],
          inicio: horarioDia.inicio,
          fim: horarioDia.fim
        };
      });
      return novaDispo;
    });
    toast.success("Horários copiados para todos os dias!");
  };

  const diasSemana = [
    { key: "segunda", label: "Segunda" },
    { key: "terca", label: "Terça" },
    { key: "quarta", label: "Quarta" },
    { key: "quinta", label: "Quinta" },
    { key: "sexta", label: "Sexta" },
    { key: "sabado", label: "Sábado" },
    { key: "domingo", label: "Domingo" }
  ];

  const diasAtivos = diasSemana.filter(d => disponibilidade[d.key].ativo).length;

  if (!professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-32">
      <div className="bg-white border-b-2 border-gray-100 p-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Configurar Disponibilidade</h1>
                <p className="text-sm text-gray-600">Defina sua agenda semanal</p>
              </div>
            </div>
            
            <div className="px-4 py-2 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600">Dias ativos:</p>
              <p className="text-2xl font-black text-blue-600">{diasAtivos}/7</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* DISPONIBILIDADE SEMANAL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-black text-gray-900">Disponibilidade Semanal</h2>
            </div>
          </div>

          <div className="space-y-4">
            {diasSemana.map((dia) => {
              const diaConfig = disponibilidade[dia.key];
              
              return (
                <div
                  key={dia.key}
                  className={`border-2 rounded-2xl p-5 transition-all ${
                    diaConfig.ativo
                      ? "border-purple-300 bg-purple-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleDia(dia.key)}
                        className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                          diaConfig.ativo
                            ? "bg-purple-500 border-purple-500"
                            : "border-gray-300"
                        }`}
                      >
                        {diaConfig.ativo && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                      <h3 className="text-lg font-bold text-gray-900">{dia.label}</h3>
                    </div>

                    {diaConfig.ativo && (
                      <button
                        onClick={() => handleCopiarParaTodos(dia.key)}
                        className="text-xs text-purple-600 hover:text-purple-700 font-bold"
                      >
                        Copiar para todos
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {diaConfig.ativo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Início
                          </label>
                          <input
                            type="time"
                            value={diaConfig.inicio}
                            onChange={(e) => handleHorarioChange(dia.key, "inicio", e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Fim
                          </label>
                          <input
                            type="time"
                            value={diaConfig.fim}
                            onChange={(e) => handleHorarioChange(dia.key, "fim", e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none transition-all"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">💡 Dica:</p>
                <p>
                  Configure os dias e horários em que você está disponível para substituições.
                  Apenas vagas compatíveis com sua agenda serão exibidas.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BLOQUEIOS ESPECÍFICOS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <X className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-black text-gray-900">Bloqueios Específicos</h2>
            </div>
            <button
              onClick={() => setShowModalBloqueio(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>

          {bloqueios.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum bloqueio configurado</p>
              <p className="text-sm text-gray-400 mt-1">
                Bloqueie datas específicas em que não poderá atender
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bloqueios.map((bloqueio) => (
                <div
                  key={bloqueio.id}
                  className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-red-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                      <X className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {new Date(bloqueio.data_inicio).toLocaleDateString('pt-BR')}
                        {bloqueio.data_fim && ` - ${new Date(bloqueio.data_fim).toLocaleDateString('pt-BR')}`}
                      </p>
                      {bloqueio.motivo && (
                        <p className="text-sm text-gray-600">{bloqueio.motivo}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deletarBloqueioMutation.mutate(bloqueio.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* RESUMO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl shadow-xl p-6 text-white"
        >
          <h3 className="text-lg font-black mb-4">Resumo da Disponibilidade</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 backdrop-blur rounded-xl p-4">
              <p className="text-white/80 text-sm mb-1">Dias Disponíveis</p>
              <p className="text-3xl font-black">{diasAtivos}</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-4">
              <p className="text-white/80 text-sm mb-1">Bloqueios Ativos</p>
              <p className="text-3xl font-black">{bloqueios.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* BOTÃO SALVAR FIXO */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-40">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => salvarMutation.mutate()}
            disabled={salvarMutation.isPending}
            className="w-full py-5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {salvarMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Salvar Disponibilidade
              </>
            )}
          </button>
        </div>
      </div>

      {/* MODAL CRIAR BLOQUEIO */}
      <AnimatePresence>
        {showModalBloqueio && (
          <ModalCriarBloqueio
            onClose={() => setShowModalBloqueio(false)}
            onSalvar={(data) => criarBloqueioMutation.mutate(data)}
            saving={criarBloqueioMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Modal para criar bloqueio
function ModalCriarBloqueio({ onClose, onSalvar, saving }) {
  const [bloqueio, setBloqueio] = useState({
    data_inicio: "",
    data_fim: "",
    horario_inicio: "",
    horario_fim: "",
    motivo: "",
    bloqueio_dia_inteiro: true
  });

  const handleSubmit = () => {
    if (!bloqueio.data_inicio) {
      toast.error("Informe a data de início");
      return;
    }
    if (!bloqueio.bloqueio_dia_inteiro && (!bloqueio.horario_inicio || !bloqueio.horario_fim)) {
      toast.error("Informe os horários do bloqueio");
      return;
    }
    onSalvar(bloqueio);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-gray-900">Novo Bloqueio</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Data Início *
            </label>
            <input
              type="date"
              value={bloqueio.data_inicio}
              onChange={(e) => setBloqueio({ ...bloqueio, data_inicio: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Data Fim (opcional)
            </label>
            <input
              type="date"
              value={bloqueio.data_fim}
              onChange={(e) => setBloqueio({ ...bloqueio, data_fim: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <button
              onClick={() => setBloqueio({ ...bloqueio, bloqueio_dia_inteiro: !bloqueio.bloqueio_dia_inteiro })}
              className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                bloqueio.bloqueio_dia_inteiro
                  ? "bg-purple-500 border-purple-500"
                  : "border-gray-300"
              }`}
            >
              {bloqueio.bloqueio_dia_inteiro && <CheckCircle2 className="w-4 h-4 text-white" />}
            </button>
            <label className="font-semibold text-gray-900 cursor-pointer">
              Bloquear dia inteiro
            </label>
          </div>

          {!bloqueio.bloqueio_dia_inteiro && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Horário Início
                </label>
                <input
                  type="time"
                  value={bloqueio.horario_inicio}
                  onChange={(e) => setBloqueio({ ...bloqueio, horario_inicio: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Horário Fim
                </label>
                <input
                  type="time"
                  value={bloqueio.horario_fim}
                  onChange={(e) => setBloqueio({ ...bloqueio, horario_fim: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none transition-all"
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Motivo (opcional)
            </label>
            <textarea
              value={bloqueio.motivo}
              onChange={(e) => setBloqueio({ ...bloqueio, motivo: e.target.value })}
              placeholder="Ex: Férias, viagem, evento..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none transition-all resize-none h-24"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Adicionar Bloqueio"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}