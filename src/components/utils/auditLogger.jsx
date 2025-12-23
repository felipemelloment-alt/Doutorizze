// ============================================
// SERVIÇO DE AUDIT LOG
// ============================================

import { base44 } from "@/api/base44Client";
import { sanitizeForLog } from "./dataProtection";
import { logger } from "./logger";

// Ações auditáveis
export const AUDIT_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  DOWNLOAD: 'DOWNLOAD',
  EXPORT: 'EXPORT',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  SEND_MESSAGE: 'SEND_MESSAGE',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  CHANGE_PERMISSION: 'CHANGE_PERMISSION'
};

// Criar log de auditoria
async function createAuditLog({
  action,
  entityType = null,
  entityId = null,
  description,
  beforeData = null,
  afterData = null,
  metadata = {}
}) {
  try {
    const user = await base44.auth.me();
    
    const logEntry = {
      user_id: user.id,
      user_email: user.email,
      action,
      entity_type: entityType,
      entity_id: entityId,
      description,
      before_data: beforeData ? sanitizeForLog(beforeData) : null,
      after_data: afterData ? sanitizeForLog(afterData) : null,
      ip_address: null, // Não disponível no frontend
      user_agent: navigator.userAgent,
      metadata: {
        ...metadata,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    };

    await base44.entities.AuditLog.create(logEntry);
    
    logger.debug(`[Audit] ${action}: ${description}`);
  } catch (error) {
    logger.error('[Audit] Erro ao criar log:', error);
    // Não propagar erro - audit log não deve quebrar a aplicação
  }
}

// ============================================
// API PÚBLICA
// ============================================

export const AuditLogger = {
  // Log genérico
  log: createAuditLog,
  
  // Login
  logLogin: () => createAuditLog({
    action: AUDIT_ACTIONS.LOGIN,
    description: 'Usuário realizou login'
  }),
  
  // Logout
  logLogout: () => createAuditLog({
    action: AUDIT_ACTIONS.LOGOUT,
    description: 'Usuário realizou logout'
  }),
  
  // Criação de entidade
  logCreate: (entityType, entityId, data) => createAuditLog({
    action: AUDIT_ACTIONS.CREATE,
    entityType,
    entityId,
    description: `Criou ${entityType}`,
    afterData: data
  }),
  
  // Atualização de entidade
  logUpdate: (entityType, entityId, beforeData, afterData) => createAuditLog({
    action: AUDIT_ACTIONS.UPDATE,
    entityType,
    entityId,
    description: `Atualizou ${entityType}`,
    beforeData,
    afterData
  }),
  
  // Exclusão de entidade
  logDelete: (entityType, entityId, data) => createAuditLog({
    action: AUDIT_ACTIONS.DELETE,
    entityType,
    entityId,
    description: `Excluiu ${entityType}`,
    beforeData: data
  }),
  
  // Visualização de dados sensíveis
  logView: (entityType, entityId, description = null) => createAuditLog({
    action: AUDIT_ACTIONS.VIEW,
    entityType,
    entityId,
    description: description || `Visualizou ${entityType}`
  }),
  
  // Download de arquivo
  logDownload: (entityType, entityId, fileName) => createAuditLog({
    action: AUDIT_ACTIONS.DOWNLOAD,
    entityType,
    entityId,
    description: `Baixou arquivo: ${fileName}`,
    metadata: { fileName }
  }),
  
  // Exportação de dados
  logExport: (dataType, count) => createAuditLog({
    action: AUDIT_ACTIONS.EXPORT,
    description: `Exportou ${count} registros de ${dataType}`,
    metadata: { dataType, count }
  }),
  
  // Aprovação
  logApprove: (entityType, entityId, data) => createAuditLog({
    action: AUDIT_ACTIONS.APPROVE,
    entityType,
    entityId,
    description: `Aprovou ${entityType}`,
    afterData: data
  }),
  
  // Rejeição
  logReject: (entityType, entityId, reason) => createAuditLog({
    action: AUDIT_ACTIONS.REJECT,
    entityType,
    entityId,
    description: `Rejeitou ${entityType}: ${reason}`,
    metadata: { reason }
  }),
  
  // Alteração de senha
  logPasswordChange: () => createAuditLog({
    action: AUDIT_ACTIONS.CHANGE_PASSWORD,
    description: 'Alterou a senha'
  }),
  
  // Alteração de permissão
  logPermissionChange: (targetUserId, newRole) => createAuditLog({
    action: AUDIT_ACTIONS.CHANGE_PERMISSION,
    entityType: 'User',
    entityId: targetUserId,
    description: `Alterou permissão para ${newRole}`,
    metadata: { newRole }
  })
};

export default AuditLogger;