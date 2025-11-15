import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Radar, Zap, Search } from "lucide-react";

export default function RadarActivationModal({ open, onOpenChange, initialCategory, initialSearch }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    tipo_mundo: initialCategory || "",
    nome_produto: initialSearch || "",
    preco_maximo: "",
    localizacao_preferida: "",
    condicao_preferida: [],
    telefone_contato: "",
    observacoes: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  const createRadarMutation = useMutation({
    mutationFn: async (data) => {
      // Data de expiração: 60 dias a partir de hoje
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 60);

      return await base44.entities.ProductRadar.create({
        ...data,
        data_expiracao: expirationDate.toISOString().split("T")[0],
        interessado_id: user?.id,
        interessado_nome: user?.full_name,
        interessado_tipo: "DENTISTA", // Ajustar baseado no tipo real
        ativo: true,
        notificacoes_recebidas: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["productRadars"]);
      toast.success("🎯 Radar ativado! Você será notificado quando aparecer o produto!");
      onOpenChange(false);
      setFormData({
        tipo_mundo: "",
        nome_produto: "",
        preco_maximo: "",
        localizacao_preferida: "",
        condicao_preferida: [],
        telefone_contato: "",
        observacoes: "",
      });
    },
    onError: (error) => {
      toast.error("Erro ao ativar radar. Tente novamente.");
      console.error(error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.tipo_mundo || !formData.nome_produto || !formData.telefone_contato) {
      toast.error("Preencha os campos obrigatórios!");
      return;
    }

    createRadarMutation.mutate(formData);
  };

  const toggleCondition = (condition) => {
    const current = formData.condicao_preferida || [];
    if (current.includes(condition)) {
      setFormData({
        ...formData,
        condicao_preferida: current.filter((c) => c !== condition),
      });
    } else {
      setFormData({
        ...formData,
        condicao_preferida: [...current, condition],
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl">
              <Radar className="w-8 h-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black">
                Ativar Radar de Produtos 🎯
              </DialogTitle>
              <DialogDescription className="text-base">
                Receba notificações quando o produto que você procura for anunciado!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Info Box */}
          <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-green-900 mb-1">Como funciona?</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✅ Defina o produto que você procura</li>
                  <li>✅ Quando alguém anunciar, você recebe notificação</li>
                  <li>✅ Vendedores podem ver seu interesse e te chamar</li>
                  <li>✅ Radar fica ativo por 60 dias</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Categoria */}
          <div>
            <Label className="text-base font-bold">Categoria *</Label>
            <Select
              value={formData.tipo_mundo}
              onValueChange={(value) =>
                setFormData({ ...formData, tipo_mundo: value })
              }
            >
              <SelectTrigger className="h-12 rounded-xl border-2 mt-2">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ODONTOLOGIA">🦷 Odontologia</SelectItem>
                <SelectItem value="MEDICINA">⚕️ Medicina</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nome do Produto */}
          <div>
            <Label className="text-base font-bold">Produto que você procura *</Label>
            <Input
              placeholder="Ex: Cadeira Odontológica, Autoclave, etc."
              value={formData.nome_produto}
              onChange={(e) =>
                setFormData({ ...formData, nome_produto: e.target.value })
              }
              className="h-12 text-lg rounded-xl border-2 mt-2"
            />
          </div>

          {/* Grid: Preço Máximo e Localização */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-bold">Preço máximo (R$)</Label>
              <Input
                type="number"
                placeholder="20000"
                value={formData.preco_maximo}
                onChange={(e) =>
                  setFormData({ ...formData, preco_maximo: e.target.value })
                }
                className="h-12 text-lg rounded-xl border-2 mt-2"
              />
            </div>
            <div>
              <Label className="text-base font-bold">Cidade preferida</Label>
              <Input
                placeholder="Goiânia - GO"
                value={formData.localizacao_preferida}
                onChange={(e) =>
                  setFormData({ ...formData, localizacao_preferida: e.target.value })
                }
                className="h-12 text-lg rounded-xl border-2 mt-2"
              />
            </div>
          </div>

          {/* Condições */}
          <div>
            <Label className="text-base font-bold mb-3 block">
              Condições que você aceita
            </Label>
            <div className="flex gap-3">
              {["NOVO", "SEMINOVO", "USADO"].map((condition) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => toggleCondition(condition)}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                    (formData.condicao_preferida || []).includes(condition)
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:border-green-300"
                  }`}
                >
                  {condition === "NOVO" && "Novo"}
                  {condition === "SEMINOVO" && "Seminovo"}
                  {condition === "USADO" && "Usado"}
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <Label className="text-base font-bold">WhatsApp *</Label>
            <Input
              placeholder="62999998888 (apenas números)"
              value={formData.telefone_contato}
              onChange={(e) =>
                setFormData({ ...formData, telefone_contato: e.target.value })
              }
              maxLength={11}
              className="h-12 text-lg rounded-xl border-2 mt-2"
            />
            <p className="text-sm text-gray-600 mt-1">
              Vendedores poderão te chamar quando tiverem o produto
            </p>
          </div>

          {/* Observações */}
          <div>
            <Label className="text-base font-bold">Observações</Label>
            <Textarea
              placeholder="Ex: Preciso urgente, prefiro da marca X, etc."
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              className="min-h-24 text-lg rounded-xl border-2 mt-2"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-14 rounded-xl border-2 font-bold text-lg"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createRadarMutation.isPending}
              className="flex-1 h-14 bg-gradient-to-r from-green-400 to-teal-500 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              {createRadarMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Ativando...
                </>
              ) : (
                <>
                  <Radar className="w-6 h-6 mr-2" />
                  Ativar Radar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}