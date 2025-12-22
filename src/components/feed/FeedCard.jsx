import React from "react";
import { Heart, Play, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const tipoConfig = {
  NOTICIA_IA: { emoji: "📰", label: "Notícia", bg: "bg-blue-50", text: "text-blue-600" },
  VIDEO: { emoji: "🎬", label: "Vídeo", bg: "bg-red-50", text: "text-red-600" },
  DICA: { emoji: "💡", label: "Dica", bg: "bg-yellow-50", text: "text-yellow-600" },
  PARCEIRO: { emoji: "🏪", label: "Parceiro", bg: "bg-green-50", text: "text-green-600" },
  COMUNIDADE: { emoji: "📱", label: "Comunidade", bg: "bg-purple-50", text: "text-purple-600" },
  ADMIN: { emoji: "📢", label: "Novidade", bg: "bg-orange-50", text: "text-orange-600" },
  NOVIDADE: { emoji: "✨", label: "Novidade", bg: "bg-pink-50", text: "text-pink-600" },
  NOTICIA_SAUDE: { emoji: "🏥", label: "Saúde", bg: "bg-teal-50", text: "text-teal-600" },
  PROMOCAO: { emoji: "🎁", label: "Promoção", bg: "bg-red-50", text: "text-red-600" },
  CURSO: { emoji: "📚", label: "Curso", bg: "bg-indigo-50", text: "text-indigo-600" },
  DESTAQUE_MARKETPLACE: { emoji: "🛒", label: "Marketplace", bg: "bg-emerald-50", text: "text-emerald-600" }
};

export default function FeedCard({ post, onVideoClick, onCurtir }) {
  const config = tipoConfig[post.tipo_post] || tipoConfig.ADMIN;
  const temVideo = post.tipo_midia === "VIDEO" && post.video_url;

  // Extrair ID do YouTube para thumbnail
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?]+)/);
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(post.video_url);
  const thumbnailUrl = post.imagem_url || 
    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null);

  // Formatar duração do vídeo
  const formatDuracao = (segundos) => {
    if (!segundos) return "";
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch {
      return "Recente";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Thumbnail/Imagem */}
      {thumbnailUrl && (
        <div
          className={`relative aspect-video bg-gray-100 ${temVideo ? 'cursor-pointer group' : ''}`}
          onClick={() => temVideo && onVideoClick && onVideoClick(post)}
        >
          <img
            src={thumbnailUrl}
            alt={post.titulo}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/640x360?text=Imagem+indisponível';
            }}
          />

          {/* Overlay de vídeo */}
          {temVideo && (
            <>
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                </div>
              </div>

              {/* Duração */}
              {post.video_duracao && (
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-white text-xs font-bold rounded">
                  {formatDuracao(post.video_duracao)}
                </div>
              )}
            </>
          )}

          {/* Badge fonte */}
          {post.fonte_nome && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 text-white text-xs font-bold rounded flex items-center gap-1">
              {post.fonte_tipo === "YOUTUBE" && "📺"}
              {post.fonte_tipo === "INSTAGRAM" && "📷"}
              {post.fonte_tipo === "TELEGRAM" && "📱"}
              {post.fonte_tipo === "SITE" && "🌐"}
              {post.fonte_tipo === "REVISTA" && "📖"}
              {post.fonte_nome}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-4">
        {/* Badge tipo + tempo */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`px-3 py-1 ${config.bg} ${config.text} text-xs font-bold rounded-full`}>
            {config.emoji} {config.label}
          </span>
          {post.area && post.area !== "AMBOS" && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              {post.area === "ODONTOLOGIA" ? "🦷" : "🩺"} {post.area}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {getTimeAgo(post.created_date)}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
          {post.titulo}
        </h3>

        {/* Descrição */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {post.descricao}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onCurtir && onCurtir(post.id)}
              className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">{post.curtidas || 0}</span>
            </button>
            
            <span className="text-xs text-gray-400">
              👁️ {post.visualizacoes || 0}
            </span>
          </div>

          {post.fonte_url && (
            <a
              href={post.fonte_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full hover:shadow-lg transition-all"
            >
              Ver mais
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}