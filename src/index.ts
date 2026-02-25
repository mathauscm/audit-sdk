// src/index.ts
import type { AuditEvent } from './types.js';

export interface AuditLoggerOptions {
  /**
   * Nome do serviço que está usando o SDK.
   * Ex: 'warmbox', 'teste', 'shorturl-service'.
   */
  serviceName: string;

  /**
   * Endpoint HTTP do serviço de audit.
   * Ex: 'http://audit-service:3000/logs'
   */
  endpoint: string;

  /**
   * API key ou token simples para autenticação via header (opcional).
   */
  apiKey?: string;

  /**
   * Se true (default), o SDK não faz await do fetch.
   * Ou seja: fire-and-forget.
   */
  fireAndForget?: boolean;
}

export interface AuditLogger {
  /**
   * Registra um evento de auditoria.
   *
   * `serviceName` e `timestamp` são preenchidos automaticamente pelo SDK.
   */
  log(
    event: Omit<AuditEvent, 'serviceName' | 'timestamp'> &
      Partial<Pick<AuditEvent, 'timestamp'>>
  ): Promise<void>;
}

/**
 * Cria uma instância de logger de audit.
 */
export function createAuditLogger(opts: AuditLoggerOptions): AuditLogger {
  const {
    serviceName,
    endpoint,
    apiKey,
    fireAndForget = true,
  } = opts;

  const normalizedServiceName = serviceName.trim();
  const normalizedEndpoint = endpoint.trim();

  if (!normalizedServiceName) {
    throw new Error('AuditLogger: serviceName é obrigatório');
  }

  if (!normalizedEndpoint) {
    throw new Error('AuditLogger: endpoint é obrigatório');
  }

  async function send(
    event: Omit<AuditEvent, 'serviceName'> &
      Partial<Pick<AuditEvent, 'serviceName'>>
  ): Promise<void> {
    const payload: AuditEvent = {
      ...event,
      serviceName: normalizedServiceName,
      timestamp: event.timestamp ?? new Date().toISOString(),
    };

    try {
      const p = fetch(normalizedEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-api-key': apiKey } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (fireAndForget) {
        // Não bloqueia o fluxo da requisição principal.
        void p.catch(() => {
          // Evita unhandled rejection quando o envio falha após retorno da função.
        });
        return;
      }

      const res = await p;
      if (!res.ok) {
        // Aqui você pode logar em console ou ignorar silenciosamente.
        // console.error('[audit-sdk] Falha ao enviar log', res.status);
      }
    } catch {
      // NUNCA lança erro pro caller: audit não pode derrubar o serviço.
      // console.error('[audit-sdk] Erro ao enviar log', err);
    }
  }

  return {
    log: send,
  };
}

// Reexporta tipos para quem quiser usar.
export * from './types.js';
