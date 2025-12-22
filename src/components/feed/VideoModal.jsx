import React from "react";
import { X, Heart, ExternalLink, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VideoModal({ isOpen, onClose, post, onCurtir }) {
  if (!isOpen || !post) return null;

  // Extrair ID do YouTube
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?]+)/);
    return match ? match[1] : null;
  };

  // Extrair ID do Instagram Reel
  const getInstagramId = (url) => {
    if (!url) return null;
    const match = url.match(/instagram\.com\/(?:reel|p)\/([^/?]+)/);
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(post.video_url);
  const instagramId = getInstagramId(post.video_url);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex flex-col"
        onClick={onClose}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {post.fonte_url && (
            <a
              href={post.fonte_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white text-sm hover:bg-white/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir fonte
            </a>
          )}
        </div>

        {/* Video Container */}
        <div 
          className="flex-1 flex items-center justify-center px-4"
          onClick={(e) => e.stopPropagation()}
        >
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              className="w-full max-w-4xl aspect-video rounded-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : instagramId ? (
            <iframe
              src={`https://www.instagram.com/reel/${instagramId}/embed`}
              className="w-full max-w-md aspect-[9/16] rounded-2xl"
              allowFullScreen
            />
          ) : post.video_url ? (
            <video
              src={post.video_url}
              controls
              autoPlay
              className="w-full max-w-4xl aspect-video rounded-2xl"
            />
          ) : (
            <div className="w-full max-w-4xl aspect-video rounded-2xl bg-gray-800 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Play className="w-16 h-16 mx-auto mb-4" />
                <p>Vídeo não disponível</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div 
          className="p-4 bg-gradient-to-t from-black/80 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
            {post.titulo}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onCurtir && onCurtir(post.id)}
                className="flex items-center gap-2 text-white hover:text-red-500 transition-colors"
              >
                <Heart className="w-6 h-6" />
                <span>{post.curtidas || 0}</span>
              </button>

              {post.video_duracao && (
                <span className="text-gray-400 text-sm">
                  {Math.floor(post.video_duracao / 60)}:{(post.video_duracao % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {post.fonte_logo && (
                <img 
                  src={post.fonte_logo} 
                  alt={post.fonte_nome}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="text-gray-400 text-sm">
                {post.fonte_nome || 'Fonte desconhecida'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}