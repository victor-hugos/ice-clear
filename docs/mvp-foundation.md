# MVP Foundation

## Product Core

The MVP exists to solve one problem well: help an air-conditioning technician
keep and reactivate customers after the first service without forcing the
technician to learn a complex system.

Two entry points define the product:

- `Agendar serviço`
- `Falar com o técnico`

## MVP User Flows

### Technician

1. Create account.
2. Complete basic profile.
3. Select offered services.
4. Generate fixed QR code.
5. Share or print QR sticker.
6. Receive new requests and chat alerts.
7. Accept, reject, or reschedule requests.

### Customer

1. Scan technician QR.
2. Choose direct booking or chat.
3. Send service request or problem description.
4. Receive confirmation and updates.
5. Schedule periodic cleaning or maintenance when relevant.

## MVP Modules

- authentication
- technician profile
- technician services
- QR code generation
- public technician page
- direct booking
- internal chat
- WhatsApp notifications
- payments
- recurring maintenance reminders

## Suggested Delivery Order

1. Auth and technician onboarding.
2. Technician public page and QR generation.
3. Direct booking flow.
4. Internal chat flow.
5. WhatsApp notifications.
6. Payments.
7. Recurring maintenance.

## Initial Data Model

- `technicians`
- `technician_profiles`
- `technician_services`
- `technician_qr_codes`
- `customers`
- `service_requests`
- `appointments`
- `chat_threads`
- `chat_messages`
- `payments`
- `maintenance_plans`
- `maintenance_reminders`

## Product Constraints

- Avoid forcing equipment-level QR in the first release.
- Avoid using WhatsApp as the primary chat surface.
- Avoid long onboarding forms.
- Avoid exposing direct contact before the platform captures the request.

## Open Decisions

- final brand name
- initial stack
- payment provider
- WhatsApp provider
- whether technician approval is manual or automatic

## Current Build Status

- technician onboarding persists through the Cloudflare Worker API
- public QR page already resolves technician data by slug
- direct booking page persists requests through the Cloudflare Worker API
- consultation page persists conversation intake through the Cloudflare Worker API
- technician-side inbox loads bookings and consultations from Cloudflare D1
- WhatsApp notification, payment, and production validation are the next major product slices
