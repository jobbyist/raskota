# RasKota

RasKota is a responsive TanStack Start + Vite application for the existing RasKota ordering demo.

## Stack

- TanStack Start and TanStack Router
- React 19 and TypeScript
- Vite 8
- Nitro for Vercel deployment
- Node.js 22.12+

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build and verify

```bash
npm run build
npm run preview
```

The build runs the Vite/TanStack production build and a TypeScript check. GitHub Actions runs the same build for pushes and pull requests.

## Existing demo compatibility

The original interactive demo is preserved at `public/legacy/raskota-demo.html` and mounted in the TanStack route as a same-origin, full-viewport client surface. This keeps the existing Customer, Kitchen, and Owner views, ordering builder, cart, order tracking, kitchen ticket actions, loyalty UI, and dashboard behaviour unchanged while the application moves to a modern server-rendered React/Vite host.

The demo itself is intentionally still client-side and uses in-memory sample data. Its PayFast screen is explicitly simulated: it does not submit payments, persist orders, or connect to a payment account. Production payments, authentication, durable order storage, notifications, and a native React component extraction are separate implementation stages.

## Deployment

The repository is configured for Vercel's TanStack Start framework detection. Connect the GitHub repository to a Vercel project and deploy the `main` branch. Pull requests receive preview deployments through the Vercel Git integration.
