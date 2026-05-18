export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">
          Beratungs-Cockpit
        </p>
        <h1 className="font-serif mt-4 text-5xl leading-tight text-berry md:text-6xl">
          Hebammen<span className="italic text-orange">·</span>Vorsorge
        </h1>
        <p className="mt-6 text-lg text-ink/80">
          Klarheit über Steuer, Förderungen und Altersvorsorge – im Gespräch.
        </p>
        <p className="mt-12 text-sm text-muted">
          Foundation steht. Wizard und Auswertung folgen in Schritt 2.
        </p>
      </div>
    </main>
  );
}
