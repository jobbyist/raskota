# RasKota

RasKota is a responsive TanStack Start + React application for the RasKota food-truck ordering demo.

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

The production build runs the Vite/TanStack build and a TypeScript check. GitHub Actions runs the same build for pushes and pull requests.

## Demo behaviour and integration boundaries

The Customer, Kitchen, and Owner views are now rendered by React components. The original layout, typography, colours, responsive breakpoints, menu, extras, sample-data seed, ordering flow, cart, delivery/pickup options, order tracking, kitchen ticket transitions, loyalty display, and dashboard interactions have been retained.

The original HTML prototype is archived at `public/legacy/raskota-demo.html` for reference; the application route no longer embeds it.

The demo uses client-side in-memory sample data. Orders do not persist across reloads. Its PayFast screen is a non-transactional simulation and is not connected to a live payment account. Production authentication, persistent order storage, real payment processing, notifications, and inventory integrations are separate implementation stages.

## Deployment

The repository is configured for Vercel's TanStack Start framework detection. Connect the GitHub repository to a Vercel project and deploy the `main` branch. Pull requests receive preview deployments through the Vercel Git integration.
