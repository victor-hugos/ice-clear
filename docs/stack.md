# Ice Clear Stack

## Approved operational stack

- Frontend: React + Vite
- UI: Tailwind CSS
- Backend platform: Supabase
- Deploy: Vercel
- Future custom API: FastAPI when business rules outgrow the frontend + Supabase layer

## Why this stack

- Matches the stack already used in your active projects.
- Keeps the MVP fast to iterate.
- Avoids introducing backend complexity before the booking and chat flows are validated.
- Leaves room for FastAPI later without forcing it too early.

## Initial technical modules

- technician auth
- technician profile
- technician services
- technician QR public page
- direct booking flow
- internal chat flow
- WhatsApp notification integration
- payment integration

## Immediate next build order

1. Create technician auth and onboarding.
2. Model technician profile and services in Supabase.
3. Build technician public page and QR route.
4. Build direct booking flow.
5. Build internal chat flow.
