# Cloudflare Setup

## Objetivo da camada de dados

Criar a base minima para onboarding, pagina publica do QR, pedidos diretos e conversas consultivas na stack Cloudflare.

O projeto usa Cloudflare Workers com Static Assets para publicar o frontend e uma API Worker para gravar dados no Cloudflare D1.

## Entidades desta etapa inicial

- `technician_profiles`
- `technician_services`
- `technician_qr_codes`
- `public_technician_profiles` view

## Entidades da etapa operacional

- `service_requests`
- `consultation_threads`
- `consultation_messages`
- RPC `get_public_consultation_thread` para leitura publica por token

## Regras iniciais

- Cada técnico autenticado pode ter um perfil.
- Cada perfil pode ter vários serviços.
- Cada perfil tem um QR público principal no MVP.
- O slug do perfil e o slug do QR ficam únicos.
- A leitura pública começa pela view e não pelo perfil bruto.

## Caminhos atuais

- `cloudflare/migrations/0001_initial_ice_clear_d1.sql`
- `web/wrangler.jsonc`

## Comportamento atual do frontend

1. `TechnicianAuthPage` aponta para o cadastro simplificado do MVP.
2. `TechnicianOnboardingPage` salva perfil, servicos e QR via API Cloudflare.
3. `TechnicianPublicPage` busca o tecnico publicado no D1.
4. Pedidos diretos gravam em `service_requests`.
5. Conversas consultivas gravam em `consultation_threads`.
6. Respostas do tecnico gravam em `consultation_messages`.

## Proxima ligacao com frontend

1. Aplicar a migration D1 no banco `ice-clear-mvp`.
2. Fazer deploy do Worker.
3. Validar cadastro, pagina publica, pedido direto, conversa e resposta do tecnico no ambiente publicado.
