import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Calendar, MapPin, Users, Edit, Trash2, ChevronLeft } from "lucide-react";

export default function EventosInstituicao() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [instituicao, setInstituicao] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data_evento: "",
    horario_inicio: "",
    local: "",
    vagas_totais: "",
    inscricoes_abertas: true
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const instResults = await base44.entities.EducationInstitution.filter({ user_id: currentUser.id });
        setInstituicao(instResults[0] || null);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadData();
  }, []);

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ["eventos", instituicao?.id],
    queryFn: async () => {
      if (!instituicao) return [];
      // Usando Course como proxy para eventos por enquanto
      return await base44.entities.Course.filter({ institution_id: instituicao.id, tipo: "WORKSHOP" });
    },
    enabled: !!instituicao
  });

  const criarEventoMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Course.create({
        ...data,
        institution_id: instituicao.id,
        tipo: "WORKSHOP",
        area: instituicao.areas?.[0] || "MEDICINA",
        status: "ATIVO"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos"] });
      toast.success("Evento criado!");
      setModalAberto(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      data_evento: "",
      horario_inicio: "",
      local: "",
      vagas_totais: "",
      inscricoes_abertas: true
    });
    setEventoEditando(null);
  };

  const handleCriar = () => {
    if (!formData.titulo || !formData.data_evento) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    criarEventoMutation.mutate({
      titulo: formData.titulo,
      descricao: formData.descricao,
      data_inicio: formData.data_evento,
      inscricoes_ate: formData.data_evento,
      especialidade: "Geral",
      carga_horaria: 4,
      duracao_meses: 0.1,
      modalidade: "PRESENCIAL",
      valor_total: 0,
      vagas_totais: parseInt(formData.vagas_totais) || 50,
      vagas_restantes: parseInt(formData.vagas_totais) || 50,
      cidade: instituicao?.cidade || "",
      uf: instituicao?.uf || "",
      imagem_principal_url: ""
    });
  };

  if (isLoading || !instituicao) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-6">
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Eventos e Workshops</h1>
            <p className="text-gray-600">Gerencie eventos da instituição</p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl"
          >
            <Plus className="w-5 h-5" />
            Criar Evento
          </button>
        </div>

        {eventos.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
            <div className="text-8xl mb-6">📅</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-4">Nenhum evento criado</h3>
            <button
              onClick={() => setModalAberto(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-2xl"
            >
              Criar Primeiro Evento
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {eventos.map((evento) => (
              <motion.div
                key={evento.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{evento.titulo}</h3>
                <p className="text-gray-600 mb-4">{evento.descricao}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(evento.data_inicio).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{evento.vagas_restantes} vagas</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal Criar */}
        {modalAberto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setModalAberto(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-black mb-6">Criar Novo Evento</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Título *</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Descrição *</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Data do Evento *</label>
                  <input
                    type="date"
                    value={formData.data_evento}
                    onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Vagas</label>
                  <input
                    type="number"
                    value={formData.vagas_totais}
                    onChange={(e) => setFormData({ ...formData, vagas_totais: e.target.value })}
                    placeholder="50"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setModalAberto(false); resetForm(); }}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCriar}
                  disabled={criarEventoMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {criarEventoMutation.isPending ? "Criando..." : "Criar Evento"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}