import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Search,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  Shield,
  Award,
  Ticket,
  Loader2
} from "lucide-react";

export default function ValidarClienteDoutorizze() {
  const navigate = useNavigate();
  const [tokenId, setTokenId] = useState("");
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [parceiro, setParceiro] = useState(null);
  const [gerandoDesconto, setGerandoDesconto] = useState(false);

  useEffect(() => {
    const loadParceiro = async () => {
      try {
        const user = await base44.auth.me();
        
        // Tentar buscar em cada tipo de parceiro
        const suppliers = await base44.entities.Supplier.filter({ user_id: user.id });
        if (suppliers.length > 0) {
          setParceiro({ ...suppliers[0], tipo: 'FORNECEDOR' });
          return;
        }

        const institutions = await base44.entities.EducationInstitution.filter({ user_id: user.id });
        if (institutions.length > 0) {
          setParceiro({ ...institutions[0], tipo: 'INSTITUICAO' });
          return;
        }

        const labs = await base44.entities.Laboratorio.filter({ user_id: user.id });
        if (labs.length > 0) {
          setParceiro({ ...labs[0], tipo: 'LABORATORIO' });
          return;
        }

        toast.error("Você não tem um cadastro de parceiro");
        navigate(-1);
      } catch (error) {
        console.error("Erro ao carregar parceiro:", error);
        toast.error("Erro ao carregar dados");
      }
    };
    loadParceiro();
  }, [navigate]);

  const handleValidar = async () => {
    if (!tokenId.trim()) {
      toast.error("Digite o Token ID do cliente");
      return;
    }

    setValidando(true);
    setResultado(null);

    try {
      const response = await base44.functions.invoke('validarTokenUsuario', {
        token_id: tokenId.trim()
      });

      setResultado(response.data);
      
      if (response.data.valido) {
        toast.success("Cliente validado com sucesso!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Erro ao validar token: " + error.message);
      setResultado({ valido: false, message: "Erro na validação" });
    }
    
    setValidando(false);
  };

  const handleGerarDesconto = async () => {
    if (!resultado || !resultado.valido) return;

    setGerandoDesconto(true);

    try {
      const response = await base44.functions.invoke('gerarTokenDesconto', {
        token_usuario_id: resultado.token_usuario_id,
        user_id: resultado.usuario.email,
        parceiro_tipo: parceiro.tipo,
        desconto_tipo: 'PERCENTUAL',
        desconto_valor: 10,
        produto_categoria: '',
        observacoes: 'Desconto exclusivo Doutorizze'
      });

      if (response.data.success) {
        toast.success("✅ Token de desconto gerado e enviado via WhatsApp!");
        setResultado(null);
        setTokenId("");
      } else {
        toast.error(response.data.error || "Erro ao gerar desconto");
      }
    } catch (error) {
      toast.error("Erro: " + error.message);
    }

    setGerandoDesconto(false);
  };

  if (!parceiro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Validar Cliente Doutorizze</h1>
              <p className="text-sm text-gray-600">Verifique o Token ID do cliente</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Info do Parceiro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl shadow-xl p-6 border-2 border-blue-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <Ticket className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Seus Tokens Disponíveis</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4">
              <p className="text-sm text-gray-600">Disponíveis</p>
              <p className="text-3xl font-black text-blue-600">{parceiro.tokens_disponiveis || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <p className="text-sm text-gray-600">Usados no mês</p>
              <p className="text-3xl font-black text-purple-600">{parceiro.tokens_usados_mes || 0}</p>
            </div>
          </div>
        </motion.div>

        {/* Input de Validação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-500" />
            Digite o Token ID do Cliente
          </h3>

          <div className="space-y-4">
            <input
              type="text"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value.toUpperCase())}
              placeholder="DTZ-2026-ABC12345"
              maxLength={50}
              className="w-full px-6 py-5 border-2 border-gray-200 rounded-xl text-center text-xl font-bold tracking-wider focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none uppercase"
            />

            <button
              onClick={handleValidar}
              disabled={validando || !tokenId.trim()}
              className="w-full py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {validando ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  Validar Cliente
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Resultado da Validação */}
        <AnimatePresence>
          {resultado && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-3xl shadow-2xl p-8 ${
                resultado.valido 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300' 
                  : 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300'
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                {resultado.valido ? (
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-600" />
                )}
                <div>
                  <h3 className="text-2xl font-black text-gray-900">
                    {resultado.valido ? '✅ Cliente Válido' : '❌ Cliente Inválido'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {resultado.valido ? 'Pode gerar token de desconto' : resultado.message}
                  </p>
                </div>
              </div>

              {resultado.valido && (
                <>
                  <div className="bg-white rounded-2xl p-6 space-y-4 mb-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Nome</p>
                        <p className="font-bold text-gray-900">{resultado.usuario.nome}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <Award className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-500">Tipo de Conta</p>
                        <p className="font-bold text-gray-900">{resultado.usuario.tipo_conta}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">Cadastrado desde</p>
                        <p className="font-bold text-gray-900">
                          {new Date(resultado.usuario.cadastrado_desde).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-500">Créditos Disponíveis</p>
                        <p className="font-bold text-gray-900">{resultado.usuario.creditos_disponiveis}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGerarDesconto}
                    disabled={gerandoDesconto}
                    className="w-full py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {gerandoDesconto ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Gerando Token...
                      </>
                    ) : (
                      <>
                        <Ticket className="w-6 h-6" />
                        Gerar Token de Desconto
                      </>
                    )}
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}