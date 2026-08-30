# Ice Clear Stack

## Approved operational stack

- Frontend: React + Vite
- UI: Tailwind CSS
- Backend platform: Cloudflare D1 + Workers API
- Deploy: Cloudflare Workers with Static Assets
- Future custom API: FastAPI only if business rules outgrow the Cloudflare layer

## Why this stack

- Matches the stack already used in your active projects.
- Keeps the MVP fast to iterate.
- Keeps the deploy and database direction in one Cloudflare stack.
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
2. Convert technician profile and services to Cloudflare D1.
3. Build technician public page and QR route.
4. Build direct booking flow.
5. Build internal chat flow.
