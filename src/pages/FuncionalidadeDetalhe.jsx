import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Tag,
  FileText
} from "lucide-react";

export default function FuncionalidadeDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [funcionalidade, setFuncionalidade] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simular carregamento de dados
        // Em produção, substituir por chamada real à API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setFuncionalidade({
          id: id,
          titulo: "Funcionalidade Premium",
          descricao: "Descrição detalhada da funcionalidade.",
          status: "ATIVO",
          categoria: "Sistema",
          data_criacao: new Date().toISOString(),
          responsavel: "Administrador"
        });
      } catch (error) {
        console.error("Erro ao carregar funcionalidade:", error);
        toast.error("Erro ao carregar detalhes");
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (!funcionalidade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Funcionalidade não encontrada</h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      <div className="bg-white border-b-2 border-gray-100 p-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
              <Info className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Detalhes da Funcionalidade</h1>
              <p className="text-sm text-gray-600">Informações completas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Card Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{funcionalidade.titulo}</h2>
              <div className="flex items-center gap-2">
                {funcionalidade.status === "ATIVO" ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Ativo
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-bold flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Inativo
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed">{funcionalidade.descricao}</p>
          </div>
        </motion.div>

        {/* Informações Adicionais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Informações Detalhadas
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Tag className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Categoria</p>
                <p className="font-semibold text-gray-900">{funcionalidade.categoria}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Responsável</p>
                <p className="font-semibold text-gray-900">{funcionalidade.responsavel}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Data de Criação</p>
                <p className="font-semibold text-gray-900">
                  {new Date(funcionalidade.data_criacao).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl shadow-xl p-6 border-2 border-blue-200"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Info className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-bold text-gray-900">Precisa de ajuda?</p>
                <p className="text-sm text-gray-600">Entre em contato com o suporte</p>
              </div>
            </div>
            <button
              onClick={() => toast.info("Suporte em desenvolvimento")}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              Contatar Suporte
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}