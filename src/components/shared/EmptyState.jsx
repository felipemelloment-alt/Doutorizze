import React from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Search, 
  Bell, 
  Heart, 
  MessageCircle, 
  FileText,
  Users,
  Calendar,
  ShoppingBag,
  Star,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";

const emptyStateConfigs = {
  vagas: {
    icon: Briefcase,
    title: "Nenhuma vaga encontrada",
    description: "Não há vagas disponíveis no momento. Tente ajustar seus filtros ou volte mais tarde.",
    actionText: "Limpar filtros",
    color: "blue"
  },
  busca: {
    icon: Search,
    title: "Nenhum resultado",
    description: "Não encontramos resultados para sua busca. Tente termos diferentes.",
    actionText: "Nova busca",
    color: "purple"
  },
  notificacoes: {
    icon: Bell,
    title: "Sem notificações",
    description: "Você está em dia! Novas notificações aparecerão aqui.",
    actionText: null,
    color: "yellow"
  },
  favoritos: {
    icon: Heart,
    title: "Nenhum favorito",
    description: "Salve vagas e profissionais favoritos para acessar rapidamente.",
    actionText: "Explorar vagas",
    color: "pink"
  },
  mensagens: {
    icon: MessageCircle,
    title: "Sem mensagens",
    description: "Suas conversas aparecerão aqui quando você entrar em contato com alguém.",
    actionText: null,
    color: "green"
  },
  candidaturas: {
    icon: FileText,
    title: "Nenhuma candidatura",
    description: "Você ainda não se candidatou a nenhuma vaga. Explore oportunidades!",
    actionText: "Ver vagas",
    color: "indigo"
  },
  profissionais: {
    icon: Users,
    title: "Nenhum profissional",
    description: "Não encontramos profissionais com os critérios selecionados.",
    actionText: "Ajustar filtros",
    color: "teal"
  },
  agenda: {
    icon: Calendar,
    title: "Agenda vazia",
    description: "Você não tem compromissos agendados. Que tal buscar novas oportunidades?",
    actionText: "Buscar vagas",
    color: "orange"
  },
  marketplace: {
    icon: ShoppingBag,
    title: "Nenhum anúncio",
    description: "Não há anúncios disponíveis no momento. Seja o primeiro a anunciar!",
    actionText: "Criar anúncio",
    color: "red"
  },
  avaliacoes: {
    icon: Star,
    title: "Sem avaliações",
    description: "Você ainda não recebeu avaliações. Complete trabalhos para receber feedback.",
    actionText: null,
    color: "amber"
  },
  generic: {
    icon: FileText,
    title: "Nada por aqui",
    description: "Não há dados para exibir no momento.",
    actionText: null,
    color: "gray"
  }
};

const colorClasses = {
  blue: "bg-blue-100 text-blue-500",
  purple: "bg-purple-100 text-purple-500",
  yellow: "bg-yellow-100 text-yellow-500",
  pink: "bg-pink-100 text-pink-500",
  green: "bg-green-100 text-green-500",
  indigo: "bg-indigo-100 text-indigo-500",
  teal: "bg-teal-100 text-teal-500",
  orange: "bg-orange-100 text-orange-500",
  red: "bg-red-100 text-red-500",
  amber: "bg-amber-100 text-amber-500",
  gray: "bg-gray-100 text-gray-500"
};

export default function EmptyState({ 
  type = "generic",
  title,
  description,
  actionText,
  onAction,
  icon: CustomIcon,
  className = ""
}) {
  const config = emptyStateConfigs[type] || emptyStateConfigs.generic;
  const Icon = CustomIcon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionText = actionText !== undefined ? actionText : config.actionText;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className={`w-20 h-20 rounded-2xl ${colorClasses[config.color]} flex items-center justify-center mb-6`}>
        <Icon className="w-10 h-10" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {displayTitle}
      </h3>
      
      <p className="text-gray-500 max-w-sm mb-6">
        {displayDescription}
      </p>
      
      {displayActionText && onAction && (
        <Button 
          onClick={onAction}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold rounded-xl px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          {displayActionText}
        </Button>
      )}
    </motion.div>
  );
}