import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { confirmarSubstituicao } from "@/components/api/substituicao";

export default function ConfirmarSubstituicao() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const substituicaoId = searchParams.get("id") || window.location.pathname.split("/").pop();
  const codigo = searchParams.get("codigo");

  const [substituicao, setSubstituicao] = useState(null);
  const [profissional, setProfissional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decisao, setDecisao] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const sub = await base44.entities.SubstituicaoUrgente.get(substituicaoId);
        setSubstituicao(sub);

        if (sub.profissional_escolhido_id) {
          const prof = await base44.entities.Professional.get(sub.profissional_escolhido_id);
          setProfissional(prof);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar substituição");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [substituicaoId]);

  const confirmarMutation = useMutation({
    mutationFn: async ({ aprovado, motivo }) => {
      return await confirmarSubstituicao(substituicaoId, codigo, aprovado, motivo);
    },
    onSuccess: () => {
      toast.success(decisao === "aprovado" ? "Substituição confirmada!" : "Substituição rejeitada");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao processar confirmação");
    }
  });

  const handleConfirmar = (aprovado) => {
    setDecisao(aprovado ? "aprovado" : "rejeitado");
  };

  const handleSubmit = () => {
    if (decisao === "rejeitado" && !motivoRejeicao.trim()) {
      toast.error("Por favor, informe o motivo da rejeição");
      return;
    }

    confirmarMutation.mutate({
      aprovado: decisao === "aprovado",
      motivo: decisao === "rejeitado" ? motivoRejeicao : null
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  if (!substituicao || !profissional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-8xl mb-6 opacity-50">❌</div>
          <h3 className="text-2xl font-bold text-gray-400">Link inválido ou expirado</h3>
        </div>
      </div>
    );
  }

  if (confirmarMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 ${
            decisao === "aprovado" ? "bg-green-100" : "bg-red-100"
          }`}>
            {decisao === "aprovado" ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <XCircle className="w-12 h-12 text-red-600" />
            )}
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            {decisao === "aprovado" ? "Substituição Confirmada!" : "Substituição Rejeitada"}
          </h2>
          <p className="text-gray-600 mb-6">
            {decisao === "aprovado" 
              ? "O profissional foi notificado e a substituição está confirmada."
              : "O profissional foi notificado sobre a rejeição."}
          </p>
        </motion.div>
      </div>
    );
  }

  if (decisao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${
            decisao === "aprovado" ? "bg-green-100" : "bg-red-100"
          }`}>
            {decisao === "aprovado" ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4 text-center">
            {decisao === "aprovado" ? "Confirmar Substituição" : "Rejeitar Substituição"}
          </h2>

          {decisao === "rejeitado" && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Por que está rejeitando? *
              </label>
              <textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 outline-none h-32 resize-none"
                placeholder="Ex: O profissional já não trabalha mais aqui, não temos agenda, etc."
              ></textarea>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setDecisao(null)}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              Voltar
            </button>
            <button
              onClick={handleSubmit}
              disabled={confirmarMutation.isPending}
              className={`flex-1 py-3 text-white font-bold rounded-xl transition-all ${
                decisao === "aprovado"
                  ? "bg-gradient-to-r from-green-400 to-green-600 hover:shadow-xl"
                  : "bg-gradient-to-r from-red-400 to-red-600 hover:shadow-xl"
              } disabled:opacity-50`}
            >
              {confirmarMutation.isPending ? "Processando..." : "Confirmar"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-yellow-100 mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Autorização de Substituição
          </h1>
          <p className="text-gray-600">
            Por favor, revise os dados e confirme ou rejeite
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h3 className="font-black text-lg text-gray-900 mb-4">Dados da Substituição</h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Profissional Escolhido</p>
              <p className="font-bold text-gray-900">{profissional.nome_completo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Especialidade</p>
              <p className="font-bold text-gray-900">{substituicao.especialidade_necessaria}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Local</p>
              <p className="font-bold text-gray-900">{substituicao.nome_clinica}</p>
              <p className="text-sm text-gray-600">{substituicao.cidade}/{substituicao.uf}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-sm text-gray-600">Avaliação</p>
                <p className="font-bold text-gray-900">⭐ {profissional.media_avaliacoes || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Comparecimento</p>
                <p className="font-bold text-gray-900">✅ {profissional.taxa_comparecimento || 100}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleConfirmar(false)}
            className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all shadow-xl hover:shadow-2xl"
          >
            ❌ REJEITAR
          </button>
          <button
            onClick={() => handleConfirmar(true)}
            className="flex-1 py-4 bg-gradient-to-r from-green-400 to-green-600 text-white font-black rounded-2xl hover:shadow-2xl transition-all shadow-xl"
          >
            ✅ AUTORIZAR
          </button>
        </div>
      </motion.div>
    </div>
  );
}