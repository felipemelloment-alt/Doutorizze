import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, X, Star, Users, MapPin, Briefcase, Clock, DollarSign, Calendar, Zap, CheckCircle, MessageCircle, Award } from "lucide-react";
import { useUserRole } from "@/components/hooks/useUserRole";
import { getEspecialidades, getProfissionalLabel } from "@/components/constants/especialidades";
import { motion } from "framer-motion";

// Lista de estados brasileiros
const estados = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", 
  "RO", "RR", "RS", "SC", "SE", "SP", "TO"
];

export default function BuscarProfissionais() {
  const [especialidade, setEspecialidade] = useState("");
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [profissionais, setProfissionais] = useState([]);
  const { isClinic, isAdmin, userWorld, loading: loadingRole } = useUserRole();
  
  const especialidades = getEspecialidades(userWorld);
  const profissionalLabel = getProfissionalLabel(userWorld);

  if (loadingRole) {
    return <div className="text-center py-12">Verificando permissões...</div>;
  }

  if (!isClinic && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center shadow-2xl">
            <Users className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Acesso Exclusivo</h1>
          <p className="text-lg text-gray-600 font-semibold">Apenas clínicas podem buscar profissionais.</p>
        </motion.div>
      </div>
    );
  }

  const podesBuscar = especialidade && uf && cidade.trim();

  const buscarProfissionais = async () => {
    setBuscando(true);
    try {
      // Determine which tipo_profissional to search for
      const tipoProfissional = userWorld === "ODONTOLOGIA" ? "DENTISTA" : "MEDICO";

      // Buscar profissionais aprovados e disponíveis com a especialidade
      const resultados = await base44.entities.Professional.filter({
        status_cadastro: "APROVADO",
        status_disponibilidade: "DISPONIVEL",
        especialidade_principal: especialidade,
        tipo_profissional: tipoProfissional
      });

      // Filtrar por cidade
      const filtrados = resultados.filter(p =>
        p.cidades_atendimento &&
        p.cidades_atendimento.some(c =>
          c.toLowerCase().includes(cidade.toLowerCase()) &&
          c.toLowerCase().includes(uf.toLowerCase())
        )
      );

      // Ordenar por avaliação
      filtrados.sort((a, b) => b.media_avaliacoes - a.media_avaliacoes);

      setProfissionais(filtrados);
      setBuscaRealizada(true);

      if (filtrados.length === 0) {
        toast.info("Nenhum profissional encontrado para estes critérios");
      } else {
        toast.success(`${filtrados.length} ${filtrados.length === 1 ? "profissional encontrado" : "profissionais encontrados"}!`);
      }
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
      toast.error("Erro ao buscar profissionais");
    }
    setBuscando(false);
  };

  const limparBusca = () => {
    setEspecialidade("");
    setUf("");
    setCidade("");
    setProfissionais([]);
    setBuscaRealizada(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden py-12 md:py-16 gradient-yellow-pink">
        {/* Decorative Elements */}
        <motion.div
          animate={{ rotate: [0, 10, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute top-10 left-10 opacity-20">
          <Users className="w-32 h-32 text-white" />
        </motion.div>
        <motion.div
          animate={{ rotate: [0, -10, 0], y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 1 }}
          className="absolute bottom-10 right-10 opacity-20">
          <Briefcase className="w-40 h-40 text-white" />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-white rounded-2xl shadow-xl">
                <Search className="w-10 h-10 text-[#4A90E2]" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-[#F9B500] text-shadow-lg mb-4">
              BUSCAR PROFISSIONAIS
            </h1>
            <p className="text-white text-lg md:text-xl font-bold mb-2">
              Encontre {profissionalLabel.toLowerCase()}s qualificados na sua região! ⚡
            </p>
            <Badge className="bg-white text-[#E94560] font-black text-base px-6 py-2 rounded-full shadow-lg">
              Profissionais Verificados ✓
            </Badge>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* SEÇÃO 1 - FILTROS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          <Card className="border-4 border-[#F9B500] shadow-2xl rounded-3xl overflow-hidden mb-8">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b-4 border-[#F9B500] p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-[#F9B500] to-[#FF6B35] rounded-2xl shadow-lg">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-black text-gray-900">
                    Filtros de Busca
                  </CardTitle>
                  <p className="text-sm text-gray-600 font-semibold mt-1">
                    Preencha os campos para encontrar profissionais
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {/* Campo 1: Especialidade */}
                <div>
                  <label className="text-base font-bold text-gray-700 mb-2 block flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#4A90E2]" />
                    Especialidade <span className="text-[#E94560]">*</span>
                  </label>
                  <Select value={especialidade} onValueChange={setEspecialidade}>
                    <SelectTrigger className="h-14 rounded-xl border-2 text-lg hover:border-[#F9B500] transition-colors">
                      <SelectValue placeholder="Selecione a especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {especialidades.map((esp) => (
                        <SelectItem key={esp} value={esp} className="text-base">
                          {esp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Campo 2: Estado */}
                <div>
                  <label className="text-base font-bold text-gray-700 mb-2 block flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#4A90E2]" />
                    Estado <span className="text-[#E94560]">*</span>
                  </label>
                  <Select value={uf} onValueChange={setUf}>
                    <SelectTrigger className="h-14 rounded-xl border-2 text-lg hover:border-[#F9B500] transition-colors">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado} value={estado} className="text-base">
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Campo 3: Cidade */}
                <div>
                  <label className="text-base font-bold text-gray-700 mb-2 block flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#4A90E2]" />
                    Cidade <span className="text-[#E94560]">*</span>
                  </label>
                  <Input
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Digite o nome da cidade"
                    className="h-14 text-lg rounded-xl border-2 hover:border-[#F9B500] transition-colors"
                  />
                </div>
              </div>

              <Button
                onClick={buscarProfissionais}
                disabled={!podesBuscar || buscando}
                size="lg"
                className="w-full h-16 gradient-yellow-pink text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-0">
                {buscando ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-4 border-white mr-2"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6 mr-2" />
                    BUSCAR PROFISSIONAIS
                    <Zap className="w-6 h-6 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* SEÇÃO 2 - RESULTADOS */}
        {!buscaRealizada ? (
          // ESTADO INICIAL
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}>
            <Card className="border-4 border-gray-200 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="py-20">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}>
                    <Search className="w-24 h-24 mx-auto text-gray-300 mb-6" />
                  </motion.div>
                  <h3 className="text-2xl md:text-3xl text-gray-900 font-black mb-3">
                    Pronto para buscar?
                  </h3>
                  <p className="text-lg text-gray-600 font-semibold mb-2">
                    Preencha os filtros acima para ver os profissionais disponíveis
                  </p>
                  <p className="text-base text-gray-500">
                    Busque por especialidade, estado e cidade
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : profissionais.length === 0 ? (
          // SEM RESULTADOS
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-4 border-gray-200 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="py-20">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <X className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl text-gray-900 font-black mb-3">
                    Nenhum profissional encontrado
                  </h3>
                  <p className="text-lg text-gray-600 font-semibold mb-6">
                    Tente buscar em cidades vizinhas ou outras especialidades
                  </p>
                  <Button 
                    onClick={limparBusca} 
                    size="lg"
                    className="bg-gradient-to-r from-gray-500 to-gray-700 text-white font-bold px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-0">
                    <X className="w-5 h-5 mr-2" />
                    Limpar Filtros e Tentar Novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // COM RESULTADOS
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>
            <Card className="border-4 border-[#25D366] shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b-4 border-[#25D366] p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-br from-[#25D366] to-green-600 rounded-2xl shadow-lg">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl md:text-3xl font-black text-gray-900">
                        {profissionais.length} {profissionais.length === 1 ? "Profissional Encontrado" : "Profissionais Encontrados"}! 🎉
                      </CardTitle>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-gradient-to-r from-[#F9B500] to-[#FF6B35] text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg">
                        <Award className="w-4 h-4 mr-1" />
                        {especialidade}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-[#4A90E2] to-blue-600 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg">
                        <MapPin className="w-4 h-4 mr-1" />
                        {cidade} - {uf}
                      </Badge>
                      <Button
                        onClick={limparBusca}
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-[#E94560] hover:bg-red-50 font-bold rounded-full px-4">
                        <X className="w-4 h-4 mr-1" />
                        Limpar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profissionais.map((prof, index) => (
                  <motion.div
                    key={prof.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl border-4 border-gray-100 hover:border-[#F9B500] transition-all">
                    
                    {/* HEADER */}
                    <div className="mb-4">
                      {/* Nome */}
                      <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-1">
                        {prof.nome_completo}
                      </h3>

                      {/* Especialidade */}
                      <Badge className="bg-gradient-to-r from-[#4A90E2] to-blue-600 text-white font-bold text-xs px-3 py-1 rounded-full mb-3">
                        <Award className="w-3 h-3 mr-1" />
                        {prof.especialidade_principal}
                      </Badge>

                      {/* Cidade principal */}
                      <div className="flex items-center gap-2 text-gray-700 mb-3">
                        <MapPin className="w-4 h-4 text-[#E94560]" />
                        <span className="text-sm font-semibold">
                          {prof.cidades_atendimento?.[0] || "N/A"}
                        </span>
                      </div>

                      {/* Avaliações */}
                      {prof.total_avaliacoes > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-5 h-5 text-[#F9B500] fill-[#F9B500]" />
                          <span className="text-lg font-black text-gray-900">
                            {(prof.media_avaliacoes || 0).toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500 font-semibold">
                            ({prof.total_avaliacoes} {prof.total_avaliacoes === 1 ? "avaliação" : "avaliações"})
                          </span>
                        </div>
                      )}

                      {/* Badge Disponível */}
                      <Badge className="bg-gradient-to-r from-green-400 to-[#25D366] text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        DISPONÍVEL
                      </Badge>
                    </div>

                    <div className="border-t-2 border-gray-100 my-4" />

                    {/* CORPO */}
                    <div className="space-y-3 mb-4">
                      {/* Tempo formado */}
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-[#FF6B35] mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="font-bold text-gray-700">Formado:</span>{" "}
                          <span className="text-gray-900 font-semibold">{prof.tempo_formado_anos} anos</span>
                        </div>
                      </div>

                      {/* Tempo especialista */}
                      {prof.tempo_especialidade_anos > 0 && (
                        <div className="flex items-start gap-2">
                          <Award className="w-4 h-4 text-[#4A90E2] mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <span className="font-bold text-gray-700">Especialista:</span>{" "}
                            <span className="text-gray-900 font-semibold">{prof.tempo_especialidade_anos} anos</span>
                          </div>
                        </div>
                      )}

                      {/* Dias disponíveis */}
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-[#E94560] mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="font-bold text-gray-700">Dias:</span>{" "}
                          <span className="text-gray-900 font-semibold">
                            {prof.dias_semana_disponiveis?.includes("INTEGRAL")
                              ? "Todos os dias"
                              : prof.dias_semana_disponiveis?.join(", ") || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Remuneração */}
                      <div className="flex items-start gap-2">
                        <DollarSign className="w-4 h-4 text-[#25D366] mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="font-bold text-gray-700">Aceita:</span>{" "}
                          <span className="text-gray-900 font-semibold">
                            {prof.forma_remuneracao?.map(f =>
                              f === "DIARIA" ? "Diária" :
                              f === "PORCENTAGEM" ? "%" :
                              f === "FIXO" ? "Fixo" : "A Combinar"
                            ).join(", ") || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* BOTÃO */}
                    <Button
                      onClick={() => {
                        if (prof.whatsapp) {
                          window.open(`https://wa.me/55${prof.whatsapp}`, "_blank");
                        } else {
                          toast.info("WhatsApp não disponível");
                        }
                      }}
                      className="w-full h-12 bg-gradient-to-r from-[#25D366] to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black text-base rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border-0">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Entrar em Contato
                    </Button>
                  </motion.div>
                ))}
              </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}