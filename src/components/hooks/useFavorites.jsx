import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { cacheConfig } from "@/components/config/queryConfig";

export function useFavorites(tipo = null) {
  const queryClient = useQueryClient();

  // Buscar favoritos do usuário
  const { data: favoritos = [], isLoading } = useQuery({
    queryKey: ["favoritos", tipo],
    queryFn: async () => {
      const user = await base44.auth.me();
      const filter = tipo 
        ? { user_id: user.id, tipo }
        : { user_id: user.id };
      
      return base44.entities.Favorito.filter(filter);
    },
    ...cacheConfig.dynamic
  });

  // Adicionar favorito
  const addFavorite = useMutation({
    mutationFn: async ({ tipo, entity_id, entity_name, entity_image, notificar = false }) => {
      const user = await base44.auth.me();
      
      // Verificar se já existe
      const existing = await base44.entities.Favorito.filter({
        user_id: user.id,
        entity_id
      });
      
      if (existing.length > 0) {
        throw new Error("Item já está nos favoritos");
      }
      
      return base44.entities.Favorito.create({
        user_id: user.id,
        tipo,
        entity_id,
        entity_name,
        entity_image,
        notificar
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoritos"] });
      toast.success("Adicionado aos favoritos!");
    },
    onError: (error) => {
      if (error.message.includes("já está")) {
        toast.info("Este item já está nos seus favoritos");
      } else {
        toast.error("Erro ao adicionar favorito");
      }
    }
  });

  // Remover favorito
  const removeFavorite = useMutation({
    mutationFn: async (entityId) => {
      const user = await base44.auth.me();
      const existing = await base44.entities.Favorito.filter({
        user_id: user.id,
        entity_id: entityId
      });
      
      if (existing.length > 0) {
        return base44.entities.Favorito.delete(existing[0].id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoritos"] });
      toast.success("Removido dos favoritos");
    },
    onError: () => {
      toast.error("Erro ao remover favorito");
    }
  });

  // Toggle favorito
  const toggleFavorite = async (item) => {
    const isFav = isFavorited(item.entity_id);
    
    if (isFav) {
      removeFavorite.mutate(item.entity_id);
    } else {
      addFavorite.mutate(item);
    }
  };

  // Verificar se item é favorito
  const isFavorited = (entityId) => {
    return favoritos.some(f => f.entity_id === entityId);
  };

  // Atualizar notificação de favorito
  const updateNotification = useMutation({
    mutationFn: async ({ id, notificar }) => {
      return base44.entities.Favorito.update(id, { notificar });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoritos"] });
    }
  });

  return {
    favoritos,
    isLoading,
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
    toggleFavorite,
    isFavorited,
    updateNotification: updateNotification.mutate,
    isAdding: addFavorite.isPending,
    isRemoving: removeFavorite.isPending
  };
}

// Componente de botão de favorito
import React from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export function FavoriteButton({ 
  tipo, 
  entityId, 
  entityName, 
  entityImage,
  size = "md",
  className = ""
}) {
  const { isFavorited, toggleFavorite, isAdding, isRemoving } = useFavorites();
  
  const isFav = isFavorited(entityId);
  const isLoading = isAdding || isRemoving;
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };
  
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    toggleFavorite({
      tipo,
      entity_id: entityId,
      entity_name: entityName,
      entity_image: entityImage
    });
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        rounded-full flex items-center justify-center
        transition-all duration-200
        ${isFav 
          ? 'bg-red-100 text-red-500 hover:bg-red-200' 
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
        }
        disabled:opacity-50
        ${className}
      `}
      aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <motion.div
        animate={isFav ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          className={`${iconSizes[size]} ${isFav ? 'fill-current' : ''}`} 
        />
      </motion.div>
    </motion.button>
  );
}

export default useFavorites;