# DocFlow Sign

Aplicação SaaS para gestão de fluxo de documentos com assinatura externa.

## Stack
- Next.js (App Router) + TypeScript + TailwindCSS
- shadcn/ui (componentes base em `components/ui`)
- Supabase (Auth, PostgreSQL, Storage, RLS)
- Resend API (notificações)
- OpenAI (classificação opcional)

## Funcionalidades
- Upload de documento original e envio para receptor
- Download para assinatura externa
- Upload da versão assinada
- Rejeição de documento com motivo informado pelo receptor
- Notificação por e-mail para cada etapa relevante
- Log completo de eventos (`document_events`)
- Dashboard com abas: Para assinar, Enviados, Assinados e Rejeitados

## Pré-requisitos
- Node.js 20+
- Projeto Supabase configurado
- Conta Resend
- Chave OpenAI (opcional)

## Configuração
1. Instale dependências:
```bash
npm install
```
2. Copie variáveis:
```bash
cp .env.example .env.local
```
3. Execute as migrations SQL na ordem:
- `supabase/migrations/001_init.sql`
- `supabase/migrations/002_document_rejection.sql`
- rode no SQL Editor do Supabase

## Rodar local
```bash
npm run dev
```
Acesse: `http://localhost:3010`

## Deploy na Vercel
1. Suba o projeto no GitHub
2. Conecte o repositório na Vercel
3. Configure as variáveis de ambiente
4. Faça deploy

## Segurança
- RLS aplicado em `users`, `documents` e `document_events`
- Buckets privados (`documents-original`, `documents-signed`)
- Downloads com Signed URL de curta duração
- Service Role utilizada apenas no backend
