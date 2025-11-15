import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Megaphone,
  Briefcase,
  Star,
  Users,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle } from
"lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Implementar verificação de autenticação
      setIsAuthenticated(false);
    };
    checkAuth();
  }, []);

  const features = [
  {
    icon: Briefcase,
    title: "SUPER JOBS",
    description: "Vagas 100% compatíveis com seu perfil",
    color: "from-yellow-400 to-orange-500"
  },
  {
    icon: Users,
    title: "Networking",
    description: "Conecte-se com profissionais da sua área",
    color: "from-blue-400 to-purple-500"
  },
  {
    icon: Star,
    title: "Avaliações",
    description: "Sistema de reputação confiável",
    color: "from-pink-400 to-red-500"
  },
  {
    icon: TrendingUp,
    title: "Matching Inteligente",
    description: "Algoritmo que encontra as melhores oportunidades",
    color: "from-green-400 to-teal-500"
  }];


  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-400 rounded-full blur-2xl opacity-25"></div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}>

              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gradient-to-br from-pink-500 to-red-600 p-4 rounded-2xl shadow-xl">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900">NEW JOBS</h1>
                  <p className="text-sm text-gray-600">Plataforma de Saúde</p>
                </div>
              </div>

              {/* Main Title */}
              <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                <span className="text-yellow-400 text-shadow-lg">OPORTUNIDADES</span>
              </h2>

              <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8 border-4 border-yellow-400">
                <h3 className="text-3xl md:text-4xl font-black mb-4">
                  SEU NOVO
                  <br />
                  <span className="bg-clip-text text-red-600 gradient-yellow-pink">EMPREGO

                  </span>
                  <br />
                  ESTÁ{" "}
                  <span className="text-yellow-400">
                    AQUI!!!
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="inline-block">

                      🎯
                    </motion.span>
                  </span>
                </h3>

                <div className="flex flex-wrap gap-3 mb-6">
                  <Badge text="Dentistas" color="yellow" />
                  <Badge text="Médicos" color="pink" />
                  <Badge text="Clínicas" color="blue" />
                </div>

                <Button
                  size="lg"
                  onClick={() => navigate(createPageUrl("NewJobs"))}
                  className="w-full gradient-yellow-pink text-white font-bold text-lg py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105">

                  <Zap className="w-6 h-6 mr-2" />
                  Encontrar Oportunidades Agora
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard number="500+" label="Vagas Ativas" />
                <StatCard number="1.2K+" label="Profissionais" />
                <StatCard number="98%" label="Satisfação" />
              </div>
            </motion.div>

            {/* Right Content - Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative">

              {/* Megaphone Decoration */}
              <motion.div
                animate={{
                  rotate: [0, 10, 0, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -left-16 top-1/4 z-20">

                <Megaphone className="w-32 h-32 text-pink-500 megaphone-icon" />
              </motion.div>

              {/* Chat Bubbles */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-10 -left-8 z-10">

                <div className="chat-bubble-blue">
                  <p className="text-sm font-semibold">Nova vaga disponível! 🎉</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
                className="absolute bottom-20 -right-8 z-10">

                <div className="chat-bubble-blue">
                  <p className="text-sm font-semibold">Match perfeito! ⚡</p>
                </div>
              </motion.div>

              {/* Phone Mockup */}
              <div className="relative mx-auto w-80 h-[600px] bg-white rounded-[3rem] shadow-2xl border-8 border-gray-800 p-4">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-[2rem] overflow-hidden">
                  {/* Header */}
                  <div className="bg-white p-4 shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 gradient-yellow-pink rounded-lg"></div>
                      <span className="font-bold text-gray-900">NEW JOBS</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="especialidade"
                        className="w-full px-4 py-2 border-2 border-pink-300 rounded-full text-sm"
                        readOnly />

                      <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-pink-500 w-8 h-8 rounded-full flex items-center justify-center">
                        <span className="text-white">🔍</span>
                      </div>
                    </div>
                  </div>

                  {/* Professional Cards */}
                  <div className="p-4 space-y-3 overflow-hidden">
                    <MiniProfessionalCard
                      name="Dr. João Silva"
                      specialty="Ortodontia"
                      rating={5} />

                    <MiniProfessionalCard
                      name="Dra. Maria Santos"
                      specialty="Endodontia"
                      rating={5} />

                    <MiniProfessionalCard
                      name="Dr. Pedro Costa"
                      specialty="Implantodontia"
                      rating={5} />

                  </div>

                  {/* Bottom Section */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white rounded-2xl p-3 shadow-lg">
                      <p className="text-xs font-bold text-center gradient-yellow-pink bg-clip-text text-transparent">
                        Disponíveis recomendados
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-center mb-16">

            Por que escolher a{" "}
            <span className="bg-clip-text text-orange-600 gradient-yellow-pink">NEW JOBS?

            </span>
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) =>
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="text-center">

                <div
                className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-xl`}>

                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 gradient-yellow-pink relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 text-shadow-lg">
              Pronto para começar?
            </h2>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de profissionais e clínicas que já encontraram
              oportunidades incríveis!
            </p>
            <Button
              size="lg"
              onClick={() => navigate(createPageUrl("NewJobs"))}
              className="bg-white text-pink-600 font-bold text-lg py-6 px-12 rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105">

              Criar Minha Conta Grátis
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>);

}

function Badge({ text, color }) {
  const colorClasses = {
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
    pink: "bg-pink-100 text-pink-800 border-pink-300",
    blue: "bg-blue-100 text-blue-800 border-blue-300"
  };

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${colorClasses[color]}`}>

      {text}
    </span>);

}

function StatCard({ number, label }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg text-center border-2 border-gray-100 hover:border-yellow-400 transition-all">
      <p className="text-2xl font-black gradient-yellow-pink bg-clip-text text-transparent">
        {number}
      </p>
      <p className="text-xs text-gray-600 font-semibold">{label}</p>
    </div>);

}

function MiniProfessionalCard({ name, specialty, rating }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl p-3 shadow-md border-2 border-gray-100 flex items-center gap-3">

      <div className="w-12 h-12 rounded-full gradient-yellow-pink flex items-center justify-center text-white font-bold">
        {name[4]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-600 truncate">{specialty}</p>
        <div className="flex gap-0.5 mt-1">
          {[...Array(rating)].map((_, i) =>
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <button className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
          📞
        </button>
      </div>
    </motion.div>);

}