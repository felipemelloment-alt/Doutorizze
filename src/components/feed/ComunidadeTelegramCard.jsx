import React from "react";
import { MessageCircle, Users, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ComunidadeTelegramCard() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
          <MessageCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-black text-xl">COMUNIDADE EXCLUSIVA</h3>
          <p className="text-white/80 text-sm">Grupo Telegram Doutorizze</p>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Dicas de IA para profissionais</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Vídeos explicativos exclusivos</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4" />
          <span>Networking com colegas</span>
        </div>
      </div>

      <button
        onClick={() => navigate(createPageUrl("MeuPerfil") + "?tab=comunidade")}
        className="w-full py-3 bg-white text-purple-600 font-black rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-lg"
      >
        <MessageCircle className="w-5 h-5" />
        QUERO PARTICIPAR
      </button>
    </div>
  );
}