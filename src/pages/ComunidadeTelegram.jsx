import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { MessageCircle, Users, Zap, TrendingUp, ChevronRight, ExternalLink } from "lucide-react";

export default function ComunidadeTelegram() {
  const [user, setUser] = useState(null);
  const [userArea, setUserArea] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserArea = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Detectar área do usuário
        let area = currentUser?.vertical;
        
        if (!area && currentUser?.role === "admin") {
          area = "AMBOS";
        }
        
        if (!area) {
          // Tentar detectar pela entidade do usuário
          const [prof, clinic, hospital] = await Promise.all([
            base44.entities.Professional.filter({ user_id: currentUser.id }).catch(() => []),
            base44.entities.CompanyUnit.filter({}).catch(() => []),
            base44.entities.Hospital.filter({ user_id: currentUser.id }).catch(() => [])
          ]);
          
          if (prof[0]) area = prof[0].tipo_profissional === "DENTISTA" ? "ODONTOLOGIA" : "MEDICINA";
          else if (clinic[0]) area = clinic[0].tipo_mundo;
          else if (hospital[0]) area = "MEDICINA";
        }
        
        setUserArea(area || "ODONTOLOGIA");
      } catch (error) {
        setUserArea("ODONTOLOGIA");
      }
      setLoading(false);
    };
    
    loadUserArea();
  }, []);

  const grupoTelegram = {
    ODONTOLOGIA: {
      id: import.meta.env.VITE_TELEGRAM_GRUPO_ODONTO_ID || "-1002359866821",
      nome: "Comunidade Doutorizze - Odontologia 🦷",
      descricao: "Grupo exclusivo para dentistas, clínicas odontológicas e profissionais da área.",
      icone: "🦷",
      cor: "from-yellow-400 to-orange-500",
      corTexto: "text-orange-600"
    },
    MEDICINA: {
      id: import.meta.env.VITE_TELEGRAM_GRUPO_MEDICINA_ID || "-1002293506112",
      nome: "Comunidade Doutorizze - Medicina 🩺",
      descricao: "Grupo exclusivo para médicos, hospitais, clínicas médicas e profissionais da área.",
      icone: "🩺",
      cor: "from-blue-400 to-purple-500",
      corTexto: "text-purple-600"
    },
    AMBOS: {
      id: import.meta.env.VITE_TELEGRAM_GRUPO_ODONTO_ID || "-1002359866821",
      nome: "Comunidade Doutorizze 🏥",
      descricao: "Comunidades exclusivas para profissionais da saúde.",
      icone: "🏥",
      cor: "from-pink-400 to-purple-500",
      corTexto: "text-pink-600"
    }
  };

  const grupo = grupoTelegram[userArea] || grupoTelegram.ODONTOLOGIA;
  const linkGrupo = `https://t.me/c/${grupo.id.replace('-100', '')}/1`;

  const beneficios = [
    { icone: "💼", titulo: "Vagas Exclusivas", desc: "Oportunidades compartilhadas primeiro no grupo" },
    { icone: "🤝", titulo: "Networking", desc: "Conecte-se com profissionais da sua área" },
    { icone: "💡", titulo: "Dicas & Insights", desc: "Aprenda com experiências de outros profissionais" },
    { icone: "🎯", titulo: "Avisos em Tempo Real", desc: "Seja notificado instantaneamente sobre novidades" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando comunidade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-2xl">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Comunidade Telegram
          </h1>
          <p className="text-lg text-gray-600">
            Faça parte da maior comunidade de profissionais da saúde
          </p>
        </motion.div>

        {/* Card Principal do Grupo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6"
        >
          <div className={`bg-gradient-to-r ${grupo.cor} p-8 text-white`}>
            <div className="text-6xl mb-4">{grupo.icone}</div>
            <h2 className="text-3xl font-black mb-2">{grupo.nome}</h2>
            <p className="text-white/90 text-lg">{grupo.descricao}</p>
          </div>

          <div className="p-8">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-gray-900">500+</p>
                <p className="text-sm text-gray-600">Membros Ativos</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-gray-900">24/7</p>
                <p className="text-sm text-gray-600">Sempre Ativo</p>
              </div>
            </div>

            {/* Benefícios */}
            <h3 className="text-xl font-black text-gray-900 mb-4">Por que entrar?</h3>
            <div className="space-y-3 mb-8">
              {beneficios.map((beneficio, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="text-3xl">{beneficio.icone}</div>
                  <div>
                    <h4 className="font-bold text-gray-900">{beneficio.titulo}</h4>
                    <p className="text-sm text-gray-600">{beneficio.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Botão Principal */}
            <a
              href={linkGrupo}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full py-5 px-6 bg-gradient-to-r ${grupo.cor} text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all text-center`}
            >
              <div className="flex items-center justify-center gap-3">
                <MessageCircle className="w-6 h-6" />
                <span>Entrar no Grupo do Telegram</span>
                <ExternalLink className="w-5 h-5" />
              </div>
            </a>

            <p className="text-center text-xs text-gray-500 mt-4">
              Ao clicar você será redirecionado para o Telegram
            </p>
          </div>
        </motion.div>

        {/* Admin: Ambos os Grupos */}
        {userArea === "AMBOS" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 gap-4"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-4xl mb-3">🦷</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Grupo Odontologia</h3>
              <a
                href={`https://t.me/c/${grupoTelegram.ODONTOLOGIA.id.replace('-100', '')}/1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold text-sm"
              >
                Acessar <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-4xl mb-3">🩺</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Grupo Medicina</h3>
              <a
                href={`https://t.me/c/${grupoTelegram.MEDICINA.id.replace('-100', '')}/1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold text-sm"
              >
                Acessar <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}

        {/* Info Extra */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 text-center"
        >
          <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
          <p className="text-yellow-800 font-semibold">
            <strong>Dica:</strong> Ative as notificações do grupo para não perder nenhuma oportunidade!
          </p>
        </motion.div>
      </div>
    </div>
  );
}