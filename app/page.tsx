import { EscaneoCamara } from "@/components/EscaneoCamara";
import { FAQ } from "@/components/FAQ";
import { Cafecito } from "@/components/Cafecito";

export default function Home() {
  return (
    <main className="mx-auto max-w-xl px-5 pt-10 sm:pt-16 pb-20 flex flex-col gap-16">
      <header className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-line)] bg-white/70 backdrop-blur px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-600">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Ley 27.642 · Argentina
        </div>
        <h1 className="mt-5 font-serif text-5xl sm:text-6xl leading-[1.02] tracking-tight">
          Sacale una foto y <em className="italic underline decoration-amber-400 decoration-[3px] underline-offset-[6px]">averiguá qué te estás comiendo</em>.
        </h1>
        <p className="mt-5 text-stone-600 text-[15px] leading-relaxed max-w-md mx-auto">
          Subí la tabla nutricional de cualquier envase y la app calcula los
          octógonos que le corresponderían según el perfil OPS — el mismo que
          usa la ley argentina.
        </p>
      </header>

      <EscaneoCamara />

      <FAQ />

      <Cafecito variant="card" />

      <footer className="text-center text-xs text-stone-500 flex flex-col gap-3 items-center">
        <p className="max-w-sm leading-relaxed">
          Hecho para defender el derecho a saber qué comemos. Basado en el
          perfil de nutrientes OPS, Ley 27.642 y Decreto 151/2022.
        </p>
        <p className="text-stone-400">
          Código abierto ·{" "}
          <a
            href="https://github.com/"
            rel="noopener noreferrer"
            target="_blank"
            className="underline hover:text-stone-700"
          >
            Mirá el repo
          </a>{" "}
          · Hecho por{" "}
          <a
            href="https://cafecito.app/rodolofpardo"
            rel="noopener noreferrer"
            target="_blank"
            className="underline hover:text-stone-700"
          >
            Rodolfo Pardo
          </a>
        </p>
      </footer>
    </main>
  );
}
