import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageCircle, MapPin, DollarSign, Eye, Radar } from "lucide-react";

export default function RadarInterestsModal({ open, onOpenChange, interests, productName }) {
  const averagePrice = interests.length > 0
    ? Math.round(
        interests
          .filter((i) => i.preco_maximo)
          .reduce((sum, i) => sum + i.preco_maximo, 0) /
          interests.filter((i) => i.preco_maximo).length
      )
    : 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleContactInterested = (interest) => {
    const message = encodeURIComponent(
      `Olá! Vi que você está procurando: ${interest.nome_produto}. Tenho esse produto disponível!`
    );
    window.open(`https://wa.me/55${interest.telefone_contato}?text=${message}`, "_blank");
  };

  const handleContactAll = () => {
    const message = encodeURIComponent(
      `Olá! Vi que você está procurando: ${productName}. Acabei de anunciar esse produto!`
    );
    // Abre o WhatsApp Web para cada interessado (pode ajustar a estratégia)
    interests.forEach((interest, index) => {
      setTimeout(() => {
        window.open(`https://wa.me/55${interest.telefone_contato}?text=${message}`, "_blank");
      }, index * 1000); // Delay de 1s entre cada abertura
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black">
                Interessados no Radar 🎯
              </DialogTitle>
              <DialogDescription className="text-base">
                {interests.length} {interests.length === 1 ? "pessoa está" : "pessoas estão"} procurando
                este produto!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-3xl font-black gradient-yellow-pink bg-clip-text text-transparent">
                  {interests.length}
                </p>
                <p className="text-sm font-semibold text-gray-600">
                  Interessados
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 shadow-lg">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-3xl font-black text-green-600">
                  {averagePrice > 0 ? formatPrice(averagePrice) : "N/A"}
                </p>
                <p className="text-sm font-semibold text-gray-600">
                  Preço Médio Esperado
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 shadow-lg">
              <CardContent className="p-4 text-center">
                <Radar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-3xl font-black text-blue-600">
                  {interests.filter((i) => i.ativo).length}
                </p>
                <p className="text-sm font-semibold text-gray-600">
                  Radares Ativos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact All Button */}
          {interests.length > 0 && (
            <Button
              onClick={handleContactAll}
              className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <MessageCircle className="w-6 h-6 mr-2" />
              Chamar Todos os Interessados no WhatsApp
            </Button>
          )}

          {/* Info Box */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Eye className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-purple-900 mb-1">💡 Dica</h4>
                <p className="text-sm text-purple-700">
                  O preço médio esperado pelos interessados é{" "}
                  <strong>{averagePrice > 0 ? formatPrice(averagePrice) : "não disponível"}</strong>.
                  Use essa informação para definir um preço competitivo!
                </p>
              </div>
            </div>
          </div>

          {/* List of Interests */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">Lista de Interessados</h3>
            {interests.map((interest) => (
              <Card key={interest.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full gradient-yellow-pink flex items-center justify-center text-white text-xl font-bold">
                          {interest.interessado_nome?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-900">
                            {interest.interessado_nome}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {interest.interessado_tipo === "DENTISTA" && "Dentista"}
                            {interest.interessado_tipo === "MEDICO" && "Médico"}
                            {interest.interessado_tipo === "CLINICA" && "Clínica"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {interest.preco_maximo && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">
                              Preço máximo:{" "}
                              <strong className="text-green-600">
                                {formatPrice(interest.preco_maximo)}
                              </strong>
                            </span>
                          </div>
                        )}

                        {interest.localizacao_preferida && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-600" />
                            <span className="text-sm text-gray-700">
                              Localização preferida:{" "}
                              <strong>{interest.localizacao_preferida}</strong>
                            </span>
                          </div>
                        )}

                        {interest.condicao_preferida &&
                          interest.condicao_preferida.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700">Condições:</span>
                              <div className="flex gap-1">
                                {interest.condicao_preferida.map((cond) => (
                                  <Badge
                                    key={cond}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {cond === "NOVO" && "Novo"}
                                    {cond === "SEMINOVO" && "Seminovo"}
                                    {cond === "USADO" && "Usado"}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                        {interest.observacoes && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-700">
                              <strong>Observações:</strong> {interest.observacoes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Action */}
                    <Button
                      onClick={() => handleContactInterested(interest)}
                      className="bg-gradient-to-r from-green-400 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Chamar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}