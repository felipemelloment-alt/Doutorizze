import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import {
  ChevronLeft,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Ticket,
  Filter,
  Download,
  Building2,
  User,
  Eye,
  Mail,
  Phone
} from "lucide-react";

function ClientesDoutorizzeContent() {
  const navigate = useNavigate();
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  // Buscar todos os usuários
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      return await base44.asServiceRole.entities.User.list();
    }
  });

  // Buscar profissionais
  const { data: profissionais = [], isLoading: loadingProfs } = useQuery({
    queryKey: ["admin-all-professionals"],
    queryFn: async () => {
      return await base44.asServiceRole.entities.Professional.list();
    }
  });

  // Buscar clínicas
  const { data: clinicas = [], isLoading: loadingClinicas } = useQuery({
    queryKey: ["admin-all-companies"],
    queryFn: async () => {
      return await base44.asServiceRole.entities.CompanyUnit.list();
    }
  });

  const isLoading = loadingUsers || loadingProfs || loadingClinicas;

  // Combinar dados
  const clientes = users.map(user => {
    const prof = profissionais.find(p => p.user_id === user.id);
    const clinic = clinicas.find(c => c.owner_id === user.id);
    
    return {
      ...user,
      tipo: prof ? "PROFISSIONAL" : clinic ? "CLINICA" : "USUARIO",
      detalhes: prof || clinic || null
    };
  });

  const clientesFiltrados = clientes.filter(c => {
    if (filtroTipo === "TODOS") return true;
    return c.tipo === filtroTipo;
  });

  const estatisticas = {
    total: clientes.length,
    profissionais: clientes.filter(c => c.tipo === "PROFISSIONAL").length,
    clinicas: clientes.filter(c => c.tipo === "CLINICA").length,
    usuarios: clientes.filter(c => c.tipo === "USUARIO").length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      <div className="bg-white border-b-2 border-gray-100 p-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Clientes Doutorizze</h1>
              <p className="text-sm text-gray-600">Histórico de tokens gerados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Total de Clientes</p>
            </div>
            <p className="text-4xl font-black text-blue-600">{estatisticas.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Profissionais</p>
            </div>
            <p className="text-4xl font-black text-green-600">{estatisticas.profissionais}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-600">Clínicas</p>
            </div>
            <p className="text-4xl font-black text-purple-600">{estatisticas.clinicas}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">Outros</p>
            </div>
            <p className="text-4xl font-black text-gray-600">{estatisticas.usuarios}</p>
          </motion.div>
        </div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-gray-900">Filtrar por Tipo</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {['TODOS', 'PROFISSIONAL', 'CLINICA', 'USUARIO'].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  filtroTipo === tipo
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tipo === 'TODOS' ? 'Todos' : tipo.charAt(0) + tipo.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Lista de Clientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              Lista de Clientes ({clientesFiltrados.length})
            </h3>
          </div>

          {clientesFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Nenhum cliente encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {clientesFiltrados.map((cliente, index) => (
                <motion.div
                  key={cliente.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        cliente.tipo === "PROFISSIONAL" ? "bg-blue-500" : 
                        cliente.tipo === "CLINICA" ? "bg-purple-500" : "bg-gray-500"
                      }`}>
                        {cliente.full_name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-gray-900">{cliente.full_name || "Sem nome"}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            cliente.tipo === "PROFISSIONAL" ? "bg-blue-100 text-blue-700" :
                            cliente.tipo === "CLINICA" ? "bg-purple-100 text-purple-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {cliente.tipo}
                          </span>
                          {cliente.role === "admin" && (
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                              ADMIN
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{cliente.email}</span>
                          </div>
                          {cliente.detalhes?.whatsapp && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{cliente.detalhes.whatsapp}</span>
                            </div>
                          )}
                        </div>

                        {cliente.detalhes && (
                          <div className="text-sm text-gray-500">
                            {cliente.tipo === "PROFISSIONAL" && (
                              <p>{cliente.detalhes.especialidade_principal} - {cliente.detalhes.registro_conselho}</p>
                            )}
                            {cliente.tipo === "CLINICA" && (
                              <p>{cliente.detalhes.nome_fantasia} - {cliente.detalhes.cidade}/{cliente.detalhes.uf}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setClienteSelecionado(cliente)}
                      className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal Detalhes Cliente */}
      {clienteSelecionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Detalhes do Cliente</h3>
              <button
                onClick={() => setClienteSelecionado(null)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Nome Completo</p>
                <p className="font-bold text-gray-900">{clienteSelecionado.full_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-bold text-gray-900">{clienteSelecionado.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Tipo</p>
                <p className="font-bold text-gray-900">{clienteSelecionado.tipo}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Role</p>
                <p className="font-bold text-gray-900">{clienteSelecionado.role}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Cadastrado em</p>
                <p className="font-bold text-gray-900">
                  {new Date(clienteSelecionado.created_date).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {clienteSelecionado.detalhes && (
                <>
                  <hr className="my-4" />
                  <h4 className="font-bold text-gray-900 mb-4">Informações Adicionais</h4>
                  
                  {clienteSelecionado.tipo === "PROFISSIONAL" && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Especialidade</p>
                        <p className="font-bold text-gray-900">{clienteSelecionado.detalhes.especialidade_principal}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Registro</p>
                        <p className="font-bold text-gray-900">
                          {clienteSelecionado.detalhes.registro_conselho}/{clienteSelecionado.detalhes.uf_conselho}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <p className="font-bold text-gray-900">{clienteSelecionado.detalhes.status_cadastro}</p>
                      </div>
                    </>
                  )}

                  {clienteSelecionado.tipo === "CLINICA" && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Nome Fantasia</p>
                        <p className="font-bold text-gray-900">{clienteSelecionado.detalhes.nome_fantasia}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">CNPJ</p>
                        <p className="font-bold text-gray-900">{clienteSelecionado.detalhes.cnpj}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Localização</p>
                        <p className="font-bold text-gray-900">
                          {clienteSelecionado.detalhes.cidade}/{clienteSelecionado.detalhes.uf}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <p className="font-bold text-gray-900">{clienteSelecionado.detalhes.status_cadastro}</p>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function ClientesDoutorizze() {
  return (
    <ProtectedRoute requireAdmin>
      <ClientesDoutorizzeContent />
    </ProtectedRoute>
  );
}