import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  ArrowRight, 
  User, 
  MapPin, 
  Briefcase, 
  DollarSign,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SimulacaoCredito() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome_completo: "",
    cpf: "",
    rg: "",
    data_nascimento: "",
    telefone: "",
    email: "",

    // Endereço
    cep: "",
    cidade: "",
    estado: "",
    endereco: "",

    // Dados Profissionais
    profissao: "",

    // Valor (opcional)
    valor_tratamento: ""
  });

  const [buscandoCep, setBuscandoCep] = useState(false);

  // Máscaras
  const aplicarMascaraCPF = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const aplicarMascaraTelefone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const aplicarMascaraCEP = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  const aplicarMascaraMoeda = (value) => {
    let num = value.replace(/\D/g, "");
    if (!num || num === "0") return "";
    num = (parseFloat(num) / 100).toFixed(2);
    if (isNaN(parseFloat(num))) return "";
    num = num.replace(".", ",");
    num = num.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    return num;
  };

  const handleInputChange = (campo, valor) => {
    if (campo === "nome_completo") {
      valor = valor.trimStart().replace(/\s{2,}/g, ' ');
    }
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const buscarCEP = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length !== 8) {
      toast.error("CEP deve ter 8 dígitos");
      return;
    }

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setFormData(prev => ({
        ...prev,
        endereco: `${data.logradouro}, ${data.bairro}`,
        cidade: data.localidade || "",
        estado: data.uf || ""
      }));

      toast.success("CEP encontrado!");
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    }
    setBuscandoCep(false);
  };

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11) return false;
    
    // Validação básica de CPF
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto >= 10 ? 0 : resto;
    
    if (digito1 !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto >= 10 ? 0 : resto;
    
    return digito2 === parseInt(cpf.charAt(10));
  };

  const calcularIdade = (dataNascimento) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const validarFormulario = () => {
    if (!formData.nome_completo.trim() || formData.nome_completo.trim().length < 3) {
      toast.error("Nome completo deve ter no mínimo 3 caracteres");
      return false;
    }

    if (!validarCPF(formData.cpf)) {
      toast.error("CPF inválido");
      return false;
    }

    if (!formData.rg.trim()) {
      toast.error("Preencha o RG");
      return false;
    }

    if (!formData.data_nascimento) {
      toast.error("Preencha a data de nascimento");
      return false;
    }

    const idade = calcularIdade(formData.data_nascimento);
    if (idade < 18) {
      toast.error("Paciente deve ter no mínimo 18 anos");
      return false;
    }

    if (!formData.telefone || formData.telefone.replace(/\D/g, "").length !== 11) {
      toast.error("Telefone inválido");
      return false;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Email inválido");
      return false;
    }

    if (!formData.cep || formData.cep.replace(/\D/g, "").length !== 8) {
      toast.error("CEP inválido");
      return false;
    }

    if (!formData.cidade.trim() || !formData.estado.trim()) {
      toast.error("Preencha cidade e estado");
      return false;
    }

    if (!formData.endereco.trim()) {
      toast.error("Preencha o endereço completo");
      return false;
    }

    if (!formData.profissao) {
      toast.error("Selecione a profissão");
      return false;
    }

    return true;
  };

  const handleSimular = async () => {
    if (!validarFormulario()) return;

    setLoading(true);

    try {
      // Simulação da API do Doutorizze
      // Em produção, seria uma chamada real à API
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Resultado simulado
      const aprovado = Math.random() > 0.3; // 70% de aprovação

      setResultado({
        aprovado,
        mensagem: aprovado 
          ? "Crédito pré-aprovado com sucesso!"
          : "Infelizmente o crédito não foi aprovado no momento.",
        opcoes: aprovado ? [
          {
            financeira: "Banco Dental Plus",
            valor: formData.valor_tratamento || "5.000,00",
            parcelas: "12x de R$ 450,00",
            taxa: "1,5% a.m."
          },
          {
            financeira: "CrediSorrisos",
            valor: formData.valor_tratamento || "5.000,00",
            parcelas: "18x de R$ 310,00",
            taxa: "1,8% a.m."
          },
          {
            financeira: "OdontoCredit",
            valor: formData.valor_tratamento || "5.000,00",
            parcelas: "24x de R$ 245,00",
            taxa: "2,1% a.m."
          }
        ] : []
      });

      toast.success("Simulação realizada!");
    } catch (error) {
      toast.error("Erro ao realizar simulação");
    }

    setLoading(false);
  };

  const handleNovaSimulacao = () => {
    setResultado(null);
    setFormData({
      nome_completo: "",
      cpf: "",
      rg: "",
      data_nascimento: "",
      telefone: "",
      email: "",
      cep: "",
      cidade: "",
      estado: "",
      endereco: "",
      profissao: "",
      valor_tratamento: ""
    });
  };

  const profissoes = [
    { value: "autonomo", label: "💼 Autônomo" },
    { value: "aposentado", label: "👴 Aposentado" },
    { value: "profissional_liberal", label: "👔 Profissional Liberal" },
    { value: "empresario", label: "🏢 Empresário" },
    { value: "carteira_assinada", label: "📋 Carteira Assinada" },
    { value: "funcionario_publico", label: "🏛️ Funcionário Público" },
    { value: "prestador_servico", label: "🔧 Prestador de Serviço" },
    { value: "assalariado", label: "💰 Assalariado" }
  ];

  if (resultado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl w-full"
        >
          {resultado.aprovado ? (
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Header Aprovado */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="relative z-10"
                >
                  <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">🎉 Crédito Pré-Aprovado!</h2>
                  <p className="text-white/90">{resultado.mensagem}</p>
                </motion.div>
              </div>

              {/* Opções de Financeiras */}
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Opções Disponíveis:</h3>
                <div className="space-y-4">
                  {resultado.opcoes.map((opcao, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="border-2 border-green-200 rounded-2xl p-6 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{opcao.financeira}</h4>
                          <p className="text-sm text-gray-500">Taxa: {opcao.taxa}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                          Recomendado
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Valor Total</p>
                          <p className="text-2xl font-black text-gray-900">R$ {opcao.valor}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Parcelas</p>
                          <p className="text-xl font-bold text-green-600">{opcao.parcelas}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Botões */}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleNovaSimulacao}
                    className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-100 transition-all"
                  >
                    Nova Simulação
                  </button>
                  <button
                    onClick={() => toast.info("Em breve: Solicitar crédito")}
                    className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    Solicitar Crédito
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Header Negado */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="relative z-10"
                >
                  <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                    <XCircle className="w-12 h-12 text-red-500" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">😔 Crédito Não Aprovado</h2>
                  <p className="text-white/90">{resultado.mensagem}</p>
                </motion.div>
              </div>

              {/* Conteúdo */}
              <div className="p-8">
                <div className="bg-orange-50 rounded-2xl p-6 mb-6 border-2 border-orange-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">O que fazer agora?</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      <span>Revise as informações fornecidas e tente novamente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      <span>Entre em contato com nossa equipe para mais opções</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      <span>Consulte outras formas de pagamento disponíveis</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-100 transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleNovaSimulacao}
                    className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Consultando financeiras...</h3>
              <p className="text-gray-500">Aguarde enquanto buscamos as melhores opções</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão Voltar */}
      <div className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-500 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl mx-4 p-8 relative overflow-hidden">
        {/* Decorações */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute top-4 right-8 text-4xl animate-pulse">💰</div>
        
        {/* Logo Doutorizze */}
        <div className="absolute top-4 right-4 opacity-50 text-white text-xs">
          Powered by Doutorizze
        </div>

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl mb-4">
            💳
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Simulação de Crédito</h1>
          <p className="text-white/80">Preencha os dados do paciente para simular</p>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-3xl shadow-xl mx-4 mt-6 overflow-hidden mb-8">
        {/* Dados Pessoais */}
        <div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-xl">👤</div>
            <h2 className="text-lg font-bold text-gray-900">Dados do Paciente</h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Nome Completo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo do Paciente *</label>
              <input
                type="text"
                value={formData.nome_completo}
                onChange={(e) => handleInputChange("nome_completo", e.target.value)}
                placeholder="Nome completo do paciente"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all outline-none"
              />
            </div>

            {/* Grid CPF e RG */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CPF *</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", aplicarMascaraCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">RG *</label>
                <input
                  type="text"
                  value={formData.rg}
                  onChange={(e) => handleInputChange("rg", e.target.value)}
                  placeholder="Número do RG"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all outline-none"
                />
              </div>
            </div>

            {/* Grid Data e Telefone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Nascimento *</label>
                <input
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => handleInputChange("data_nascimento", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone *</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-xl">💬</div>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange("telefone", aplicarMascaraTelefone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div>
          <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-orange-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-xl">📍</div>
            <h2 className="text-lg font-bold text-gray-900">Endereço</h2>
          </div>

          <div className="p-6 space-y-4">
            {/* CEP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">CEP *</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => handleInputChange("cep", aplicarMascaraCEP(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                  className="flex-1 px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={buscarCEP}
                  disabled={buscandoCep}
                  className="px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {buscandoCep ? "..." : "Buscar"}
                </button>
              </div>
            </div>

            {/* Grid Cidade e Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade *</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange("cidade", e.target.value)}
                  placeholder="Cidade"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado *</label>
                <select
                  value={formData.estado}
                  onChange={(e) => handleInputChange("estado", e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-green-400 focus:ring-4 focus:ring-green-100 appearance-none bg-white cursor-pointer transition-all outline-none"
                >
                  <option value="">Selecione</option>
                  {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Endereço *</label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => handleInputChange("endereco", e.target.value)}
                placeholder="Rua, Número, Bairro, Complemento"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Dados Profissionais */}
        <div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-xl">💼</div>
            <h2 className="text-lg font-bold text-gray-900">Informações Profissionais</h2>
          </div>

          <div className="p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Ocupação *</label>
            <select
              value={formData.profissao}
              onChange={(e) => handleInputChange("profissao", e.target.value)}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-green-400 focus:ring-4 focus:ring-green-100 appearance-none bg-white cursor-pointer transition-all outline-none"
            >
              <option value="">Selecione a profissão...</option>
              {profissoes.map((prof) => (
                <option key={prof.value} value={prof.value}>{prof.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Valor do Tratamento */}
        <div>
          <div className="bg-gradient-to-r from-green-50 to-teal-50 px-6 py-4 border-b border-green-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-xl">💰</div>
              <h2 className="text-lg font-bold text-gray-900">Valor do Tratamento</h2>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Opcional</span>
          </div>

          <div className="p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Valor total do tratamento</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
              <input
                type="text"
                value={formData.valor_tratamento}
                onChange={(e) => handleInputChange("valor_tratamento", aplicarMascaraMoeda(e.target.value))}
                placeholder="0,00"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-col-reverse md:flex-row gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>

            <button
              onClick={handleSimular}
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="text-xl">💳</span>
              Simular Crédito
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}