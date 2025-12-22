import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * Componente de upload de imagem otimizado
 * - Compressão client-side
 * - Preview instantâneo
 * - Validação de tipo e tamanho
 */
export default function ImageUpload({
  value,
  onChange,
  maxSize = 5, // MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  label,
  required = false,
  compressQuality = 0.8
}) {
  const [preview, setPreview] = useState(value || null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionar se muito grande
          const maxDimension = 1920;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              }));
            },
            'image/jpeg',
            compressQuality
          );
        };
      };
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!acceptedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado');
      return;
    }

    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo: ${maxSize}MB`);
      return;
    }

    try {
      setUploading(true);

      // Comprimir imagem
      const compressedFile = await compressImage(file);

      // Preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);

      // Upload
      const { file_url } = await base44.integrations.Core.UploadFile({ 
        file: compressedFile 
      });

      onChange(file_url);
      toast.success('✅ Imagem enviada!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar imagem');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 cursor-pointer transition-all bg-gray-50 hover:bg-orange-50">
          <input
            ref={inputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-2" />
                <p className="font-semibold">Enviando...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <p className="font-semibold">Clique para enviar</p>
                <p className="text-sm text-gray-400">ou arraste a imagem aqui</p>
                <p className="text-xs text-gray-400 mt-2">
                  Máx: {maxSize}MB | JPG, PNG, WEBP
                </p>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}