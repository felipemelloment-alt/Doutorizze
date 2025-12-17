import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Star,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 pt-8 pb-12">
        {/* Círculos de blur decorativos */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
          {/* Coluna Esquerda - Conteúdo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}>

            {/* Badge de destaque */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-semibold text-sm mb-6">
              🔥 +500 vagas disponíveis
            </div>

            {/* Título Principal */}
            <h4 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-6">
              OPORTUNIDADES
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                NA SAÚDE
              </span>
            </h4>

            {/* Subtítulo */}
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              Conectamos profissionais de saúde às melhores oportunidades. Encontre vagas, clínicas e cresça na carreira!
            </p>

            {/* Botões CTA */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => navigate(createPageUrl("NewJobs"))}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                🔍 Buscar Oportunidades
              </button>
              <button
                onClick={() => navigate(createPageUrl("EscolherTipoCadastro"))}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold text-lg rounded-2xl hover:border-yellow-400 hover:text-yellow-600 transition-all flex items-center justify-center gap-2">
                📋 Cadastre-se Grátis
              </button>
            </div>

            {/* Stats em linha */}
            <div className="flex flex-wrap gap-6">
              <div className="text-center">
                <p className="text-3xl font-black text-gray-900">500+</p>
                <p className="text-sm text-gray-500">Vagas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-gray-900">1.2k</p>
                <p className="text-sm text-gray-500">Profissionais</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-gray-900">300+</p>
                <p className="text-sm text-gray-500">Clínicas</p>
              </div>
            </div>
          </motion.div>

          {/* Coluna Direita - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block">

            {/* Megafone Rosa */}
            <motion.div
              animate={{
                rotate: [0, 10, 0, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute top-10 right-0 text-6xl animate-pulse">
              📣
            </motion.div>

            {/* Bolha "Nova vaga disponível!" */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-4 -left-8 bg-white rounded-2xl p-4 shadow-xl animate-bounce">
              <div className="flex items-center gap-2">
                <div className="text-2xl">💼</div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Nova vaga!</p>
                  <p className="text-xs text-gray-500">Ortodontia</p>
                </div>
              </div>
            </motion.div>

            {/* Bolha "Match perfeito!" */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
              className="absolute bottom-20 -right-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="text-2xl">✨</div>
                <div>
                  <p className="text-xs font-bold">Match perfeito!</p>
                  <p className="text-xs text-white/80">98% compatível</p>
                </div>
              </div>
            </motion.div>

            {/* Mockup do Phone */}
            <div className="relative mx-auto w-full max-w-[320px] h-[600px] bg-white rounded-[3rem] shadow-2xl border-8 border-gray-800 p-4 overflow-hidden">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-gray-800 rounded-full"></div>
              <div className="w-full h-full bg-gradient-to-br from-yellow-50 to-pink-50 rounded-[2rem] overflow-hidden mt-6">
                {/* Header */}
                <div className="bg-white p-4 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 gradient-yellow-pink rounded-lg"></div>
                    <span className="font-bold text-gray-900">NEW JOBS</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar vagas..."
                      className="w-full px-4 py-2 border-2 border-yellow-300 rounded-full text-sm"
                      readOnly />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-400 w-8 h-8 rounded-full flex items-center justify-center">
                      <span className="text-white">🔍</span>
                    </div>
                  </div>
                </div>

                {/* Professional Cards */}
                <div className="p-4 space-y-3 overflow-hidden">
                  <MiniProfessionalCard name="Dr. João Silva" specialty="Ortodontia" rating={5} />
                  <MiniProfessionalCard name="Dra. Maria Santos" specialty="Endodontia" rating={5} />
                  <MiniProfessionalCard name="Dr. Pedro Costa" specialty="Implantodontia" rating={5} />
                </div>

                {/* Bottom Section */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white rounded-2xl p-3 shadow-lg">
                    <p className="text-xs font-bold text-center gradient-yellow-pink bg-clip-text text-transparent">
                      +200 profissionais disponíveis
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Seção Stats/Números */}
      <div className="bg-white rounded-3xl shadow-xl mx-4 p-6 -mt-6 relative z-20 mb-12">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xl">
              💼
            </div>
            <p className="text-2xl md:text-3xl font-black text-gray-900">523</p>
            <p className="text-xs md:text-sm text-gray-500">Vagas Ativas</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl">
              👨‍⚕️
            </div>
            <p className="text-2xl md:text-3xl font-black text-gray-900">1.247</p>
            <p className="text-xs md:text-sm text-gray-500">Profissionais</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white text-xl">
              🏥
            </div>
            <p className="text-2xl md:text-3xl font-black text-gray-900">312</p>
            <p className="text-xs md:text-sm text-gray-500">Clínicas</p>
          </div>
        </div>
      </div>

      {/* Seção Como Funciona */}
      <div className="px-4 py-16">
        <h2 className="text-3xl font-black text-center text-gray-900 mb-4">Como Funciona?</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Em 3 passos simples você encontra a oportunidade perfeita
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Passo 1 */}
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center relative group hover:shadow-2xl hover:scale-105 transition-all">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black rounded-full flex items-center justify-center shadow-lg">
              1
            </div>
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center text-4xl">
              📝
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Crie seu Perfil</h3>
            <p className="text-gray-600">Cadastre-se gratuitamente e complete seu perfil profissional</p>
          </div>

          {/* Passo 2 */}
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center relative group hover:shadow-2xl hover:scale-105 transition-all">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black rounded-full flex items-center justify-center shadow-lg">
              2
            </div>
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-4xl">
              🔍
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Encontre Vagas</h3>
            <p className="text-gray-600">Busque oportunidades compatíveis com seu perfil</p>
          </div>

          {/* Passo 3 */}
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center relative group hover:shadow-2xl hover:scale-105 transition-all">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black rounded-full flex items-center justify-center shadow-lg">
              3
            </div>
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-4xl">
              🤝
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Conecte-se</h3>
            <p className="text-gray-600">Entre em contato direto com as clínicas</p>
          </div>
        </div>
      </div>

      {/* Seção Para Clínicas */}
      <div className="bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 rounded-3xl mx-4 p-8 md:p-12 relative overflow-hidden mb-16">
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
          {/* Coluna texto */}
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Encontre os Melhores Profissionais
            </h2>
            <p className="text-white/90 mb-6">
              Conecte-se com dentistas e médicos qualificados para sua clínica
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5" />
                <span>Publique vagas ilimitadas</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5" />
                <span>Acesse perfis verificados</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5" />
                <span>Contrate com segurança</span>
              </div>
            </div>
            <button
              onClick={() => navigate(createPageUrl("CadastroClinica"))}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-pink-600 font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              Cadastrar Clínica →
            </button>
          </div>

          {/* Coluna imagem */}
          <div className="hidden md:block">
            <div className="text-9xl text-center">🏥</div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl mx-4 p-8 md:p-12 text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          Pronto para Começar?
        </h2>
        <p className="text-white/90 mb-8 max-w-2xl mx-auto">
          Crie sua conta gratuitamente e encontre oportunidades incríveis
        </p>
        <button
          onClick={() => navigate(createPageUrl("EscolherTipoCadastro"))}
          className="inline-flex items-center gap-2 px-10 py-5 bg-white text-orange-600 font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
          Começar Agora →
        </button>
      </div>
    </div>
  );
}

function MiniProfessionalCard({ name, specialty, rating }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl p-3 shadow-xl hover:shadow-2xl border-2 border-gray-100 hover:border-[#F9B500] transition-all flex items-center gap-3">
      <div className="w-12 h-12 rounded-full gradient-yellow-pink flex items-center justify-center text-white font-bold">
        {name[4]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-600 truncate">{specialty}</p>
        <div className="flex gap-0.5 mt-1">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <button className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
          📞
        </button>
      </div>
    </motion.div>
  );
}