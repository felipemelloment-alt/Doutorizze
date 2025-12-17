import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ProfessionalCard from "../components/professionals/ProfessionalCard";
import { motion } from "framer-motion";
import {
  Search,
  Zap,
  Star,
  TrendingUp,
  Sparkles,
  Filter,
  MapPin,
  Briefcase,
  Phone,
  MessageCircle } from
"lucide-react";

export default function NewJobs() {
  const [user, setUser] = useState(null);
  const [newJobsActive, setNewJobsActive] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [activeTab, setActiveTab] = useState("super-jobs");

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

  // Buscar profissionais aprovados
  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const results = await base44.entities.Professional.filter({
        status_cadastro: "APROVADO",
        new_jobs_ativo: true
      });
      return results;
    }
  });

  // Simular matches (em produção, viria do backend)
  const superJobs = professionals.filter((p, idx) => idx % 3 === 0);
  const jobsSemelhante = professionals.filter((p, idx) => idx % 3 === 1);
  const outrasVagas = professionals.filter((p, idx) => idx % 3 === 2);

  const handleToggleNewJobs = async () => {
    setNewJobsActive(!newJobsActive);
    // Atualizar no banco de dados
    // await base44.entities.Dentist.update(user.id, { new_jobs_ativo: !newJobsActive });
  };

  const handleWhatsAppContact = () => {
    // Número de suporte/contato (substitua pelo número real)
    const phoneNumber = "5562999999999"; // Exemplo: +55 62 99999-9999
    const message = encodeURIComponent("Olá! Tenho interesse nas vagas Jobs Semelhante ⭐");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando oportunidades...</p>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 overflow-x-hidden">
      {/* Header */}
      <div className="gradient-yellow-pink py-8 shadow-xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white rounded-2xl shadow-xl">
                <Zap className="w-10 h-10 text-pink-600" />
              </div>
              <div>
                <h1 className="text-[#F9B500] text-4xl md:text-5xl font-black text-shadow-lg">OPORTUNIDADES

                </h1>
                <p className="text-white font-semibold">Encontre seu próximo emprego aqui! 🎯

                </p>
              </div>
            </div>

            {/* Toggle New Jobs */}
            <div className="w-full bg-white rounded-2xl p-6 shadow-xl border-4 border-white">
              <div className="flex items-center gap-4">
                <div>
                  <Label className="text-lg font-bold text-gray-900">
                    Modo NEW JOBS
                  </Label>
                  <p className="text-sm text-gray-600">
                    {newJobsActive ? "Você está visível!" : "Ativar para receber vagas"}
                  </p>
                </div>
                <Switch
                  checked={newJobsActive}
                  onCheckedChange={handleToggleNewJobs}
                  className="data-[state=checked]:bg-green-500 scale-125" />

              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-xl mb-8 border-4 border-[#F9B500]">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Digite a cidade..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-gray-200 rounded-2xl focus:border-[#F9B500]" />

            </div>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Especialidade..."
                value={searchSpecialty}
                onChange={(e) => setSearchSpecialty(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-gray-200 rounded-2xl focus:border-[#F9B500]" />

            </div>
          </div>
          <Button className="w-full mt-4 h-14 gradient-yellow-pink text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border-0">
            <Search className="w-6 h-6 mr-2" />
            Buscar Oportunidades
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard
            icon={Sparkles}
            title="SUPER JOBS"
            count={superJobs.length}
            description="100% compatíveis"
            gradient="from-yellow-400 to-orange-500" />

          <StatCard
            icon={Star}
            title="Jobs Semelhante"
            count={jobsSemelhante.length}
            description="75% compatíveis"
            gradient="from-orange-400 to-pink-500" />

          <StatCard
            icon={TrendingUp}
            title="Outras Vagas"
            count={outrasVagas.length}
            description="Disponíveis agora"
            gradient="from-blue-400 to-purple-500" />

        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto p-2 bg-white rounded-2xl shadow-lg gap-2">
            <TabsTrigger
              value="super-jobs"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-orange-500 data-[state=active]:text-white font-bold text-sm md:text-lg py-3 md:py-4 rounded-xl flex items-center justify-center">

              <Sparkles className="w-5 h-5 mr-2" />
              SUPER JOBS
            </TabsTrigger>
            <TabsTrigger
              value="semelhante"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-500 data-[state=active]:text-white font-bold text-sm md:text-lg py-3 md:py-4 rounded-xl flex items-center justify-center">

              <Star className="w-5 h-5 mr-2" />
              Semelhante
            </TabsTrigger>
            <TabsTrigger
              value="outras"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-purple-500 data-[state=active]:text-white font-bold text-sm md:text-lg py-3 md:py-4 rounded-xl flex items-center justify-center">

              <TrendingUp className="w-5 h-5 mr-2" />
              Outras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="super-jobs" className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 border-4 border-[#F9B500]">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-yellow-600" />
                <h2 className="text-2xl font-black text-gray-900">
                  SUPER JOBS - Matches Perfeitos! 🌟
                </h2>
              </div>
              <p className="text-gray-700 font-semibold">
                Estas vagas são 100% compatíveis com seu perfil!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {superJobs.map((professional) =>
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                type="DENTISTA"
                onClick={(p) => console.log("Ver detalhes:", p)} />

              )}
            </div>

            {superJobs.length === 0 &&
            <EmptyState
              icon={Sparkles}
              title="Nenhum SUPER JOB no momento"
              description="Ative o modo NEW JOBS para começar a receber oportunidades!" />

            }
          </TabsContent>

          <TabsContent value="semelhante" className="space-y-6">
            <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-6 border-4 border-[#E94560]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-8 h-8 text-orange-600" />
                    <h2 className="text-2xl font-black text-gray-900">
                      Jobs Semelhante ⭐
                    </h2>
                  </div>
                  <p className="text-gray-700 font-semibold">
                    Vagas com 75% de compatibilidade
                  </p>
                </div>
                
                {/* Botão WhatsApp */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWhatsAppContact}
                  className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-3 bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all font-bold">

                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Dúvidas sobre estas vagas?</p>
                    <p className="text-xs opacity-90">Fale conosco no WhatsApp</p>
                  </div>
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {jobsSemelhante.map((professional) =>
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                type="DENTISTA"
                onClick={(p) => console.log("Ver detalhes:", p)} />

              )}
            </div>

            {jobsSemelhante.length === 0 &&
            <EmptyState
              icon={Star}
              title="Nenhuma vaga semelhante no momento"
              description="Continue atualizando seu perfil para receber mais oportunidades!" />

            }
          </TabsContent>

          <TabsContent value="outras" className="space-y-6">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 border-4 border-[#4A90E2]">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-black text-gray-900">
                  Outras Oportunidades
                </h2>
              </div>
              <p className="text-gray-700 font-semibold">
                Explore mais vagas disponíveis
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {outrasVagas.map((professional) =>
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                type="DENTISTA"
                onClick={(p) => console.log("Ver detalhes:", p)} />

              )}
            </div>

            {outrasVagas.length === 0 &&
            <EmptyState
              icon={TrendingUp}
              title="Nenhuma outra vaga no momento"
              description="Novas oportunidades aparecem todos os dias. Volte em breve!" />

            }
          </TabsContent>
        </Tabs>
      </div>
    </div>);

}

function StatCard({ icon: Icon, title, count, description, gradient }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100 hover:border-[#F9B500] hover:shadow-2xl transition-all">

      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-4xl font-black gradient-yellow-pink bg-clip-text text-transparent">
          {count}
        </span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 font-semibold">{description}</p>
    </motion.div>);

}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="bg-white rounded-3xl p-12 text-center shadow-xl border-4 border-gray-100">
      <Icon className="w-20 h-20 mx-auto mb-6 text-gray-300" />
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 font-semibold">{description}</p>
    </div>);

}