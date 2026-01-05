import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Briefcase, Users, Building2, ArrowRight, Sparkles } from "lucide-react";

import FloatingParticles from "@/components/home/FloatingParticles";
import NeonLines from "@/components/home/NeonLines";
import PhoneMockup from "@/components/home/PhoneMockup";
import StatCard from "@/components/home/StatCard";
import FeaturedJobCard from "@/components/home/FeaturedJobCard";
import HowItWorksCard from "@/components/home/HowItWorksCard";

export default function HomeCyberpunk() {
  const navigate = useNavigate();

  // Buscar dados reais
  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs-cyberpunk"],
    queryFn: async () => {
      const result = await base44.entities.Job.filter({ status: "ABERTO" });
      return result.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    }
  });

  const { data: professionals = [] } = useQuery({
    queryKey: ["professionals-cyberpunk"],
    queryFn: () => base44.entities.Professional.filter({ status_cadastro: "APROVADO" })
  });

  const { data: clinics = [] } = useQuery({
    queryKey: ["clinics-cyberpunk"],
    queryFn: () => base44.entities.CompanyUnit.filter({ status_cadastro: "APROVADO" })
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units-cyberpunk", jobs],
    queryFn: async () => {
      if (jobs.length === 0) return [];
      const unitIds = [...new Set(jobs.slice(0, 6).map(j => j.unit_id))];
      const unitPromises = unitIds.map(id =>
        base44.entities.CompanyUnit.filter({ id }).then(res => res[0])
      );
      return (await Promise.all(unitPromises)).filter(Boolean);
    },
    enabled: jobs.length > 0
  });

  const featuredJobs = jobs.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black" />
        <FloatingParticles count={50} />
        <NeonLines />

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-6"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 font-semibold text-sm">
                  {jobs.length > 0 ? `${jobs.length} vagas disponíveis` : '+500 vagas disponíveis'}
                </span>
              </motion.div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                <span className="text-white">O FUTURO DA</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  SAÚDE COMEÇA
                </span>
                <br />
                <span className="text-white">AQUI</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-400 text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
                Conectamos profissionais de saúde às melhores oportunidades. 
                Encontre vagas, clínicas e acelere sua carreira.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(createPageUrl("NewJobs"))}
                  className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  🔍 Buscar Oportunidades
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(createPageUrl("EscolherTipoCadastro"))}
                  className="px-8 py-4 border-2 border-slate-600 text-white font-bold text-lg rounded-2xl hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300"
                >
                  📋 Cadastre-se Grátis
                </motion.button>
              </div>
            </motion.div>

            {/* Right Column - Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:flex justify-center"
            >
              <PhoneMockup />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-cyan-400 rounded-full animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-slate-950" />
        
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              icon={Briefcase}
              value={jobs.length || 523}
              label="Vagas Ativas"
              color="cyan"
              delay={0}
            />
            <StatCard
              icon={Users}
              value={professionals.length || 1247}
              label="Profissionais"
              color="magenta"
              delay={0.1}
            />
            <StatCard
              icon={Building2}
              value={clinics.length || 312}
              label="Clínicas Parceiras"
              color="purple"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ===== FEATURED JOBS SECTION ===== */}
      {featuredJobs.length > 0 && (
        <section className="relative py-20 px-4">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-black" />
          <FloatingParticles count={20} />

          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Vagas em{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Destaque
                </span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                As melhores oportunidades do momento para profissionais de saúde
              </p>
            </motion.div>

            {/* Jobs Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {featuredJobs.map((job, index) => {
                const unit = units.find(u => u?.id === job.unit_id);
                return (
                  <FeaturedJobCard
                    key={job.id}
                    job={job}
                    unit={unit}
                    delay={index * 0.1}
                  />
                );
              })}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(createPageUrl("NewJobs"))}
                className="px-10 py-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
              >
                Ver Todas as Vagas →
              </motion.button>
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-slate-950" />
        <NeonLines />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Como{" "}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Funciona?
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Em 3 passos simples você encontra a oportunidade perfeita
            </p>
          </motion.div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            <HowItWorksCard
              number="1"
              icon="📝"
              title="Cadastre-se"
              description="Crie sua conta gratuitamente e complete seu perfil profissional com suas especialidades e disponibilidade."
              delay={0}
            />
            <HowItWorksCard
              number="2"
              icon="🔍"
              title="Encontre Oportunidades"
              description="Busque vagas compatíveis com seu perfil. Nossa IA encontra as melhores oportunidades para você."
              delay={0.15}
            />
            <HowItWorksCard
              number="3"
              icon="🤝"
              title="Conecte-se"
              description="Entre em contato direto com as clínicas e hospitais. Negocie e comece a trabalhar!"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-black" />
        <FloatingParticles count={30} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-slate-700/50 overflow-hidden"
          >
            {/* Glow effects */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Pronto para{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Começar?
                </span>
              </h2>
              <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                Crie sua conta gratuitamente e encontre oportunidades incríveis na área da saúde
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(createPageUrl("EscolherTipoCadastro"))}
                className="px-12 py-5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300"
              >
                Começar Agora →
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative py-12 px-4 border-t border-slate-800">
        <div className="absolute inset-0 bg-black" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-black text-lg">D</span>
              </div>
              <span className="text-white font-black text-xl">DOUTORIZZE</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-sm">
              <button onClick={() => navigate(createPageUrl("TermosUso"))} className="hover:text-cyan-400 transition-colors">
                Termos de Uso
              </button>
              <button onClick={() => navigate(createPageUrl("PoliticaPrivacidade"))} className="hover:text-cyan-400 transition-colors">
                Privacidade
              </button>
              <button onClick={() => navigate(createPageUrl("Ajuda"))} className="hover:text-cyan-400 transition-colors">
                Ajuda
              </button>
            </div>

            {/* Copyright */}
            <p className="text-slate-500 text-sm">
              © 2026 Doutorizze. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}