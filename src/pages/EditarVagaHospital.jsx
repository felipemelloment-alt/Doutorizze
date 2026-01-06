import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ChevronLeft, Briefcase, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function EditarVagaHospital() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo_vaga: "",
    especialidades_aceitas: [],
    falar_com: "",
    horario_inicio: "",
    horario_fim: "",
    valor_proposto: "",
    tipo_remuneracao: ""
  });

  const { data: vaga, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) return null;
      const result = await base44.entities.Job.filter({ id });
      return result[0] || null;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (vaga) {
      setFormData({
        titulo: vaga.titulo || "",
        descricao: vaga.descricao || "",
        tipo_vaga: vaga.tipo_vaga || "",
        especialidades_aceitas: vaga.especialidades_aceitas || [],
        falar_com: vaga.falar_com || "",
        horario_inicio: vaga.horario_inicio || "",
        horario_fim: vaga.horario_fim || "",
        valor_proposto: vaga.valor_proposto || "",
        tipo_remuneracao: vaga.tipo_remuneracao || ""
      });
    }
  }, [vaga]);

  const updateMutation = useMutation({
    mutationFn: async (dados) => {
      return await base44.entities.Job.update(id, dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job"] });
      toast.success("✅ Vaga atualizada!");
      navigate(createPageUrl("MinhasVagasHospital"));
    }
  });

  const handleSalvar = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading || !vaga) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-6">
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>

        <h1 className="text-3xl font-black text-gray-900 mb-8">Editar Vaga</h1>

        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Título *</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Descrição *</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl outline-none min-h-[120px]"
            />
          </div>

          <button
            onClick={handleSalvar}
            disabled={updateMutation.isPending}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-2xl disabled:opacity-50"
          >
            {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}