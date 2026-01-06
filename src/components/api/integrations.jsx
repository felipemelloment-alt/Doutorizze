import { base44 } from './base44Client';

/**
 * Base44 Core Integrations
 * Integrações nativas disponíveis
 */

export const Core = base44.integrations.Core;

// Funções individuais para import direto
export const InvokeLLM = base44.integrations.Core.InvokeLLM;
export const SendEmail = base44.integrations.Core.SendEmail;
export const UploadFile = base44.integrations.Core.UploadFile;
export const UploadPrivateFile = base44.integrations.Core.UploadPrivateFile;
export const CreateFileSignedUrl = base44.integrations.Core.CreateFileSignedUrl;
export const GenerateImage = base44.integrations.Core.GenerateImage;
export const ExtractDataFromUploadedFile = base44.integrations.Core.ExtractDataFromUploadedFile;