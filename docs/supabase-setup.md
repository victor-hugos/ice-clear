# Supabase Setup

## Objetivo da primeira migration

Criar a base mínima para o onboarding do técnico e a futura página pública do QR.

## Entidades desta etapa

- `technician_profiles`
- `technician_services`
- `technician_qr_codes`
- `public_technician_profiles` view

## Regras iniciais

- Cada técnico autenticado pode ter um perfil.
- Cada perfil pode ter vários serviços.
- Cada perfil tem um QR público principal no MVP.
- O slug do perfil e o slug do QR ficam únicos.
- A leitura pública começa pela view e não pelo perfil bruto.

## Caminho da migration

- `supabase/migrations/20260521_initial_ice_clear_schema.sql`

## Comportamento atual do frontend

1. `TechnicianAuthPage` envia magic link quando o Supabase estiver configurado.
2. `TechnicianOnboardingPage` tenta carregar sessão e perfil real.
3. Se houver sessão válida, salva perfil, serviços e QR no Supabase.
4. Se não houver sessão ou credenciais, usa fallback local sem travar o fluxo.
5. `TechnicianPublicPage` busca primeiro no Supabase e depois no fallback local.

## Próxima ligação com frontend

1. Aplicar a migration no projeto Supabase.
2. Configurar `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Testar magic link com um técnico real.
4. Persistir e carregar a página pública pelo slug.
