import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="raskota-shell" aria-label="RasKota interactive demo">
      <iframe
        className="raskota-frame"
        src="/legacy/raskota-demo.html"
        title="RasKota demo — customer, kitchen and owner views"
        loading="eager"
        allow="clipboard-read; clipboard-write"
      >
        Your browser does not support embedded content. Open the{' '}
        <a href="/legacy/raskota-demo.html">RasKota demo</a> directly.
      </iframe>
    </main>
  )
}
