import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Radar, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function RadarActivateButton({ tipo_mundo, searchTerm, onActivate }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome_produto: searchTerm || "",
    preco_maximo: "",
    localizacao_preferida: "",
    condicao_preferida: ["NOVO", "SEMINOVO", "USADO"],
    telefone_contato: "",
    detalhes_adicionais: "",
  });

  const handleCheckboxChange = (condicao, checked) => {
    if (checked) {
      setFormData({
        ...formData,
        condicao_preferida: [...formData.condicao_preferida, condicao],
      });
    } else {
      setFormData({
        ...formData,
        condicao_preferida: formData.condicao_preferida.filter((c) => c !== condicao),
      });
    }
  };

  const handleSubmit = () => {
    if (!formData.nome_produto || !formData.telefone_contato) {
      alert("Preencha os campos obrigatórios!");
      return;
    }
    onActivate?.({
      ...formData,
      tipo_mundo,
      preco_maximo: formData.preco_maximo ? parseFloat(formData.preco_maximo) : null,
    });
    setOpen(false);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={() => setOpen(true)}
          size="lg"
          className="w-full h-16 bg-gradient-to-r from-green-400 to-emerald-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all"
        >
          <Radar className="w-6 h-6 mr-3 animate-pulse" />
          🎯 Ativar Radar para este Produto
          <Zap className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Radar className="w-6 h-6 text-green-600" />
              </div>
              Ativar Radar de Produto
            </DialogTitle>
            <DialogDescription className="text-base">
              Quando alguém anunciar este produto, você será notificado imediatamente! 🚀
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label className="text-base font-bold">
                Produto que você procura *
              </Label>
              <Input
                placeholder="Ex: Cadeira Odontológica"
                value={formData.nome_produto}
                onChange={(e) =>
                  setFormData({ ...formData, nome_produto: e.target.value })
                }
                className="h-14 text-lg rounded-xl border-2 mt-2"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-base font-bold">Preço máximo (R$)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 15000"
                  value={formData.preco_maximo}
                  onChange={(e) =>
                    setFormData({ ...formData, preco_maximo: e.target.value })
                  }
                  className="h-14 text-lg rounded-xl border-2 mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-bold">Localização preferida</Label>
                <Input
                  placeholder="Ex: Goiânia - GO"
                  value={formData.localizacao_preferida}
                  onChange={(e) =>
                    setFormData({ ...formData, localizacao_preferida: e.target.value })
                  }
                  className="h-14 text-lg rounded-xl border-2 mt-2"
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-bold mb-3 block">
                Condição aceita
              </Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="novo"
                    checked={formData.condicao_preferida.includes("NOVO")}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("NOVO", checked)
                    }
                  />
                  <Label htmlFor="novo" className="cursor-pointer">
                    Novo
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="seminovo"
                    checked={formData.condicao_preferida.includes("SEMINOVO")}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("SEMINOVO", checked)
                    }
                  />
                  <Label htmlFor="seminovo" className="cursor-pointer">
                    Seminovo
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="usado"
                    checked={formData.condicao_preferida.includes("USADO")}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("USADO", checked)
                    }
                  />
                  <Label htmlFor="usado" className="cursor-pointer">
                    Usado
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-bold">WhatsApp para contato *</Label>
              <Input
                placeholder="62999998888"
                value={formData.telefone_contato}
                onChange={(e) =>
                  setFormData({ ...formData, telefone_contato: e.target.value })
                }
                maxLength={11}
                className="h-14 text-lg rounded-xl border-2 mt-2"
              />
            </div>

            <div>
              <Label className="text-base font-bold">
                Detalhes adicionais (opcional)
              </Label>
              <Textarea
                placeholder="Marca preferida, características específicas, etc."
                value={formData.detalhes_adicionais}
                onChange={(e) =>
                  setFormData({ ...formData, detalhes_adicionais: e.target.value })
                }
                className="min-h-24 text-lg rounded-xl border-2 mt-2"
              />
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Como funciona o Radar?
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✅ Você receberá notificação quando alguém anunciar</li>
                <li>✅ Vendedores verão que você está interessado</li>
                <li>✅ Você pode ajustar ou desativar a qualquer momento</li>
                <li>✅ Totalmente gratuito!</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 h-14 rounded-xl font-bold text-lg"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 h-14 bg-gradient-to-r from-green-400 to-emerald-600 text-white font-bold text-lg rounded-xl"
              >
                <Radar className="w-5 h-5 mr-2" />
                Ativar Radar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}