import { base44 } from './base44Client';

/**
 * Cloud Functions do projeto
 * Todas as functions backend disponíveis
 */

// IA e Automação
export const claudeAI = (params) => base44.functions.invoke('claudeAI', params);
export const criarPostFeed = (params) => base44.functions.invoke('criarPostFeed', params);

// WhatsApp
export const enviarWhatsAppOTP = (params) => base44.functions.invoke('enviarWhatsAppOTP', params);
export const sendWhatsAppOTP = (params) => base44.functions.invoke('sendWhatsAppOTP', params);
export const verifyWhatsAppOTP = (params) => base44.functions.invoke('verifyWhatsAppOTP', params);
export const sendWhatsAppMessage = (params) => base44.functions.invoke('sendWhatsAppMessage', params);

// Email
export const enviarEmailVerificacao = (params) => base44.functions.invoke('enviarEmailVerificacao', params);

// Telegram
export const gerarCodigoTelegram = (params) => base44.functions.invoke('gerarCodigoTelegram', params);

// Push Notifications
export const sendPushNotification = (params) => base44.functions.invoke('sendPushNotification', params);

// Marketplace Radar
export const notifyRadarMatches = (params) => base44.functions.invoke('notifyRadarMatches', params);

// Tokens
export const gerarTokenUsuario = (params) => base44.functions.invoke('gerarTokenUsuario', params);
export const validarTokenUsuario = (params) => base44.functions.invoke('validarTokenUsuario', params);
export const gerarTokenDesconto = (params) => base44.functions.invoke('gerarTokenDesconto', params);
export const validarTokenDesconto = (params) => base44.functions.invoke('validarTokenDesconto', params);
export const notificarExpiracaoToken = (params) => base44.functions.invoke('notificarExpiracaoToken', params);

// Substituições
export const escolherCandidatoSubstituicao = (params) => base44.functions.invoke('escolherCandidatoSubstituicao', params);
export const verificarTimerSubstituicao = (params) => base44.functions.invoke('verificarTimerSubstituicao', params);

// Cron Jobs
export const expirarChatsMarketplace = (params) => base44.functions.invoke('expirarChatsMarketplace', params);
export const resetContadoresDisponibilidade = (params) => base44.functions.invoke('resetContadoresDisponibilidade', params);