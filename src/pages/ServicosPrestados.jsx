import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Beaker, DollarSign, Edit, Trash2, ChevronLeft } from "lucide-react";

export default function ServicosPrestados() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [laboratorio, setLaboratorio] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const [formData, setFormData] = useState({
    servico: "",
    descricao: "",
    preco_estimado: "",
    prazo_dias: ""
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const labResults = await base44.entities.Laboratorio.filter({ user_id: currentUser.id });
        setLaboratorio(labResults[0] || null);
      } catch (error) {
        // Erro silencioso
      }
    };
    loadData();
  }, []);

  const servicosMock = laboratorio?.catalogo_servicos || [];

  const adicionarServicoMutation = useMutation({
    mutationFn: async (novoServico) => {
      const servicosAtualizados = [...servicosMock, novoServico];
      return await base44.entities.Laboratorio.update(laboratorio.id, {
        catalogo_servicos: servicosAtualizados
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laboratorio"] });
      toast.success("Serviço adicionado!");
      setModalAberto(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      servico: "",
      descricao: "",
      preco_estimado: "",
      prazo_dias: ""
    });
  };

  const handleAdicionar = () => {
    if (!formData.servico) {
      toast.error("Preencha o nome do serviço");
      return;
    }

    adicionarServicoMutation.mutate({
      servico: formData.servico,
      descricao: formData.descricao,
      preco_estimado: formData.preco_estimado,
      prazo_dias: formData.prazo_dias
    });
  };

  if (!laboratorio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-6">
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Serviços Prestados</h1>
            <p className="text-gray-600">Catálogo de serviços do laboratório</p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl"
          >
            <Plus className="w-5 h-5" />
            Adicionar Serviço
          </button>
        </div>

        {servicosMock.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
            <div className="text-8xl mb-6">🧪</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-4">Nenhum serviço cadastrado</h3>
            <button
              onClick={() => setModalAberto(true)}
              className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-2xl"
            >
              Adicionar Primeiro Serviço
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {servicosMock.map((servico, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-lg p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Beaker className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{servico.servico}</h3>
                    <p className="text-sm text-gray-600 mb-3">{servico.descricao}</p>
                    <div className="flex items-center gap-4 text-sm">
                      {servico.preco_estimado && (
                        <div className="flex items-center gap-1 text-green-600 font-bold">
                          <DollarSign className="w-4 h-4" />
                          {servico.preco_estimado}
                        </div>
                      )}
                      {servico.prazo_dias && (
                        <span className="text-gray-500">Prazo: {servico.prazo_dias}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal Adicionar */}
        {modalAberto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setModalAberto(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-black mb-6">Adicionar Serviço</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Nome do Serviço *</label>
                  <input
                    type="text"
                    value={formData.servico}
                    onChange={(e) => setFormData({ ...formData, servico: e.target.value })}
                    placeholder="Ex: Prótese Dentária"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Descrição</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Preço Estimado</label>
                  <input
                    type="text"
                    value={formData.preco_estimado}
                    onChange={(e) => setFormData({ ...formData, preco_estimado: e.target.value })}
                    placeholder="Ex: R$ 500 - R$ 800"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Prazo</label>
                  <input
                    type="text"
                    value={formData.prazo_dias}
                    onChange={(e) => setFormData({ ...formData, prazo_dias: e.target.value })}
                    placeholder="Ex: 5-7 dias úteis"
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
                  onClick={handleAdicionar}
                  disabled={adicionarServicoMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {adicionarServicoMutation.isPending ? "Adicionando..." : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}