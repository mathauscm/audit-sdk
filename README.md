# @aldeia/audit-sdk

[![npm version](https://img.shields.io/npm/v/@aldeia/audit-sdk.svg)](https://www.npmjs.com/package/@aldeia/audit-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

SDK de audit logging para Node.js e TypeScript.

Permite registrar eventos de auditoria de forma padronizada e enviá-los para um serviço central via HTTP. Ideal para arquiteturas baseadas em microserviços, eventos e observabilidade.

Zero dependências de produção. Compatível com Node 18+ e Bun.

---

## 📦 Instalação

```bash
npm install @aldeia/audit-sdk
```

ou

```bash
bun add @aldeia/audit-sdk
```

---

## 🚀 Uso Básico

```ts
import { createAuditLogger } from '@aldeia/audit-sdk';

const audit = createAuditLogger({
  serviceName: 'user-service',
  endpoint: 'http://localhost:3000/logs',
  apiKey: process.env.AUDIT_API_KEY,
});

audit.log({
  workspaceId: 'workspace-123',
  action: 'UPDATE',
  resourceType: 'user',
  resourceId: 'user-42',
  actorType: 'user',
  actorId: 'admin-1',
  metadata: {
    changedFields: ['email']
  }
});
```

Por padrão, o SDK funciona em modo **fire-and-forget** (não bloqueia o fluxo principal da aplicação).

---

## ⚙️ Criando uma Instância

```ts
import { createAuditLogger } from '@aldeia/audit-sdk';

const audit = createAuditLogger({
  serviceName: 'my-service',
  endpoint: 'https://audit.mycompany.com/logs',
  apiKey: 'my-secret-key',
  fireAndForget: true
});
```

### Opções Disponíveis

| Opção | Tipo | Obrigatório | Descrição |
|-------|------|------------|------------|
| serviceName | string | ✅ | Nome do serviço que está gerando os logs |
| endpoint | string | ✅ | URL do serviço de auditoria |
| apiKey | string | ❌ | Token opcional enviado no header `x-api-key` |
| fireAndForget | boolean | ❌ | Se true (default), não aguarda resposta HTTP |

---

## 🧾 Estrutura do Evento

```ts
interface AuditEvent {
  timestamp?: string;
  workspaceId?: string;
  serviceName: string;

  action: string;
  resourceType: string;
  resourceId?: string;

  actorType?: 'user' | 'system';
  actorId?: string | number;

  ip?: string;
  userAgent?: string;
  requestId?: string;

  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
}
```

### Observações

- `serviceName` e `timestamp` são preenchidos automaticamente pelo SDK.
- `before` e `after` podem armazenar estado anterior e posterior de uma operação.
- `metadata` permite extensão livre do evento.

---

## ⏳ Usando com Await

Se desejar aguardar confirmação do serviço de audit:

```ts
const audit = createAuditLogger({
  serviceName: 'my-service',
  endpoint: 'http://localhost:3000/logs',
  fireAndForget: false
});

await audit.log({
  action: 'CREATE',
  resourceType: 'invoice',
  resourceId: 'inv-999'
});
```

---

## 🏗️ Arquitetura Recomendada

Aplicação → SDK → Serviço de Auditoria → Event Bus (ex: Kafka) → Writer → Banco de Dados

O SDK é responsável apenas por padronizar e enviar o evento. Persistência e processamento ficam no serviço de auditoria.

---

## 🔒 Garantias

- Nunca lança erro para a aplicação chamadora.
- Não bloqueia o fluxo principal por padrão.
- Sem dependências externas em runtime.
- Compatível com ESM.

---

## 🧩 Compatibilidade

- Node.js 18+
- Bun
- TypeScript
- ESM

---

## 📄 Licença

MIT

---

Powered by [@mathauscm](https://github.com/mathauscm)