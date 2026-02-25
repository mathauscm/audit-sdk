// src/types.ts

export type AuditActorType = 'user' | 'system';

export interface AuditEvent {
  /**
   * Quando o evento aconteceu.
   * Se não for enviado pelo caller, será preenchido pelo SDK.
   */
  timestamp?: string;

  /**
   * Identificador do workspace / tenant.
   */
  workspaceId?: string;

  /**
   * Nome do serviço que gerou o evento.
   * No SDK, isso SEMPRE é preenchido a partir de AuditLoggerOptions.serviceName.
   */
  serviceName: string;

  /**
   * Ação realizada: 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', etc.
   */
  action: string;

  /**
   * Tipo do recurso: 'heater-config', 'schedule', 'shorturl', etc.
   */
  resourceType: string;

  /**
   * ID do recurso afetado (opcional).
   */
  resourceId?: string;

  /**
   * Tipo do ator: usuário ou sistema.
   */
  actorType?: AuditActorType;

  /**
   * ID do ator (usuário, sistema, etc.).
   */
  actorId?: string | number;

  /**
   * IP de origem da requisição (se disponível).
   */
  ip?: string;

  /**
   * User-Agent do cliente (se disponível).
   */
  userAgent?: string;

  /**
   * Correlation ID / Request ID (para trace).
   */
  requestId?: string;

  /**
   * Snapshot antes da operação (opcional).
   */
  before?: unknown;

  /**
   * Snapshot depois da operação (opcional).
   */
  after?: unknown;

  /**
   * Metadados extras específicos de cada caso.
   */
  metadata?: Record<string, unknown>;
}