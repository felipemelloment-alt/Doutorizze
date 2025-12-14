import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, MapPin, DollarSign, TrendingUp, MessageCircle } from "lucide-react";

export default function RadarInterested({ interessados = [] }) {
  if (!interessados || interessados.length === 0) return null;

  const precoMedio = interessados
    .filter((i) => i.preco_maximo)
    .reduce((sum, i) => sum + i.preco_maximo, 0) / interessados.filter((i) => i.preco_maximo).length || 0;

  const handleContactAll = () => {
    const message = encodeURIComponent(
      "Olá! Vi que você está procurando este produto no Radar. Acabei de anunciar, confira!"
    );
    
    interessados.forEach((interessado) => {
      if (interessado.telefone_contato) {
        window.open(
          `https://wa.me/55${interessado.telefone_contato}?text=${message}`,
          "_blank"
        );
      }
    });
  };

  const handleContactOne = (telefone) => {
    const message = encodeURIComponent(
      "Olá! Vi que você está procurando este produto no Radar. Acabei de anunciar, confira!"
    );
    window.open(`https://wa.me/55${telefone}?text=${message}`, "_blank");
  };

  return (
    <Card className="border-4 border-green-400 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-green-900">
                🎯 {interessados.length} {interessados.length === 1 ? "Pessoa" : "Pessoas"} no Radar!
              </CardTitle>
              <p className="text-green-700 font-semibold">
                Estes usuários estão procurando este produto
              </p>
            </div>
          </div>
          <Button
            onClick={handleContactAll}
            className="bg-gradient-to-r from-green-400 to-emerald-600 text-white font-bold"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Contatar Todos
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 font-semibold">Interessados</span>
            </div>
            <p className="text-3xl font-black text-green-600">{interessados.length}</p>
          </div>

          {precoMedio > 0 && (
            <div className="bg-white rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600 font-semibold">Preço Médio</span>
              </div>
              <p className="text-2xl font-black text-green-600">
                R$ {precoMedio.toFixed(0)}
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 font-semibold">Faixa de Preço</span>
            </div>
            <p className="text-lg font-black text-green-600">
              R$ {Math.min(...interessados.filter(i => i.preco_maximo).map(i => i.preco_maximo)) || 0} - 
              R$ {Math.max(...interessados.filter(i => i.preco_maximo).map(i => i.preco_maximo)) || 0}
            </p>
          </div>
        </div>

        {/* Lista de Interessados */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 text-lg mb-3">Lista de Interessados:</h4>
          {interessados.map((interessado, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-green-400 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                      {interessado.usuario_nome?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {interessado.usuario_nome || "Anônimo"}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {interessado.usuario_tipo}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    {interessado.preco_maximo && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">
                          Até <span className="font-bold">R$ {interessado.preco_maximo}</span>
                        </span>
                      </div>
                    )}
                    {interessado.localizacao_preferida && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-700">{interessado.localizacao_preferida}</span>
                      </div>
                    )}
                  </div>

                  {interessado.condicao_preferida && interessado.condicao_preferida.length > 0 && (
                    <div className="flex gap-2">
                      {interessado.condicao_preferida.map((cond) => (
                        <Badge
                          key={cond}
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700 border-green-300"
                        >
                          {cond === "NOVO" && "Novo"}
                          {cond === "SEMINOVO" && "Seminovo"}
                          {cond === "USADO" && "Usado"}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {interessado.detalhes_adicionais && (
                    <p className="text-sm text-gray-600 italic">
                      "{interessado.detalhes_adicionais}"
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleContactOne(interessado.telefone_contato)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contatar
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mt-4">
          <p className="text-sm text-yellow-800">
            💡 <strong>Dica:</strong> Entre em contato com os interessados e ofereça seu produto. 
            Eles estão aguardando ativamente por esta oportunidade!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}