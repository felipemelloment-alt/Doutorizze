import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserArea } from "@/components/hooks/useUserArea";
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
import CityAutocomplete from "@/components/forms/CityAutocomplete";
import { useIBGECidades } from "@/components/hooks/useIBGECidades";
import { toast } from "sonner";
import { Radar, Zap, Search } from "lucide-react";

const UFS = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" }
];

export default function RadarActivationModal({ open, onOpenChange, initialCategory, initialSearch }) {
  const queryClient = useQueryClient();
  const { userArea } = useUserArea();
  const [user, setUser] = useState(null);
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const { cidades, loading: cidadesLoading } = useIBGECidades(uf);

  const [formData, setFormData] = useState({
    tipo_mundo: initialCategory || userArea || "",
    categoria: "",
    subcategoria: "",
    keywords: initialSearch ? [initialSearch] : [],
    marca: "",
    preco_min: "",
    preco_max: "",
    uf: "",
    cidade: "",
    condicao: [],
    telefone_contato: "",
    notificar_whatsapp: true,
    observacoes: "",
  });

  // Atualizar tipo_mundo quando userArea mudar
  useEffect(() => {
    if (userArea && !formData.tipo_mundo) {
      setFormData(prev => ({ ...prev, tipo_mundo: userArea }));
    }
  }, [userArea]);

  const [keywordInput, setKeywordInput] = useState("");

  // Definir área automaticamente
  useEffect(() => {
    if (userArea) {
      setFormData(prev => ({ ...prev, tipo_mundo: userArea }));
    }
  }, [userArea]);

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

      // Detectar tipo do usuário
      let tipoUsuario = "DENTISTA";
      if (user?.tipo_conta === "CLINICA") tipoUsuario = "CLINICA";
      else if (user?.tipo_conta === "FORNECEDOR") tipoUsuario = "FORNECEDOR";
      else if (user?.vertical === "MEDICINA") tipoUsuario = "MEDICO";

      return await base44.entities.ProductRadar.create({
        ...data,
        data_expiracao: expirationDate.toISOString().split("T")[0],
        interessado_id: user?.id,
        interessado_nome: user?.full_name,
        interessado_tipo: tipoUsuario,
        ativo: true,
        notificacoes_recebidas: 0,
        radar_notified_items: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["productRadars"]);
      toast.success("🎯 Radar ativado! Você será notificado quando aparecer o produto!");
      onOpenChange(false);
      setFormData({
        tipo_mundo: "",
        categoria: "",
        subcategoria: "",
        keywords: [],
        marca: "",
        preco_min: "",
        preco_max: "",
        uf: "",
        cidade: "",
        condicao: [],
        telefone_contato: "",
        notificar_whatsapp: true,
        observacoes: "",
      });
      setKeywordInput("");
    },
    onError: (error) => {
      toast.error("Erro ao ativar radar. Tente novamente.");
      console.error(error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.tipo_mundo || !formData.telefone_contato) {
      toast.error("Preencha os campos obrigatórios!");
      return;
    }

    if (formData.keywords.length === 0 && !formData.categoria) {
      toast.error("Adicione palavras-chave ou selecione uma categoria!");
      return;
    }

    createRadarMutation.mutate(formData);
  };

  const adicionarKeyword = () => {
    const keyword = keywordInput.trim();
    if (!keyword) return;
    
    if (formData.keywords.includes(keyword)) {
      toast.error("Palavra-chave já adicionada");
      return;
    }

    setFormData(prev => ({
      ...prev,
      keywords: [...prev.keywords, keyword]
    }));
    setKeywordInput("");
  };

  const removerKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const toggleCondition = (condition) => {
    const current = formData.condicao || [];
    if (current.includes(condition)) {
      setFormData({
        ...formData,
        condicao: current.filter((c) => c !== condition),
      });
    } else {
      setFormData({
        ...formData,
        condicao: [...current, condition],
      });
    }
  };

  const MAX_VALOR = 9999999.99;

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const handlePrecoChange = (e) => {
    // Remove tudo exceto números
    const apenasNumeros = e.target.value.replace(/\D/g, '');
    const valorNumerico = parseFloat(apenasNumeros) / 100;
    
    if (valorNumerico > MAX_VALOR) {
      toast.error("Valor máximo permitido: R$ 9.999.999,99");
      return;
    }
    
    setFormData({ ...formData, preco_maximo: apenasNumeros ? valorNumerico.toString() : '' });
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

          {/* Categoria - AUTOMATICA */}
          <div>
            <Label className="text-base font-bold">Categoria</Label>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-4 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 font-bold rounded-xl border-2 border-orange-200">
                {userArea === "ODONTOLOGIA" ? "🦷 Odontologia" : "⚕️ Medicina"}
              </span>
              <span className="text-sm text-gray-500">Sua área de atuação</span>
            </div>
          </div>

          {/* Palavras-chave */}
          <div>
            <Label className="text-base font-bold">Palavras-chave *</Label>
            <div className="mt-2 space-y-2">
              {formData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-green-50 rounded-xl">
                  {formData.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => removerKeyword(kw)}
                        className="hover:bg-green-600 rounded-full px-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), adicionarKeyword())}
                  placeholder="Ex: autoclave, cadeira, compressor"
                  className="h-12 text-lg rounded-xl border-2"
                />
                <button
                  type="button"
                  onClick={adicionarKeyword}
                  className="px-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500">Pressione Enter ou clique + para adicionar</p>
            </div>
          </div>

          {/* Marca */}
          <div>
            <Label className="text-base font-bold">Marca (opcional)</Label>
            <Input
              placeholder="Ex: Cristófoli, Gnatus, Kavo"
              value={formData.marca}
              onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
              className="h-12 text-lg rounded-xl border-2 mt-2"
            />
          </div>

          {/* Faixa de Preço */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-bold">Preço mínimo (R$)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.preco_min}
                onChange={(e) => setFormData({ ...formData, preco_min: e.target.value })}
                min="0"
                className="h-12 text-lg rounded-xl border-2 mt-2"
              />
            </div>
            <div>
              <Label className="text-base font-bold">Preço máximo (R$)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.preco_max}
                onChange={(e) => setFormData({ ...formData, preco_max: e.target.value })}
                min="0"
                className="h-12 text-lg rounded-xl border-2 mt-2"
              />
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-4">
            {/* Estado (UF) */}
            <div>
              <Label className="text-base font-bold">Estado</Label>
              <Select 
                value={uf} 
                onValueChange={(value) => {
                  setUf(value);
                  setCidade(""); // Limpar cidade ao mudar estado
                }}
              >
                <SelectTrigger className="h-12 rounded-xl border-2 mt-2">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {UFS.map((estado) => (
                    <SelectItem key={estado.sigla} value={estado.sigla}>
                      {estado.sigla} - {estado.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cidade */}
            <div>
              <Label className="text-base font-bold">Cidade preferida</Label>
              <div className="mt-2">
                <CityAutocomplete
                  value={cidade}
                  onChange={(value) => {
                    setCidade(value);
                    setFormData({ ...formData, localizacao_preferida: `${value} - ${uf}` });
                  }}
                  cidades={cidades}
                  loading={cidadesLoading}
                  disabled={!uf}
                  placeholder={uf ? "Digite para buscar a cidade" : "Selecione o estado primeiro"}
                />
              </div>
            </div>
          </div>

          {/* Condições */}
          <div>
            <Label className="text-base font-bold mb-3 block">
              Condições que você aceita (opcional)
            </Label>
            <div className="flex gap-3">
              {["NOVO", "SEMINOVO", "USADO"].map((condition) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => toggleCondition(condition)}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                    (formData.condicao || []).includes(condition)
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
            <p className="text-xs text-gray-500 mt-1">Se não selecionar, aceita qualquer condição</p>
          </div>

          {/* WhatsApp + Notificação */}
          <div>
            <Label className="text-base font-bold">WhatsApp *</Label>
            <Input
              placeholder="62999998888 (apenas números)"
              value={formData.telefone_contato}
              onChange={(e) =>
                setFormData({ ...formData, telefone_contato: e.target.value.replace(/\D/g, "") })
              }
              maxLength={11}
              className="h-12 text-lg rounded-xl border-2 mt-2"
            />

            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="notificar_whatsapp"
                checked={formData.notificar_whatsapp}
                onChange={(e) => setFormData({ ...formData, notificar_whatsapp: e.target.checked })}
                className="w-4 h-4 accent-green-500"
              />
              <label htmlFor="notificar_whatsapp" className="text-sm text-gray-700 cursor-pointer">
                📱 Receber notificação via WhatsApp quando detectar produto
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Vendedores também podem te chamar quando tiverem o produto
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